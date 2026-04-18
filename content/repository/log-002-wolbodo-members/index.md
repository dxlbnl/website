---
pageType: repository
title: "Members, SSO, and Sub-requests"
date: 2023-06-20
tags: [SvelteKit, Hasura, GraphQL, Houdini, SSO, Nginx]
images: [media/hero.png]
---

I’ve been iterating on the members system for Wolbodo for a while now, and I’m finally happy with how it turned out. It’s one of those projects that looks simple on the surface but solves a very specific, annoying problem: how do you manage a society's membership and access control without becoming a full-time sysadmin? 

The stack is a personal favorite: SvelteKit, Hasura, and Houdini. I’ve tried a few GraphQL clients, but Houdini is the first one that actually feels like it belongs in Svelte. It generates stores directly from your `.gql` files, so you get full type safety and reactive updates without the usual boilerplate. It’s been a joy to build with—it honestly makes the frontend logic feel like it’s just an extension of the database.

But the thing I’m most proud of is the SSO setup. I really didn't want to deal with the complexity of OIDC or SAML just to secure a private wiki. So I went with something much simpler: Nginx sub-requests.

The way it works is honestly elegant in its simplicity. Our Nginx reverse proxy just asks the members app, "Hey, is this person allowed here?" for every request to our internal tools. The app checks the session cookie, returns a 200, and Nginx passes them through. It even injects user info into the headers so the backend services know who they’re talking to. It’s fast, "dumb" in the best way possible, and has been rock solid since I deployed it.

If you're looking for a lightweight way to handle members and SSO, the repo is here: [https://github.com/wolbodo/members](https://github.com/wolbodo/members)

