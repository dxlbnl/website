---
pageType: product
id: distrans-ar1
name: Distrans AR-1
description: Bridge Eurorack and studio - USB interface, standalone recorder, zero-latency I/O in 6HP
status: coming-soon
category: Interface
tags: [Audio Interface, Recorder, USB, Utility]
# tindieUrl: https://www.tindie.com/stores/dexterlabs/
image: /images/products/distrans-dune.webp
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

I built the AR-1 because I was tired of dragging a laptop to every jam just to record a stereo output. It's a 6HP bridge for exactly that: recording to SD, USB audio to your DAW, and balanced outputs for the PA. It does all three at once.

## No more "lost" patches

You just hit the button and it records. It writes 48kHz/24-bit WAVs straight to MicroSD. I went with a dual-core design specifically to keep the audio process isolated from the file writing. SD cards can be flaky and slow, but one core keeps the audio pristine while the other handles the "dirty" work of writing to the card. It's about capturing those one-off improvisations before you unpatch everything.

## Routing

The AR-1 is effectively a hub between your Eurorack and everything else.

- **Eurorack Out:** 3.5mm signals go to the balanced XLR/TRS (no latency), the USB-C port, and the SD card simultaneously.
- **Studio In:** You can bring XLR/TRS signals into your rack to run vocals through a filter or process DAW tracks through your effects chain.
- **Mixing:** The USB audio and balanced inputs get mixed together with a bit of automatic headroom (-6dB) so you aren't constantly fighting clipping.

## The "one button" problem

I hate menu diving, so everything is on one button. Short press to mute (the "panic" switch), long press to record, and a double-click to turn it into a USB disk so you can grab your files.

The RGB meter handles the rest. White means it's on, amber is muted, pulsing red is recording. It's simple enough to read from across the room. The outer LEDs give you standard VU feedback with RMS bars and peak indicators.

## Stability

Hardware fails, power gets bumped, and cards get pulled. The AR-1 handles this. If you pull the card mid-recording, it terminates the file safely. If the power cuts out, the data is still there because it writes a "dirty" header the second you hit record.

It's class-compliant, so you don't need drivers for anything. Just plug in the USB-C cable and it shows up as a 2-in/2-out interface on Windows, macOS, Linux, or iOS.

## Technical specifications

**Audio**

- Resolution: 48kHz / 24-bit PCM (all paths)
- Format: Stereo WAV (RIFF)
- Eurorack I/O: AC coupled, ±10V headroom
- Balanced I/O: +4dBu nominal

**Recording**

- Media: MicroSD/SDHC (FAT32)
- Capacity: Up to 32GB
- File format: 24-bit WAV with BWF timestamps
- Protection: Power-loss safe recording
- Hot-swap: Supported

**USB audio**

- Class: UAC 1.0 (class compliant)
- Streams: 2ch in + 2ch out, 24-bit, 48kHz
- Compatibility: Windows/macOS/Linux/iOS
- Power: USB-C bus powered

**Physical**

- Width: 6 HP
- Power: USB-C (no Eurorack power needed)

## Status

Currently in firmware development. Expected release: TBD 2025.

## What's included

- Distrans AR-1 module (fully assembled and tested)
- Mounting hardware
- Quick start guide

**Note:** USB-C cable and MicroSD card not included.
