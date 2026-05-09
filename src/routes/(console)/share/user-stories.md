# Share App — Scenarios, Spec & Refactor Plan

## Context

The Share app (`src/routes/(console)/share/`) is a peer-to-peer WebRTC file/text sharing tool with REST signalling (SvelteKit API + Neon Postgres). Users report "sync issues and setting up the connection."

Before touching code: enumerate every user scenario, define exact expected behaviour for each, identify where the current implementation diverges, and derive a test suite from the scenarios. Implementation comes last.

---

## How the app works (current architecture)

```
Host creates offer → POST /api/share  →  sessionId + QR/URL
Guest opens link  → GET /api/share/[id]  →  offer SDP
Guest creates answer → PUT /api/share/[id]
Host polls GET every 2s → sees answer → approve/deny
Guest polls GET every 2s → sees approved flag → connects WebRTC
Idle devices poll GET /api/share/pending?for=<deviceId> every 3s → discover nearby/invites
```

Trust is stored in `localStorage` on each side separately. Sessions expire after 5 minutes from the Neon DB.

---

## Actors

- **A** = host (started the session)
- **B** = guest (joining via URL/QR or nearby discovery)
- **Trusted** = device ID is saved in the other party's `share-trusted` localStorage key

---

## Scenarios

### Group 1 — Clean slate (no prior relationship)

---

#### CS-1 · A starts session, nobody joins → timeout

**Expected:**  
Session auto-refreshes with a new QR/URL. A stays in `waiting` state. No error shown.  
Rationale: the user hasn't done anything wrong. They just need to try again.

**Current behaviour:**  
`fail(new Error('Host did not announce in time'))` → `phase = 'error'`. User must manually click "try again".

**Fix required:** On host poll timeout, call `startSession(myName)` again instead of `fail()`. The new session ID replaces the old one; QR updates reactively.

**Tests:**

- Mock fetch: never returns `answer` for 30 s
- Verify `phase` stays `'waiting'` throughout (never `'error'`)
- Verify `sessionId` changes after 30 s (new session created)
- Verify `shareUrl` updates to reflect new session ID

---

#### CS-2 · A starts, B joins, A denies

**Expected:**

- B's phase → `'denied'` (sees "Connection was declined")
- A's phase → `'waiting'` (same session, same QR, ready for next guest)
- A's poll resumes cleanly — exactly one poll loop running

**Current behaviour:**  
B sees denied correctly. A does return to `waiting` and calls `pollHost()` again, but there's a poll-stack risk: `denyGuest()` calls `pollHost()` synchronously, and the previous interval's async callback may still be in flight when it does. Two poll ticks can race and both try to set `phase`.

**Fix required:** Replace `setInterval` with a non-overlapping async loop that respects an `AbortSignal`. Starting a new poll aborts the old one atomically.

**Tests:**

- Start session → receive answer → deny → verify `phase = 'waiting'`
- Verify exactly one active poll after deny
- Verify B's `phase = 'denied'` when polling returns `denied: true`

---

#### CS-3 · A starts, B joins, A allows (no remember)

**Expected:**

- Both → `phase = 'connected'`, chat opens
- B is in A's trusted list: NO
- A is in B's trusted list: YES (hosts who approved you are auto-trusted by guests)
- Next time B joins A's session: A still sees approval dialog

**Design decision:** Trust is asymmetric by design. Guests auto-trust hosts because the host already vetted them. Hosts must explicitly opt-in via "Remember this device."

**Tests:**

- After connect: `A.trustedPeers` is empty, `B.trustedPeers` contains A's device ID
- Reconnect: A sees approval dialog again

---

#### CS-4 · A starts, B joins, A allows + remembers

**Expected:**

- Same as CS-3 but B is now in A's trusted list
- Next time B joins A's session: auto-approved (no dialog)

**Tests:**

- After connect: `A.trustedPeers` contains B's device ID
- Start new session → B joins → verify `phase` skips `'approving'` and goes straight to `'connecting'`

---

#### CS-5 · A starts, B joins, A is slow to approve (guest timeout)

**Expected:**

- After 30 s without approval: B's `phase = 'error'`, message "Host did not approve in time"
- A's session stays alive and waiting for the next guest

**Current behaviour:** Works, but A's poll is cleared on guest timeout, so A would need to manually restart. A should stay in `waiting` with a fresh poll.

**Fix required:** When guest times out server-side (no `approved` or `denied` flag after 30 s), B enters error state. A should remain in `waiting`; the poll should continue running regardless.

**Tests:**

- Mock approval never arriving; B's phase = `'error'` at ~30 s
- A's phase remains `'waiting'`, poll is still running

