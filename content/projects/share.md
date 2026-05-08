---
pageType: project
slug: share
title: Private Share
description: Easily share text and files across your devices — nothing is stored on the server.
tags: [WebRTC, SvelteKit, TypeScript]
image: media/share-dark.png
imageLight: media/share-light.png
github: https://github.com/dxlbnl/website
url: https://www.dexterlabs.nl/share/
date: 2025-06-01
stack:
  Framework: SvelteKit
  Transport: WebRTC data channels
  Database: Neon (Postgres)
  Validation: Zod
  Language: TypeScript
---
**WebRTC** data channels handle the actual transfer — files are chunked and streamed directly between browsers, nothing touches a server. A lightweight **SvelteKit** signalling layer (backed by **Drizzle** on **Neon**) handles session discovery: nearby devices show up automatically, and trusted devices are remembered by device ID across sessions. **Zod** validates every message on both ends.
