---
id: B17
title: Require device ownership proof to read WebRTC SDP data
type: bug
priority: high
created: 2026-05-21
---

## Description

`src/routes/api/share/[id]/+server.ts:18` returns the full WebRTC offer/answer SDP objects to anyone who knows a session ID. SDP data contains ICE candidates (IPs, ports), DTLS fingerprints, and media codec details. An attacker who enumerates session IDs gains network topology information for all active share sessions.

The fix: require the caller to prove they own either the `hostDeviceId` or `guestDeviceId` before returning SDP — for example by passing the deviceId in a header or body and checking it against the stored session. Only return the SDP side relevant to that device.

## Notes

- `src/routes/api/share/[id]/+server.ts` GET handler, lines 18-34
- Session data stored in `shareSessions` table — includes `hostDeviceId`, `guestDeviceId`, `offer`, `answer`
- Share sessions are ephemeral but IDs are guessable if short; enumeration is realistic
