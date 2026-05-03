# Share Tool

> Sources: Internal, 2026-05-03
> Updated: 2026-05-03

## What it is

A direct, private channel between two of your own devices. Open `/share/` on both, and you can send passwords, notes, or files between them — without anything passing through a cloud service, email, or chat app.

Route: `/share/`.

## Modes

**Text** — freeform message, Shift+Enter for new lines, Enter to send.

**Secret** — input is masked while typing. The received message arrives blurred on the other side, with Copy and Hold-to-reveal buttons. Designed for passwords and tokens.

**Files** — attach one or more files. Images, video, and audio show inline previews. Text files show a preview of the first few lines. Anything else gets a download button. Drag-and-drop also works.

## Connection model

Two ways to connect:

- **First time / new device:** One device starts a session (QR code appears). The other scans it. The host approves the connection and can mark the device as trusted.
- **Trusted device:** After first setup, devices recognise each other. Open `/share/` on both — they connect automatically without scanning.

Only the connection handshake touches the server (a small signaling blob, valid for 10 minutes). All messages and files go directly device-to-device over WebRTC. Nothing is stored.

## Known limitations

- Both devices need `/share/` open at the same time.
- No history — messages exist only for the duration of the session.
- Works best on the same WiFi network. Mobile data connections may fail on restrictive networks (no relay server).

## See Also

- [Share Tool — implementation detail](../expertise/share-tool.md)
