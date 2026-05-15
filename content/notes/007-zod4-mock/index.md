---
pageType: note
title: 'zod4-mock: Deterministic Mock Data for Zod v4'
date: 2026-05-12
tags: [TypeScript, Testing, Zod, Open Source]
kind: OPEN-SOURCE
images: [screenshot.png]
lede: A zero-config, schema-driven mock library that generates byte-identical data from a seed, with built-in relational identity across multiple API schemas.
---

<script>
  import Cta from '$lib/ui/Cta.svelte';
</script>

<Cta href="https://github.com/dxlbnl/zod4-mock" eyebrow="// open source" name="zod4-mock" description="Deterministic, schema-driven mock data for Zod v4. One seed. Cross-API consistent." label="VIEW ON GITHUB →" external />

At work, we had a nice setup for mock data in Zod 3, but upgrading to Zod 4 broke almost everything. Existing libraries like `zod-mock` or `zod-fixture` often had two big issues: modifying a schema would cause the generated data to shift completely, and getting referential integrity—like matching IDs between a `User` and an `Order`—required a ton of manual glue code.

I built [zod4-mock](https://github.com/dxlbnl/zod4-mock) to fix both.

## Zero-config by default

The simplest way to use it is just `generate`. It uses heuristics based on your field names to guess what the data should look like:

```ts
import { z } from 'zod';
import { generate } from 'zod4-mock';

const UserSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  email: z.email(),
  role: z.enum(['admin', 'user']),
  createdAt: z.date(),
});

const user = generate(UserSchema);
// → {
//     id:        'a3f1c2d4-9e6b-4a0f-b821...',
//     firstName: 'Jan',
//     email:     'jan.bakker@dexterlabs.nl',
//     role:      'user',
//     createdAt: 2026-05-12T16:43:01.000Z
//   }
```

## The world model

For real testing, you want determinism. You create a "world" with a seed, and it produces byte-identical output every time, on every machine.

```typescript
import { z } from 'zod';
import { createWorld } from 'zod4-mock';

const PersonSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
});

const world = createWorld({ seed: 42 })
  .withSchema(PersonSchema);

const people = world.generate(
  z.array(PersonSchema).min(3).max(10)
);
```

## Cross-API consistency

Where this really pays off is when you have multiple schemas representing the same underlying entity. Instead of manual wiring, you can use `from` to derive one schema from another:

```typescript
const PersonSummarySchema = z.object({
  personId: z.uuid(),
  displayName: z.string(),
});

world.withSchema(PersonSummarySchema, {
  from: PersonSchema,
  matchers: {
    personId: (ctx) => ctx.source.id,
    displayName: (ctx) => 
      `${ctx.source.firstName} ${ctx.source.lastName}`,
  },
});

const summaries = world.generate(z.array(PersonSummarySchema));

// true — always
console.log(people[0].id === summaries[0].personId);
```

The world tracks the mapping automatically. You can also use `relations` to link IDs across entirely different entities (like `authorId` in a `Post` schema).

Like zod-fixture, the library is aware of field names. 150+ keys like `email`, `firstName`, `createdAt`, `street`, and `postalCode` produce realistic values automatically. You can register your own matchers globally or per-schema:

```typescript
world.withSchema(ProductSchema, {
  matchers: {
    sku: (ctx) => `SKU-${ctx.gen.string.alphanumeric(6)}`,
    price: (ctx) => ctx.prng.int(100, 50000),
  },
});
```

`ctx.gen` gives you access to a full library of generators (person, location, finance, etc.) already wired to the world's seed.

## Recursive schemas and entropy

The latest update finally adds support for recursive (self-referential) schemas, so you can mock complex tree structures or nested comments without stack overflows. We've also increased the data entropy significantly—no more getting the same three names in every test.

## No heavy dependencies

Most mock libraries pull in `faker`, which is massive and can slow down test suites. `zod4-mock` includes a lightweight, built-in generator with the same capabilities, keeping your dependencies small.

Built for Zod v4, MIT licensed, TypeScript-first.

```bash
npm install zod4-mock
```
