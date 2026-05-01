---
pageType: note
title: 'Conduit PDX-1 — Quiet USB-C Power for Eurorack'
date: 2025-10-30
kind: HARDWARE
tags: [Hardware, Eurorack, USB-C, Power Supply, PCB]
images: [conduit.jpg]
lede: "Building a USB-C powered Eurorack supply that doesn't sound like a swarm of bees — and iterating toward something actually shippable."
productId: conduit-pdx2
---

I’ve been iterating on the Conduit PDX for a while now. There aren't many USB-to-Eurorack solutions out there that actually deliver enough power without sounding like a swarm of bees, so I decided to build my own.

The first prototypes (the ones I posted on Instagram back in October) were a good start, but I’ve already moved on to the next iteration: the **Conduit PDX-2**.

I’ve just finished the PCB layout for V2. The most significant change is that I’ve dropped the +5V rail entirely. Most modern modules don’t even use it, and for the ones that do, I’m thinking about a separate, tiny bus adapter project to introduce it back onto the bus if required. Dropping it let me focus all the board space on the +/-12V rails and some diagnostic features I've been wanting.

The new design is a 4HP "Reactor Core." I've added a dual analog current visualizer on the front panel—two 5-segment bar graphs driven by zero-latency analog logic. It gives you instant feedback on your power draw and transient spikes. It’s got that sci-fi industrial aesthetic I love: matte black PCB faceplate with exposed gold circuitry.

Under the hood, it’s still all about audio-grade silence. I'm using a 2.2 MHz switching architecture to keep any whine far above the audible range, paired with a multi-stage Pi-filter topology. It’s designed to deliver 3.0A on the +12V rail and 1.5A on the -12V, which is plenty of juice for a high-density travel case.

The layouts are done, and I’m about to pull the trigger on the PCB order.

_(Images coming soon — I'm getting the source files ready and will optimize them for the site.)_
