---
pageType: note
title: Shipping the Site
date: 2026-05-01
tags: [design, engineering, sveltekit]
kind: project-log
images: [dexter-working.png]
lede: Turning a messy functional prototype into a stable place to document the work and sell hardware.
---

I built this site because I needed a place to document the process and a way to sell the modules I’m finishing. It started as a functional prototype, but it’s hardened into what I’m calling a "Public Lab Bench"—part working repository, part professional storefront.

I’m no designer. My initial prototypes worked, but they didn’t look like instruments. To fix that, I used `claude-design` to iterate on the visuals. It saved me from getting stuck in Figma for weeks and helped lock in the phosphor-inspired aesthetic I was after: high-contrast, monospaced, and strictly functional.

The last few weeks have been a deep dive into the engineering details I usually ignore. Stripe integration, mailings, optimizing for pagespeed, and legal documents. It feels like "unnecessary" work until you realize you can't sell hardware without a checkout that actually works. I even spent way too much time on OpenGraph images just to make sure shared links don't look like generic broken previews.

The plumbing is done. I’m moving the Stripe keys to live this week. I’m happy with the result—it’s fast, it’s clean, and the bench is finally ready for the modules.
