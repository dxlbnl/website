/* =========================================================
   DEXTERLABS // HOMEPAGE (final, cohesive voice)
   ========================================================= */

function Home() {
  const D = window.DXLB;
  const latest = D.feed[0];

  // Projects — honest inventory, hex ids
  const projects = [
    { id: "0x01", sku: "MRX-1", hp: "12HP", title: "MRX-1 Quad Mixer",
      desc: "Four-in, stereo-out, with per-channel tilt EQ and a mute fader that doesn't click.",
      kind: "HARDWARE", state: "REV-C · ASSEMBLING", forSale: true,  href: "#/catalogue/mrx-1" },
    { id: "0x02", sku: "VCA-2", hp: "8HP", title: "VCA-2 Dual VCA",
      desc: "Clean, linear, hand-matched transistor pairs. Two of them and you stop patching around.",
      kind: "HARDWARE", state: "SHIPPING", forSale: true, href: "#/catalogue" },
    { id: "0x03", sku: "SIG", hp: "6HP", title: "SIG — sequencer",
      desc: "8-step CV sequencer. Still breadboarded. Might ship, might not.",
      kind: "HARDWARE", state: "PROTO", forSale: false, href: "#/feed" },
    { id: "0x04", sku: "PBX", hp: "—", title: "patchbay.js",
      desc: "A 180-line router for signal-flow UIs. No deps, no build step. Open-sourced.",
      kind: "CODE", state: "v1.0 · MIT", forSale: false, href: "#/notes" },
    { id: "0x05", sku: "DXLB", hp: "—", title: "dxlb.nl",
      desc: "This site. Rebuilt in SvelteKit. Third rewrite this year, probably not the last.",
      kind: "SITE", state: "v3", forSale: false, href: "#/notes" },
    { id: "0x06", sku: "JUNO6", hp: "—", title: "Juno-6 repair log",
      desc: "Not mine, not new, not done. A long story about trimmers and cold joints.",
      kind: "REPAIR", state: "ONGOING", forSale: false, href: "#/notes/repairing-juno6" },
  ];

  return (
    <div className="page-inner">
      {/* Masthead */}
      <section className="hero">
        <div className="micro faint" style={{ marginBottom: 24 }}>
          // DEXTERLABS · WORKBENCH · 2026
        </div>
        <h1>
          Dexter.<br />
          <em>A bench of</em><br />
          side projects.
        </h1>
        <p className="sub">
          Full-time software engineer. Evenings on the bench — Eurorack
          hardware, small web experiments, notes from in-between. Some of
          it's for sale. Most of it's just to see if it works.
        </p>

        {/* STATUS — pulled from the latest feed entry, no extra hand-edit */}
        <a href="#/feed" className="hero-status" style={{ textDecoration: "none", display: "block" }}>
          <div className="micro faint" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>// STATUS · LATEST FROM THE FEED</span>
            <span>{latest.date} →</span>
          </div>
          <div className="status-line">
            <Led tone="amber" blink />
            <span>{latest.body}</span>
          </div>
        </a>
      </section>

      {/* Projects */}
      <SectionH num="// 0x01" title="Projects" right={<>{projects.length} ITEMS · {projects.filter(p => p.forSale).length} FOR SALE</>} />

      <div className="proj-grid">
        {projects.map((p) => (
          <a key={p.id} href={p.href} className="proj">
            <div className="p-head">
              <span>{p.id} · {p.sku}</span>
              <span className="faint">{p.kind}{p.hp && p.hp !== "—" ? ` · ${p.hp}` : ""}</span>
            </div>
            <h3 className="p-title">{p.title}</h3>
            <p className="p-desc">{p.desc}</p>
            <div className="p-foot">
              <span><Led tone={p.forSale ? "amber" : "cyan"} blink={p.state.includes("ASSEMBLING")} /> {p.state}</span>
              {p.forSale ? <span className="amber">FOR SALE →</span> : <span className="faint">→</span>}
            </div>
          </a>
        ))}
      </div>

      {/* Catalogue — featured */}
      <SectionH num="// 0x02" title="Catalogue" right={<><Led tone="amber" blink /> 3 MODULES LIVE</>} />
      <div className="cat-row">
        {D.products.map((p) => <ProductCard key={p.sku} {...p} />)}
      </div>
      <div className="cat-foot">
        <a href="#/catalogue" className="link">BROWSE THE FULL CATALOGUE →</a>
        <span className="faint mono">SHIPPED BY DEXTERLABS · DELFT, NL</span>
      </div>

      {/* Notes — callout */}
      <SectionH num="// 0x03" title="Notes" right="LONGER PIECES · WRITTEN WHEN SOMETHING BREAKS" />
      <div style={{ padding: "20px 0 8px", maxWidth: "68ch" }}>
        <p style={{ color: "var(--ink-dim)", fontSize: "var(--t-lede)", lineHeight: 1.55 }}>
          Three pieces so far. Field notes from repairs, opinions from the
          bench, one small rant about build steps. More when there's more
          to say. <a className="link" href="#/notes">Read the notes →</a>
        </p>
      </div>

      <Signature />
    </div>
  );
}

window.Home = Home;
