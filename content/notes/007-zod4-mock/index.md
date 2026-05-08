---
pageType: note
title: 'zod4-mock: Deterministic Mock Data for Zod v4'
date: 2026-05-08
tags: [typescript, testing, zod, open-source]
kind: open-source
images: [screenshot.png]
lede: A schema-driven mock library that generates byte-identical data from a seed, with built-in relational identity across multiple API schemas.
---

<script>
  import Cta from '$lib/ui/Cta.svelte';
</script>

<Cta href="https://github.com/dxlbnl/zod4-mock" eyebrow="// open source" name="zod4-mock" description="Deterministic, schema-driven mock data for Zod v4. One seed. Cross-API consistent." label="VIEW ON GITHUB →" external />

At work, we had quite a nice setup generating mock data based on our client-side API schemas in Zod 3. Over the years we'd been using [zod-mock](https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock) and [zod-fixture](https://zod-fixture.timdeschryver.dev/). But those libraries weren't updated to Zod 4 yet, and they had a few other issues: modifying a schema often caused the generated data to change completely, and getting referential integrity across schemas — consistent IDs between a `User` and an `Order`, for instance — required a lot of custom glue code.

I built [zod4-mock](https://github.com/dxlbnl/zod4-mock) to fix both of those problems.

## The world model

The core idea is a "world" — a container you seed once, define subjects in, and generate from. Everything that comes out is deterministic: the same seed produces byte-identical output on every machine and in every CI run.

You start by defining a subject type — the canonical shape of an entity — and then bind one or more API schemas to it:

```typescript
import { z } from 'zod';
import { createWorld, defineSubjectType } from 'zod4-mock';

const PersonSubject = defineSubjectType(
  'person',
  z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
  }),
);

const PersonApiSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  age: z.number().int().min(18).max(90),
  active: z.boolean(),
});

const world = createWorld({ seed: 42 })
  .withSubject(PersonSubject)
  .withSchema(PersonApiSchema, PersonSubject, {
    firstName: (s) => s.firstName,
    lastName: (s) => s.lastName,
    email: (s) => s.email,
  });

const people = world.generate(z.array(PersonApiSchema).min(3).max(10));
// → [
//   {
//     id:        'a3f1c2d4-9e6b-4a0f-b821-3c7d2e1f0a94',
//     firstName: 'Jan',
//     lastName:  'Bakker',
//     email:     'jan.bakker@dexterlabs.nl',
//     age:       34,
//     active:    true,
//   },
//   {
//     id:        'e5b7f8c1-2d3a-4e9f-a016-7b4c5d6e2f38',
//     firstName: 'Lisa',
//     lastName:  'de Vries',
//     email:     'lisa.devries@wolbodo.nl',
//     age:       52,
//     active:    false,
//   },
// ]
```

## Cross-API consistency

Where this really pays off is when you have a second schema for the same entity. Add `PersonDetailSchema` to the same world:

```typescript
const PersonDetailSchema = z.object({
  personId: z.uuid(),
  bio: z.string(),
});

world.withSchema(PersonDetailSchema, PersonSubject, {
  personId: (s) => s.id,
});

const details = world.generate(z.array(PersonDetailSchema));

console.log(people[0].id === details[0].personId); // true — always
```

No manual foreign key wiring. The world tracks which subject instance maps to which generated record.

## Smart generators and overrides

Like zod-fixture, the library is aware of field names and types. Common keys like `email`, `firstName`, `createdAt`, `street`, and `postalCode` produce realistic values without any extra config. You can register your own key-based generators globally or per-schema:

```typescript
world.withKeyMap(ProductSchema, {
  sku: (ctx) => `SKU-${ctx.prng.int(1000, 9999)}`,
  price: (ctx) => ctx.prng.int(100, 50000),
});
```

And you can pin specific fields after generation with `overrides`, without losing the rest of the generated data:

```typescript
world.generate(PersonApiSchema, {
  overrides: {
    firstName: 'Alice',
    address: { city: 'Amsterdam' },
  },
});
```

## No faker dependency

`zod-mock` pulls in faker, which is large and can get slow in a test suite. I've included a lightweight built-in generator with the same capabilities — names, emails, UUIDs, lorem, numbers — so there's no heavy dependency.

Built for Zod v4, MIT licensed, TypeScript-first.

```bash
npm install zod4-mock
```
