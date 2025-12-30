---
pageType: product
id: distrans-ar1
name: Distrans AR-1
description: Bridge Eurorack and studio - USB interface, standalone recorder, zero-latency I/O in 6HP
status: coming-soon
category: Interface
tags: [Audio Interface, Recorder, USB, Utility]
tindieUrl: https://www.tindie.com/stores/dexterlabs/
image: /images/products/distrans-ar1.jpg
price: 250
specs:
  Width: 6 HP
  Audio Resolution: 48kHz / 24-bit PCM
  Architecture: Dual-Core System
  Recording: WAV (RIFF), Stereo
  Storage: MicroSD/SDHC (FAT32)
  USB: Class Compliant UAC 1.0
  Power: USB-C Bus Powered
---

## Overview

The **Distrans AR-1** bridges your Eurorack with the studio world. Record patches directly to SD card, stream audio to your DAW, send Eurorack to PA, or process external audio through your modular - all in one 6HP module.

Standalone recorder, USB audio interface, and zero-latency format converter. USB-C powered, no drivers needed, works with any computer.

## Record Patches Without a Computer

Hit the button, record your patch. Studio-quality 48kHz/24-bit WAV files straight to MicroSD card.

**What you get:**
- Capture improvisations and happy accidents instantly
- No DAW required - just press and play
- Hours of recording on a single card
- Drag files straight to your computer later

The AR-1 never drops a sample. Dedicated dual-core design keeps audio processing isolated from file writing - your recordings stay pristine even during intensive SD card writes.

## How Audio Flows

The AR-1 is a routing hub between Eurorack and the studio world.

### Eurorack Input → Three Destinations

Plug your Eurorack signal into the 3.5mm inputs. It gets routed to:

**1. Balanced outputs (XLR/TRS)** - Zero-latency hardware path to PA, mixer, or monitors. No conversion delay.

**2. USB audio to computer** - Stream into your DAW. No drivers needed.

**3. SD card** - Press button to record.

All three paths run simultaneously. Record while sending to PA. Stream to DAW while recording backup to card.

### Balanced Input → Eurorack Output

Plug balanced studio gear (XLR/TRS) into the AR-1. It gets sent to Eurorack outputs (3.5mm jacks).

**Use cases:**
- Process studio recordings through Eurorack effects
- Run vocals through your modular
- Transform stems through your filter bank

### USB Audio → Eurorack Output

Send audio from your computer to the AR-1 via USB. It gets mixed with the balanced input and sent to Eurorack outputs.

**Use cases:**
- Process DAW tracks through modular in real-time
- Use soft synths as modulation sources
- Run computer audio through Eurorack effects chain

Digital mixing with automatic gain staging (-6dB on each source) prevents clipping when combining inputs.

## One Button Control

**Short press:** Mute output (quick kill switch)
**Long press (2s):** Start/stop recording
**Double-click (when muted):** USB disk mode (drag files off card)

RGB VU meter shows system status and audio levels at a glance.

## RGB VU Meter

Real-time visual feedback for status and levels.

**Center LED (status indicator):**
- Breathing white: Monitoring active
- Solid amber: Muted
- Pulsing red: Recording
- Solid blue: USB disk mode
- Flashing red: Error (check SD card)
- Green flash: Card mounted

**Outer LEDs (VU meters):**
- Left/right channel level indication
- Green: Healthy signal (-∞ to -6dB)
- Yellow: Getting loud (-6dB to -1dB)
- Red: Clipping (0dB)
- RMS bars with floating peak indicators

## Hot-Swappable SD Cards

Swap cards on the fly. The AR-1 polls for card presence every 500ms.

**During idle:** Safe unmount, insert new card, keep going.

**During recording:** Removes current card, terminates file safely, saves buffer. Your recording up to that point is preserved.

## Never Lose a Recording

Power cut during recording? Your file is safe.

The AR-1 uses "dirty header" protection. When you start recording, it writes a valid file header immediately. If power is lost, the file remains readable - you keep everything up to that point.

Auto-increment file naming: `REC_001.WAV`, `REC_002.WAV`, etc. Scans card on boot for the next available number.

## Works With Everything

**Class compliant USB audio** - plug into any computer, tablet, or phone. No drivers, no setup. Windows, macOS, Linux, iOS - it just works.

**Connections:**
- Eurorack: 3.5mm jacks (handles ±10V)
- Studio: XLR/TRS balanced (+4dBu)
- Computer: USB-C (audio + power)

**Storage:**
- MicroSD/SDHC up to 32GB
- FAT32 filesystem
- Drag-and-drop via USB disk mode

## Use Cases

**Live performance:**
- Record set without laptop
- Send Eurorack to PA while recording backup
- Hot-swap cards between performances

**Studio production:**
- Track modular into DAW
- Bounce stems to SD for arrangement
- Record multiple takes to card

**Hybrid workflows:**
- Process DAW tracks through Eurorack
- Transform studio audio through modular
- Use computer as audio source for modulation

**Practice and experimentation:**
- Capture every patch idea
- Build recording library
- Review sessions without setup

## Technical Specifications

**Audio:**
- Resolution: 48kHz / 24-bit PCM (all paths)
- Format: Stereo WAV (RIFF)
- Eurorack I/O: AC coupled, ±10V headroom
- Balanced I/O: +4dBu nominal

**Recording:**
- Media: MicroSD/SDHC (FAT32)
- Capacity: Up to 32GB
- File format: 24-bit WAV with BWF timestamps
- Protection: Power-loss safe recording
- Hot-swap: Supported

**USB Audio:**
- Class: UAC 1.0 (class compliant)
- Streams: 2ch in + 2ch out, 24-bit, 48kHz
- Compatibility: Windows/macOS/Linux/iOS
- Power: USB-C bus powered

**Physical:**
- Width: 6 HP
- Power: USB-C (no Eurorack power needed)

## Status

Currently in firmware development. Expected release: TBD 2025.

## What's Included

- Distrans AR-1 module (fully assembled and tested)
- Mounting hardware
- Quick start guide

**Note:** USB-C cable and MicroSD card not included.
