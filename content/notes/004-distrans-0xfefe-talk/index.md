---
pageType: note
title: 'Building Distrans AR-1 with AI (0xFEFE)'
date: 2026-04-17
kind: TALK
tags: [Hardware, Distrans AR-1, AI, Talk]
images: [distrans.jpg, circuit.png]
lede: 'A talk at 0xFEFE about using AI to design hardware - what actually worked, what exploded, and why structure beat cleverness.'
productId: distrans-ar1
---

I recently gave a talk at 0xFEFE about the Distrans AR-1 project. The core message was pretty simple: getting AI to help design hardware is both incredible and incredibly frustrating.

When I started out during the COVID lockdowns, I was a Eurorack hobbyist plugging things in and hoping they wouldn't burn down the rack. Transitioning from that to designing an actual module-dealing with ±12V rails, TDM audio, and getting it all to talk to an RP2040-was a brutal learning curve. I figured I could just chat with an LLM and it would write my schematics. I was wrong. The early attempts ended in a series of very literal hardware failures.

The breakthrough wasn't a better model. It was structure. I had to pivot from "AI-chatting" to a disciplined, wiki-based engineering workflow. Instead of asking the AI to build me a module, I started documenting my design constraints in a local repository. If you constrain the agent with hard rules about safe voltage ranges and buffer depths, it stops suggesting impossible topologies and starts acting like a proper assistant.

The Distrans AR-1 is the result of that workflow. It bridges Eurorack and the studio, capturing 48kHz WAVs directly to an SD card while streaming USB audio. The hardware didn't spontaneously assemble itself. I still had to route the traces and debug the signal chain. But offloading the heavy lifting of DSP algorithms and boilerplate Rust/C++ code to an agent meant I actually finished the project.

It isn't magic. It's just a different kind of compilation step. You still have to know what you want to build.

_(This is a summarized log of the 0xFEFE presentation. Full schematics and firmware notes for Distrans are in the Catalogue.)_