---

#### CS-6 · B has the link, A refreshes page mid-wait

**Expected:**

- A reloads → URL still has `?s=<id>` → `resumeHostSession()` fires → new offer posted to server → DB clears old answer/approval
- If B was already in `guest-waiting`: B's next poll tick detects `offer` has changed → B automatically re-joins (re-submits answer)
- A sees a new approval dialog for B

**Current behaviour:**  
`resumeHostSession()` logic exists and works. BUT: B's re-join detection (`data.offer !== guestOffer`) has a race condition. `guestOffer` is initialised to `''`. The guard `data.offer && guestOffer && data.offer !== guestOffer` silently skips the comparison on the _first_ poll tick (because `guestOffer === ''`). If the host refreshes between B submitting the answer and B's first poll tick, `guestOffer` gets set to the _new_ offer on that first tick — and there's nothing to compare against. B will poll forever waiting for approval that will never come.

**Fix required:** Initialise `guestOffer` immediately from the offer fetched in `joinSession()`, before the poll loop starts.

**Tests:**

- Simulate: B joins, host refreshes (new offer in DB) before B's first poll tick
- Verify B enters `'guest-answering'` again (re-join triggered)
- Verify A sees approval dialog for B after the re-join

---

#### CS-7 · B opens a stale/expired link (>5 min old)

**Expected:**

- `GET /api/share/[id]` returns 404
- B sees "Session not found or expired" error

**Current behaviour:** `fail('Session not found')` → error phase ← works correctly.

**Tests:**

- Mock `GET` returning 404 → `phase = 'error'`, `errorMsg` contains "not found"

---

#### CS-8 · Two guests (B and C) try to join simultaneously

**Expected:**

- First to submit answer (B) proceeds normally
- Second (C) gets a "Session already has a pending connection" error (409)
- Once B is approved/denied, session becomes available again

**Current behaviour:** No locking. C's PUT overwrites B's answer. A sees C's name in the approval dialog. B is silently dropped and eventually times out.

**Fix required:** In `PUT /api/share/[id]`, check: if `session.answer` is already set AND `session.approved = false` AND `session.denied = false`, return 409 "Session busy". Clear the lock when the session is approved, denied, or on the next offer update.

**Tests:**

- Submit two concurrent PUTs; verify second returns 409
- After approval/denial of first, verify a new PUT succeeds

---

#### CS-9 · Nearby discovery (same IP, B discovers A's broadcast session)

**Expected:**

- A has an active session (broadcast, no targetDeviceId)
- B opens Share page on same network
- B's pending poll returns A's session in `nearby`
- B sees A in "Available devices" with a "Join" button

**Current behaviour:** Works correctly. The pending API filters by IP and returns up to 3 nearby broadcast sessions.

**Tests:**

- Mock pending API returning a nearby session
- Verify `nearbySessions` state is populated
- Verify ShareSetup renders the peer with a Join button

---

### Group 2 — Trusted / returning device

---

#### TR-1 · A and B are mutually trusted. B joins A's broadcast session (auto-approve)

**Expected:**

- A's poll receives B's answer
- `isTrusted(B.deviceId)` is true → skip approval dialog
- Direct transition `'waiting'` → `'connecting'` → `'connected'`
- B's side: normal `'guest-waiting'` → poll returns `approved: true` → `'connecting'`

**Current behaviour:** Auto-approval works but triggers `approveGuest()` from within an async `setInterval` callback — if the interval fires again before `approveGuest` resolves (unlikely but possible), state is touched twice.

**Fix required:** The non-overlapping poll loop eliminates this.

**Tests:**

- Setup trusted peer → receive answer from that peer → verify `phase` never equals `'approving'`
- Verify `phase` goes `'waiting'` → `'connecting'`

---

#### TR-2 · A sends directed invite to B (A clicks "Connect" next to trusted B)

**Expected:**

- A creates session with `targetDeviceId = B.id`
- B's pending poll calls `GET /api/share/pending?for=<B.id>`
- Server returns this directed session as `invite`
- B sees "A is inviting you to connect" (`'guest-invited'` phase)
- B accepts → joins session → A auto-approves (B is trusted)

**Current behaviour:** BROKEN. The pending API only returns `isNull(shareSessions.targetDeviceId)` for invites — explicitly excluding directed sessions. B will never discover A's directed invite via polling. The "Connect" button for offline trusted devices creates a session nobody will find.

**Fix required:** Update `GET /api/share/pending`: also query for `eq(shareSessions.targetDeviceId, forDevice)` as a separate invite check (higher priority than broadcast invites).

**Tests:**

