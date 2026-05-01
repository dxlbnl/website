---
pageType: note
title: 'Lists v2 — Offline-First Architecture'
date: 2026-04-25
kind: BUILD
tags: [SvelteKit, Supabase, Offline-First, Real-time]
images: [hero.png]
lede: 'Rebuilding the lists app with full offline support, seamless sharing, and passwordless authentication.'
---

When I first built the syncing shopping list app, it was about one thing: making sure the grocery list actually lived on both our phones. It used Server-Sent Events (SSE) and worked well enough, even with some semi-offline support, but it was brittle. There was no real authentication, and relying on "security by obscurity" with secret URLs isn't really a long-term plan.

Over the last few days, I’ve ripped out the plumbing and rebuilt it. The goal was to keep that instant, real-time feel but make the whole thing "Lab-Bench" solid—offline-first, actually secure, and zero friction.

## The Stack

SvelteKit and Svelte 5 are my go-to stack, and they feel especially right for this kind of reactive UI. The data now lives in Supabase (PostgreSQL). I actually tried Neon first, but realized that getting Realtime sync to work between Vercel and Neon just wasn't possible at the time, so I made the jump to Supabase for the integrated Realtime and RLS features.

The real work happens in a custom `SyncManager` I wrote to handle the local-to-remote bridge. It manages the delta resolution and offline queueing so the interface never hangs waiting for a handshake. Zod keeps the data types honest across the wire.

## Key Features

### 1. Full Offline Support

The app is now properly offline-first. You can check items off in a basement or a lead-lined bunker; it doesn't care. It writes to a local database immediately, and the `SyncManager` pushes the changes to the server whenever it finds a connection. We're using an atomic query on the backend to keep the syncs fast and consistent.

### 2. Anonymous & Registered Users

I hate forced sign-ups. You can start a list the second you open the app—no account needed. If you want to share that list or see it on your laptop, you can register later. Your local data just merges into your new account. It’s seamless.

### 3. Custom Passwordless Auth

Passwords are a chore for a utility app like this. I rolled a custom passwordless flow on the SvelteKit backend using magic links. It signs its own ES256 (ECC P-256) JWTs to handle authorization with Supabase. No passwords to remember, and no database of hashes for me to leak.

### 4. Explicit Sharing

No more "secret" public URLs. Sharing is now explicit and secure. I’m using PostgreSQL Row Level Security (RLS) policies to make sure your lists are only visible to the people you’ve invited.

### 5. The Overview

Since I’m using this for more than just groceries now—project notes, hardware to-dos, random ideas—the UI needed to scale. The new dashboard gives a high-contrast, technical overview of every list you own or follow.

The result is an app that finally feels like a professional tool. It’s as fast as a local notepad but syncs like a cloud app.

You can check out the live app at [list.dxlb.nl](https://list.dxlb.nl).
