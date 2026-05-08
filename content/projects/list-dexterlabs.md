---
pageType: project
slug: list-dexterlabs
title: Lists
description: A real-time shared list app — groceries, todos, whatever. Built with SvelteKit and Server-Sent Events.
tags: [SvelteKit, TypeScript, Real-time]
image: media/lists-dark.png
imageLight: media/lists-light.png
github: https://github.com/dxlbnl/list
url: https://list.dexterlabs.nl
date: 2025-12-28
stack:
  Framework: SvelteKit
  Realtime: Supabase
  Deployment: Vercel
  Language: TypeScript
---

**SvelteKit** handles routing and SSR. **Supabase** provides the real-time sync layer — list updates broadcast instantly to all connected clients over WebSockets without any custom backend code. The UI is intentionally minimal: one list, one input, items check off live as others walk through the store.
