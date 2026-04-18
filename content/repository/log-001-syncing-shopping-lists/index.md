---
pageType: repository
title: "Syncing Shopping Lists"
date: 2023-03-01
tags: [SvelteKit, SSE, Real-time, Security]
images: [media/hero.png]
---

In order to keep track of the groceries to get, without resorting to an analog list which is always out of sight, I created a syncing list app. 

The core of the system uses [Server-Sent Events](https://en.wikipedia.org/wiki/Server-sent_events) (SSE). It’s a really elegant way to sync multiple clients in real-time. Instead of polling the server or setting up complex WebSockets, the browser just listens for updates on a single stream. It’s simple, lightweight, and perfect for something like a shared grocery list where you want to see items being checked off as someone else walks through the store.

For now, the app utilizes unique links—all lists are public to whoever has the correct URL. It works, but it’s not ideal for privacy.

### The Path Forward: Security & Sharing

While the current version solves the immediate problem, I’m already planning a more robust iteration. The goal is to move away from public URLs and toward a proper account system, but without the friction of passwords.

- **Magic Login Links**: I want to implement a passwordless flow where you just enter your email and get a secure link to log in. It’s faster and fits the "utility" nature of the app.
- **Granular Sharing**: Instead of sharing a "secret" URL, I want to be able to explicitly share lists with other users.
- **Multiple Lists**: A proper dashboard to manage different lists—groceries, hardware supplies, "to-do" items.
- **Better Categorization**: Sorting items by department (Produce, Dairy, Hardware) to make the actual shopping trip more efficient.

The goal is to keep the simplicity of the SSE sync while adding the security and organization needed for a daily tool.

### Aesthetic Evolution: The Lab-Bench Protocol

As the functionality evolves, so does the visual language. I’m moving away from the purely functional, colorful rows of the first prototype toward a more structured, "Lab-Bench" aesthetic. It’s about high-contrast clarity, technical typography, and a UI that feels like a piece of laboratory equipment. 

The goal is to make the act of "checking off a grocery list" feel as precise and satisfying as calibrating an oscillator.

