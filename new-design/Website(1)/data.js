// DEXTERLABS // content

window.DXLB = {
  brand: {
    person: "Dexter",
    lab: "Dexterlabs",
    handle: "dxlb.nl",
    location: "Delft, NL",
  },

  // FEED — short, tweet-like. Dated casual. Drives homepage STATUS.
  // Architecture: in Svelte, this is a `/feed/*.md` folder with frontmatter
  // (date, tags) + a one-line body. Newest first.
  feed: [
    { date: "Apr 22", stamp: "2026-04-22 23:14", tags: ["hardware", "MRX-1"],
      body: "Soldered the last joint on MRX-1 rev-C. Power-up test passed on first try — quietly terrifying." },
    { date: "Apr 20", stamp: "2026-04-20 19:02", tags: ["hardware", "MRX-1"],
      body: "Rev-C boards back from fab. Silkscreen typo fixed, through-hole layout is so much cleaner." },
    { date: "Apr 18", stamp: "2026-04-18 08:41", tags: ["code", "patchbay.js"],
      body: "Open-sourced patchbay.js. 180 lines, no deps. I use it in two of my own things." },
    { date: "Apr 11", stamp: "2026-04-11 21:30", tags: ["life"],
      body: "Workshop reorganized. Scopes on the left, soldering on the right, coffee in the middle." },
    { date: "Apr 09", stamp: "2026-04-09 12:10", tags: ["site"],
      body: "Rebuilt dxlb.nl in SvelteKit. Third rewrite this year. Probably not the last." },
    { date: "Mar 27", stamp: "2026-03-27 17:55", tags: ["hardware", "VCA-2"],
      body: "VCA-2 batch ships next week. Hand-matched transistor pairs, 8HP, priced to clear." },
    { date: "Mar 14", stamp: "2026-03-14 14:22", tags: ["hardware", "SIG"],
      body: "SIG breadboard: 8-step sequencer running off a Pico. Needs a lot more work." },
    { date: "Mar 02", stamp: "2026-03-02 22:47", tags: ["code", "opinion"],
      body: "Wrote up why I stopped using React for side projects. See /notes." },
  ],

  // NOTES — longer essays. Written when something breaks.
  notes: [
    { id: "0x03", slug: "why-i-stopped-react", date: "2026.03.02", kind: "RANT",
      title: "Why I stopped using React for side projects",
      lede: "A measured, only-slightly-unfair opinion on build steps, hydration, and the cost of being too clever for your own bench." },
    { id: "0x02", slug: "repairing-juno6", date: "2026.04.03", kind: "LOG",
      title: "On repairing things you didn't build",
      lede: "Field notes from a Juno-6 that wouldn't tune. Three chips, two cold joints, one very stubborn trimmer." },
    { id: "0x01", slug: "tr909-ghost", date: "2026.04.22", kind: "LOG",
      title: "TR-909 hi-hat decay — finally caught the ghost",
      lede: "Three evenings on a scope, one bad capacitor, a lot of coffee. Here's the trace." },
  ],

  // CATALOGUE — short list for the index
  products: [
    { sku: "DXL-MRX1", slug: "mrx-1",  title: "MRX-1 Quad Mixer",
      tagline: "4-channel performance mixer with tilt EQ",
      price: "€189", stock: "ok",  stockLabel: "IN STOCK",   state: "REV-C" },
    { sku: "DXL-VCA2", slug: "vca-2", title: "VCA-2 Dual VCA",
      tagline: "Dual linear VCA, matched transistor pairs",
      price: "€129", stock: "low", stockLabel: "3 LEFT",     state: "SHIPPING" },
    { sku: "DXL-SIG",  slug: "sig",   title: "SIG Sequencer",
      tagline: "8-step CV sequencer, prototype preorder",
      price: "€229", stock: "out", stockLabel: "PREORDER",   state: "PROTO" },
  ],

  // MRX-1 deep data for the product page
  mrx1: {
    sku: "DXL-MRX1",
    title: "MRX-1 Quad Mixer",
    subtitle: "4-in, stereo-out performance mixer",
    state: "REV-C · SHIPPING Q2 2026",
    tags: ["Mixer", "Performance", "EQ", "4ch"],
    tagline: "Four channels, tilt EQ per channel, and a mute fader that doesn't click. Built for live patching, not studio nudging.",
    price: "€189",
    stock: "ok",
    stockLabel: "IN STOCK",
    specs: [
      { group: "Audio", rows: [
        ["Channels",     "4 mono in → stereo out"],
        ["Headroom",     "±10V, DC-coupled"],
        ["EQ",           "Tilt, ±12dB, 700Hz pivot"],
        ["Mute fader",   "VCA, 20ms click-free"],
      ]},
      { group: "Physical", rows: [
        ["Width",        "12 HP"],
        ["Depth",        "28mm skiff-friendly"],
        ["Power",        "Eurorack, ±12V, 65mA / 55mA"],
      ]},
      { group: "Build", rows: [
        ["PCBs",         "Hand-assembled in Delft"],
        ["Front panel",  "2mm aluminum, black-anodized"],
        ["Warranty",     "1 year, fix-or-replace"],
      ]},
    ],
    sections: [
      { h: "Why I built it", b: "Most Eurorack mixers are either too small to be useful or too big to be expressive. I wanted four channels I could patch into quickly during a jam, with enough EQ to carve a voice without a whole rack strip. Tilt EQ is the trick — one knob, musical, no thinking." },
      { h: "The mute fader", b: "The mute is a VCA under a fader, not a hard switch. Moving it is a performance gesture — you can fade a channel out, snap it back, ride it — without the click you get from a relay. Twenty milliseconds of ramp is the sweet spot: fast enough to feel instant, slow enough to never pop." },
      { h: "Tilt EQ", b: "Classic broadcast tilt: boost highs and cut lows (or vice versa) in one motion around a 700Hz pivot. ±12dB is generous — enough to fix a muddy synth or take the edge off a hi-hat, not enough to blow up the next thing in the chain." },
      { h: "Build notes", b: "Through-hole for the signal path, SMD only where it doesn't matter. Every board gets tested on a jig before it leaves the bench. If something breaks in the first year, I'll fix it or replace it, no questions." },
    ],
    included: [
      "MRX-1 module, fully assembled and tested",
      "16-to-10 Eurorack power cable",
      "Mounting screws (M3) and plastic washers",
      "A handwritten thank-you, because this is a small operation",
    ],
  },
};