- Create directed session in DB with `targetDeviceId = B.id`
- Query pending with `for=B.id` → verify `invite` is returned
- Verify session with `targetDeviceId = C.id` is NOT returned for `for=B.id`

---

#### TR-3 · Directed invite, B is offline — A's session expires

**Expected:**

- A's session ages out of DB (5 min)
- A's host poll gets 404 → session expired
- A returns to `'idle'` (not `'error'`), no QR to refresh since this was a directed invite
- Display: "B didn't respond. Session closed."

**Current behaviour:** 404 → `fail()` → error state. Should distinguish directed-timeout from connection error.

**Fix required:** On 404 during host poll, if `directedTo` is set → return to `'idle'` with a brief status message. If no `directedTo` (broadcast), auto-refresh as per CS-1.

**Tests:**

- Start directed session, mock GET returning 404 → verify `phase = 'idle'`
- Start broadcast session, mock GET returning 404 → verify new session created, `phase = 'waiting'`

---

#### TR-4 · B had A trusted, but cleared localStorage (fresh device ID)

**Expected:**

- B has a new device ID — no trusted list
- B opens a share link, joins
- A's auto-approval check fails (new device ID not in trusted list)
- A sees approval dialog for B
- B can still connect; they just need re-approval

**Current behaviour:** Works correctly. Trust is keyed on device ID.

**Tests:**

- Attempt join with an unknown device ID → verify `isTrusted()` returns false → `phase = 'approving'`

---

#### TR-5 · Connected session is re-joined by a third device

**Expected:**

- A and B are connected
- C opens A's share link, submits answer
- Server should reject C's PUT (session already approved)
- C sees "Session in use" error

**Current behaviour:** C's PUT overwrites B's answer. `session.approved` is set to true by A's approval, but the PUT endpoint doesn't check for this. This could silently break A and B's connection if A's code re-reads the session.

**Fix required:** In `PUT /api/share/[id]`, if `session.approved = true`, return 409 "Session already connected."

**Tests:**

- Set `approved = true` in session, attempt PUT → verify 409

---

### Group 3 — Connected state

---

#### CO-1 · Text message exchange

**Expected:** Both sides send and receive text messages. Messages appear in order. Secret messages show a visual indicator.

**Tests:**

- Send text via data channel → verify `chat` array contains entry with correct content, direction, timestamp
- Send secret text → verify `secret: true` on entry

---

#### CO-2 · File transfer, happy path

**Expected:**

- Sender: file appears in chat immediately with `progress = 0`, updates to 1.0 on completion
- Receiver: file appears with progress updating, gets `blobUrl` on completion
- Text files show `textPreview` (first 12 lines)
- File chunks are assembled in correct order regardless of arrival order

**Current behaviour:** Chunks are pushed in arrival order, not index order. Out-of-order delivery (possible on lossy WebRTC paths) silently corrupts files.

**Fix required:** Store chunks by index: `f.chunks[msg.index] = ...`. On file-end, filter out any holes.

**Tests:**

- Send 3-chunk file with chunks arriving out of order (2, 0, 1)
- Verify assembled Blob matches original content exactly

---

#### CO-3 · File transfer interrupted (channel closes mid-transfer)

**Expected:**

- In-flight file card shows "Transfer interrupted" (not stuck at partial progress)
- `inFlight` map is cleared
- Phase transitions to error appropriately

**Current behaviour:** `inFlight` entries remain forever. File card stays at partial progress.

**Fix required:** In `ch.onclose` / `ch.onerror`, iterate `inFlight`, set `progress = -1` on each file chat entry, clear the map.

`FileCard.svelte` needs a small update to render `progress === -1` as an interrupted state.

**Tests:**

- Start receiving file (file-start received), close channel before file-end
- Verify `inFlight` is empty after close
- Verify file chat entry has `progress = -1`

---

#### CO-4 · Slow connection — buffer backpressure

**Expected:**

- Sender paces chunks when data channel buffer is full
- Sending does not hang indefinitely if channel is slow
- Absolute timeout of 5 s per chunk: if buffer doesn't drain in 5 s, abort transfer

**Current behaviour:** `waitForBuffer()` loops at 50 ms with no absolute timeout. Can hang forever on degraded connections.

**Fix required:** Add `deadline = Date.now() + 5000` check inside `waitForBuffer`.

**Tests:**

- Mock `dc.bufferedAmount` to always return above threshold
- Verify `waitForBuffer` resolves within ~5 s (with tolerance)

---

#### CO-5 · Reconnection after brief network drop

**Expected:**

