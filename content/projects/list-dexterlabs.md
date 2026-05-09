---
pageType: project
slug: list-dexterlabs
title: Lists
description: Real-time shared lists — groceries, todos, whatever. Share across devices and users, no passwords needed.
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

**SvelteKit** handles routing and SSR. **Supabase** provides the real-time sync layer — list updates broadcast instantly to all connected clients over WebSockets without any custom backend code. Create as many lists as you need, share each one with whoever you want. Authentication is passwordless — a magic link is sent to your device, no credentials to remember.
