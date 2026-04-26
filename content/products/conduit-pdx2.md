---
pageType: product
id: conduit-pdx2
name: Conduit PDX-2
description: Power your entire Eurorack from a laptop charger - studio-grade silence in 4HP
status: coming-soon
category: Power
tags: [Power Supply, USB-C, PD, Utility]
# tindieUrl: https://www.tindie.com/stores/dexterlabs/
image: /images/products/conduit.webp
price: 200
specs:
  Width: 4 HP
  Depth: 35mm (Skiff Friendly)
  Input: USB-C Power Delivery (20V)
  '+12V Output': 3.0A Continuous / 5A Peak
  '-12V Output': 1.5A Continuous
  Switching Freq: 2.2 MHz
  Protection: Short Circuit, Thermal, Reverse Voltage, TVS
---

## Overview

Ditch the bulky brick transformer. The **Conduit PDX-2** powers your entire Eurorack case from any USB-C laptop charger - with studio-grade performance in just 4HP.

At 35mm deep, it delivers massive clean power (3A on +12V, 1.5A on -12V) while staying completely silent. No audible whine, no interference with your audio signals. Enough power for 15+ modules from something that fits in your laptop bag.

## See Your Power Draw in Real-Time

The "Reactor Core" display on the front panel shows exactly what your case is pulling. **Dual 5-segment bar graphs** visualize +12V and -12V current consumption in real-time.

**What you can do with it:**

- Spot which modules are power-hungry at a glance
- Catch transient spikes when patching
- Know when you're approaching your power limit
- Debug power issues without pulling out a meter

Instant analog feedback - no lag, no guessing. Industrial aesthetic with matte black PCB and translucent light pipes.

## Silent Power

Switching supplies can introduce audible whine and noise into sensitive analog circuits. The PDX-2 is designed to stay quiet.

**How it achieves silence:**

- 2.2 MHz switching frequency (far above audible range - no PSU whine)
- Multi-stage filtering with low-ESR polymer capacitors
- Inverting buck-boost topology for clean negative rail (not a noisy charge pump)

The result: clean voltage rails that won't compromise high-gain stages, precision oscillators, or clock generators.

## Your Modules Stay Safe

The PDX-2 includes a **hardware sequencing interlock** that prevents module damage during power-up.

**What it does:**
The -12V rail won't turn on until +12V is stable. This prevents "latch-up" failures that can destroy op-amp based modules during startup.

**Protection systems:**

- **Short circuit shutdown** - saves your modules from wiring mistakes
- **Thermal shutdown** - protects under extreme loads
- **Reverse voltage clamps** - guards against power bus errors
- **TVS input suppression** - handles voltage spikes from power sources

## Power From Anywhere

Bring your case wherever there's USB-C power:

- Coffee shop (your laptop charger)
- Studio (dedicated USB-C PD brick)
- On location (USB-C battery pack with 20V support)
- Live performance (share power with your laptop)

Just plug in any USB-C PD charger that supports 20V at 45W or higher (65W recommended for headroom). The PDX-2 negotiates the voltage automatically.

## Flexible Connectivity

**Output options:**

- **Screw terminals (rear):** Direct wiring to bus boards with 18AWG wire
- **16-pin IDC header:** Standard Eurorack connection

Use screw terminals for permanent installations with thick wire and low resistance. Use the IDC header for standard ribbon cables.

## Technical Specifications

| Rail | Current Output           | Enough For...               |
| ---- | ------------------------ | --------------------------- |
| +12V | 3.0A continuous, 5A peak | 15+ VCOs or complex modules |
| -12V | 1.5A continuous          | Balanced analog stages      |

**Total system power:** 54W continuous

**Physical:**

- Width: 4 HP (20mm)
- Depth: 35mm (fits skiff cases)
- Switching frequency: 2.2 MHz (inaudible)

## Status

Currently in final hardware validation. Expected release: Q2 2025.

## What's Included

- Conduit PDX-2 module (fully assembled and tested)
- M3 mounting screws (black oxide)
- Quick start guide

**Note:** USB-C PD power brick and cable sold separately. Minimum 45W with 20V support required (65W recommended for headroom). Most modern laptop chargers work perfectly.

## Compatibility

**Works with:**

- Any USB-C PD charger supporting 20V (45W minimum, 65W recommended)
- Standard Eurorack 16-pin bus (Doepfer/Intellijel format)
- Skiff cases (35mm depth)

**Tested with:**

- Apple 61W/67W USB-C chargers (MacBook)
- Anker PowerPort Atom PD 60W+
- Dell/HP/Lenovo laptop chargers with USB-C PD

**Compatible bus boards available separately.**