- WebRTC `connectionState` goes `'disconnected'` → `isReconnecting = true` shown in ChatPanel
- If connection recovers: `isReconnecting = false`, chat resumes
- If connection goes `'failed'`: attempt to resurrect session (current behaviour via `resumeHostSession`)
- Files that were in-flight during the drop show interrupted state

**Tests:**

- Trigger `'disconnected'` state → verify `isReconnecting = true`
- Trigger `'connected'` state → verify `isReconnecting = false`
- Trigger `'failed'` state → verify reset + resurrection attempt

---

## Summary of fixes & additions

| ID                 | Type       | Fix                                                                             |
| ------------------ | ---------- | ------------------------------------------------------------------------------- |
| CS-1, CS-7-timeout | Bug        | Host poll timeout → auto-refresh session, not error                             |
| CS-2               | Bug        | Non-overlapping poll loop (AbortController)                                     |
| CS-5               | Bug        | Guest timeout → error; A stays in `waiting`                                     |
| CS-6               | Bug        | Init `guestOffer` from `joinSession` fetch, not from first poll tick            |
| CS-8               | Feature    | `PUT /api/share/[id]`: 409 if session already has pending unanswered request    |
| CO-2               | Bug        | Indexed chunk storage (fix file corruption)                                     |
| CO-3               | Bug        | `inFlight` cleanup + `progress = -1` on disconnect                              |
| CO-4               | Bug        | `waitForBuffer` absolute 5 s timeout                                            |
| TR-2               | Bug        | Pending API: return directed invites where `targetDeviceId = forDevice`         |
| TR-3               | Feature    | 404 on host poll: if directed → `'idle'`; if broadcast → auto-refresh           |
| TR-5               | Feature    | `PUT /api/share/[id]`: 409 if `session.approved = true`                         |
| —                  | Robustness | Formal state machine transition guard (`transition()` function)                 |
| —                  | Robustness | Adaptive `waitIce`: resolve on first relay/srflx, fall back to 3 s hard timeout |

---

## Test file structure

```
src/routes/(console)/share/
  share.test.ts              ← logic unit tests (server Vitest project, Node env)
  api-share.test.ts          ← API route tests (server project, mock DB)
```

### `share.test.ts` — state machine & protocol

Tests run in Node; mock `fetch`, `RTCPeerConnection`, `localStorage`, and `RTCDataChannel`.

```
describe('message parsing')
  - valid text message passes schema
  - valid file-start/chunk/end pass schema
  - unknown type rejected

describe('chunk assembly')
  - in-order: assembled correctly
  - out-of-order: assembled correctly (index-keyed storage)
  - file-end with missing chunks: holes filtered, blob still created

describe('binaryToBase64 / base64ToBinary roundtrip')
  - arbitrary Uint8Array survives encode → decode

describe('waitForBuffer timeout')
  - resolves within 5100 ms when buffer never drains

describe('host poll timeout → session refresh')
  - after 30 s of no answer, new session is created (startSession called)
  - phase stays 'waiting', never 'error'

describe('guest poll timeout → error')
  - after 30 s no approval, phase = 'error'
  - host session stays alive

describe('non-overlapping polls')
  - starting a second poll aborts the first
  - no concurrent fetch calls

describe('auto-approval')
  - trusted device ID skips 'approving' phase

describe('guestOffer initialisation')
  - offer captured before first poll tick
  - host refresh mid-wait triggers re-join

describe('state machine transition guard')
  - valid transition succeeds
  - invalid transition is a no-op (phase unchanged)
  - double 'connected' assignment is a no-op
  - all scenario paths use only valid transitions

describe('adaptive waitIce')
  - resolves immediately on srflx candidate
  - resolves immediately on relay candidate
  - resolves after 3 s if no suitable candidate arrives

describe('inFlight cleanup')
  - channel close clears inFlight map
  - affected file entry gets progress = -1
```

### `api-share.test.ts` — server endpoints

Use a real test DB or mock Drizzle queries.

```
describe('PUT /api/share/[id]')
  - succeeds when session has no answer
  - returns 409 when session already has pending unanswered answer
  - returns 409 when session.approved = true
  - returns 403 for wrong targetDeviceId

describe('GET /api/share/pending')
  - returns directed invite for targetDeviceId matching forDevice
  - does NOT return directed invite for other deviceId
  - returns broadcast session in nearby for same IP
  - does not return own sessions in nearby
```

---

## State machine transition guard

All phase mutations go through a single `transition(next: ShareState)` function that validates the move against a static transition table. Invalid transitions log a warning and no-op — they can't silently corrupt state.

```ts
const VALID: Record<ShareState, ShareState[]> = {
	idle: ['offering', 'guest-setup', 'guest-invited'],
	offering: ['waiting', 'error', 'idle'],
	waiting: ['approving', 'connecting', 'idle', 'error'],
	approving: ['connecting', 'waiting', 'error'],
	'guest-setup': ['guest-init', 'idle'],
	'guest-init': ['guest-answering', 'error'],
	'guest-answering': ['guest-waiting', 'error'],
	'guest-waiting': ['connecting', 'denied', 'guest-answering', 'error'],
	'guest-invited': ['guest-init', 'idle'],
	connecting: ['connected', 'error'],
	connected: ['error', 'idle'],
	denied: ['idle'],
	error: ['idle']
};
```

Eliminates the double-`phase = 'connected'` bug (both `openChannel` and `onconnectionstatechange` would no-op the second call). Tests can assert the exact sequence of transitions.

## Adaptive `waitIce`

Resolves immediately when the first relay (`relay`) or server-reflexive (`srflx`) candidate arrives — these indicate NAT traversal is available. Falls back to a 3 s hard timeout for cases where no reflexive candidate arrives (e.g. same LAN, or STUN blocked).

```ts
conn.addEventListener('icecandidate', (e) => {
	if (e.candidate === null)
		finish(); // gathering complete
	else if (e.candidate.type === 'relay' || e.candidate.type === 'srflx') finish(); // good enough
});
setTimeout(finish, 3000); // hard fallback
```

The previous 1.5 s timeout was too aggressive for slower STUN servers.

---

## Architecture change: extract logic to `share.svelte.ts`

All logic currently in `+page.svelte` moves to a `createShare()` factory in `share.svelte.ts`. `+page.svelte` becomes ~60 lines of rendering.

This is required for testability — the logic must be importable in Node without Svelte rendering.

### Files to create/modify

| File                                      | Action                                                                |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `share.svelte.ts`                         | **New** — all state + logic from `+page.svelte` (+ all fixes applied) |
| `share.test.ts`                           | **New** — unit tests covering all scenarios above                     |
| `api-share.test.ts`                       | **New** — API route scenario tests                                    |
| `+page.svelte`                            | **Shrink** — use `createShare()`, render only                         |
| `FileCard.svelte`                         | **Update** — render `progress === -1` as "Transfer interrupted"       |
| `src/routes/api/share/[id]/+server.ts`    | **Update** — 409 guards on PUT                                        |
| `src/routes/api/share/pending/+server.ts` | **Update** — add directed invite query                                |

---

## Implementation order

1. Write all tests first (they will fail — that's the point)
2. Extract logic verbatim to `share.svelte.ts`; confirm TypeScript passes
3. Fix bugs one by one until tests pass:
   - Add `transition()` guard + VALID table (state machine)
   - Indexed chunk storage (CO-2)
   - Non-overlapping poll loop with AbortController (CS-2)
   - `waitForBuffer` timeout (CO-4)
   - `guestOffer` initialisation (CS-6)
   - `inFlight` cleanup (CO-3)
   - Session refresh on timeout (CS-1)
   - Adaptive `waitIce` — 3 s + early-exit on srflx/relay
   - API 409 guards (CS-8, TR-5)
   - Pending API directed invite fix (TR-2)
4. Update `FileCard.svelte`
5. Slim down `+page.svelte`
6. Run full manual checklist (see below)

---

## Manual test checklist

```
[ ] CS-1  Start session, wait 30 s → QR refreshes, no error shown
[ ] CS-2  Start, B joins, deny → B sees declined, A stays waiting
[ ] CS-3  Start, B joins, allow (no remember) → connected; B trusts A, A doesn't trust B
[ ] CS-4  Start, B joins, allow + remember → B in A's trusted list
[ ] CS-5  Start, B joins, A ignores for 30 s → B sees timeout error
[ ] CS-6  Start, B joins, A refreshes → B re-joins, A approves again
[ ] CS-7  Open expired link → "Session not found" error
[ ] CS-8  Two guests join at once → second gets rejection
[ ] CS-9  Same network → A's session visible in B's nearby list
[ ] TR-1  Trusted B joins A's session → no approval dialog
[ ] TR-2  A clicks "Connect" next to B → B sees directed invite notification
[ ] TR-3  Directed invite, B offline → A returns to idle gracefully
[ ] CO-2  Send binary file → received file is byte-for-byte identical
[ ] CO-2  Out-of-order chunks → file still correct
[ ] CO-3  Send file, close tab mid-transfer → receiver sees "interrupted"
[ ] CO-4  Slow connection → send doesn't hang
[ ] CO-5  Brief disconnect → reconnecting indicator shown
```
