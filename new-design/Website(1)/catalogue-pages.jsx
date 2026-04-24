/* =========================================================
   DEXTERLABS // CATALOGUE + PRODUCT + ABOUT + CONTACT
   ========================================================= */

function CataloguePage() {
  const D = window.DXLB;
  return (
    <>
      <Crumb path={[{ label: "catalogue" }]} />
      <div className="page-inner">
        <section className="hero" style={{ paddingTop: 32, paddingBottom: 40 }}>
          <div className="micro faint" style={{ marginBottom: 16 }}>
            // CATALOGUE · HARDWARE · FOR SALE
          </div>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 112px)" }}>Catalogue.</h1>
          <p className="sub">
            Eurorack modules, hand-built in Delft. Small batches. Solder
            joints checked twice. Shipped by <i>Dexterlabs</i>. Custom or
            prototype work? <a className="link" href="#/contact">get in touch</a>.
          </p>
          <div className="meta">
            <span><b>3</b> MODULES LIVE</span>
            <span><b>BATCH</b> 2026-Q2</span>
            <span><b>SHIPS FROM</b> DELFT, NL</span>
          </div>
        </section>

        <SectionH num="// 0x01" title="Currently in production" right={<><Led tone="amber" blink /> ACCEPTING ORDERS</>} />

        <div className="cat-row" style={{ marginTop: 16 }}>
          {D.products.map((p) => (
            <a key={p.sku} href={`#/catalogue/${p.slug}`} style={{ display: "contents" }}>
              <ProductCard {...p} />
            </a>
          ))}
        </div>

        <div style={{ marginTop: 56, border: "1px solid var(--rule)", padding: 28, background: "var(--bg-rail)" }}>
          <div className="micro faint" style={{ marginBottom: 8 }}>// PROTOTYPE-FOR-HIRE</div>
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 28, margin: 0, fontWeight: 500, letterSpacing: "-0.01em" }}>
            Got an idea for a module? I sometimes build prototypes.
          </h3>
          <p style={{ color: "var(--ink-dim)", maxWidth: "62ch", marginTop: 10 }}>
            If you have a concept for a Eurorack module and want a working
            PCB to test it on, I can occasionally take on a small
            prototyping job on the side. Drop me a line and we'll talk
            scope.
          </p>
          <a className="link" href="#/contact" style={{ fontFamily: "var(--mono)", fontSize: "var(--t-mono)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 12, display: "inline-block" }}>
            GET IN TOUCH →
          </a>
        </div>

        <Signature />
      </div>
    </>
  );
}

function ProductPage({ slug }) {
  const D = window.DXLB;
  const m = D.mrx1; // only MRX-1 is fully written; other slugs fall through

  return (
    <>
      <Crumb path={[{ label: "catalogue", href: "#/catalogue" }, { label: slug || "mrx-1" }]} />
      <div className="page-inner">
        <div style={{ paddingTop: 32 }}>
          <a href="#/catalogue" className="mono faint" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ← RETURN TO CATALOGUE
          </a>
        </div>

        <div className="pd-grid">
          {/* LEFT — hero image */}
          <div>
            <div className="pd-hero-img">
              <div className="pd-state">{m.state}</div>
              <span>MRX-1 · FRONT PANEL</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
              <Placeholder label="PCB TOP" shape="sq" />
              <Placeholder label="IN RACK" shape="sq" />
              <Placeholder label="DETAIL" shape="sq" />
            </div>
          </div>

          {/* RIGHT — data */}
          <div className="pd-side">
            <div className="pd-sub">{m.sku} · {m.subtitle}</div>
            <h1>{m.title}</h1>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {m.tags.map((t) => <TagPill key={t}>{t}</TagPill>)}
            </div>
            <p className="pd-lede">{m.tagline}</p>

            <div className="pd-pricebox">
              <div>
                <div className="pd-price">{m.price}</div>
                <div className="mono faint" style={{ marginTop: 4, letterSpacing: "0.08em" }}>
                  <Led tone="ok" /> {m.stockLabel} · SHIPS IN 3–5 DAYS
                </div>
              </div>
              <a href="#/contact" className="pd-buy">ADD TO RACK →</a>
            </div>

            {/* Quick specs */}
            <div style={{ marginTop: 32 }}>
              <div className="micro faint">// QUICK SPECS</div>
              <table className="spec-table">
                <tbody>
                  <tr><td>Width</td><td>12 HP</td></tr>
                  <tr><td>Channels</td><td>4 in → stereo out</td></tr>
                  <tr><td>EQ</td><td>Tilt, ±12dB, 700Hz</td></tr>
                  <tr><td>Power</td><td>±12V · 65 / 55 mA</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Long-form sections — like AR-1 page */}
        <div style={{ maxWidth: "68ch", margin: "32px auto 0" }}>
          {m.sections.map((s, i) => (
            <section key={i} style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "var(--sans)", fontWeight: 500, fontSize: 28, letterSpacing: "-0.01em", margin: "24px 0 12px" }}>
                {s.h}
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--ink)" }}>{s.b}</p>
            </section>
          ))}
        </div>

        {/* Full spec table */}
        <SectionH num="// SPECS" title="Technical specifications" right="ALL VALUES NOMINAL" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginTop: 16 }}>
          {m.specs.map((g) => (
            <div key={g.group}>
              <div className="micro faint">// {g.group.toUpperCase()}</div>
              <table className="spec-table">
                <tbody>
                  {g.rows.map(([k, v], i) => (
                    <tr key={i}><td>{k}</td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Included */}
        <SectionH num="// BOX" title="What's in the box" right="PACKED IN DELFT" />
        <ul className="incl-list">
          {m.included.map((x, i) => <li key={i}>{x}</li>)}
        </ul>

        <div style={{ marginTop: 48, border: "1px solid var(--rule)", padding: 28, background: "var(--bg-rail)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="micro faint">// STATUS</div>
            <div style={{ fontSize: 18, marginTop: 4 }}>{m.state}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="pd-price" style={{ fontFamily: "var(--mono)", fontSize: 28, color: "var(--amber)" }}>{m.price}</div>
            <a href="#/contact" className="link mono" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>ADD TO RACK →</a>
          </div>
        </div>

        <Signature />
      </div>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <Crumb path={[{ label: "about" }]} />
      <div className="page-inner">
        <section className="hero" style={{ paddingTop: 32, paddingBottom: 40 }}>
          <div className="micro faint" style={{ marginBottom: 16 }}>// ABOUT · DEXTER / DEXTERLABS</div>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 112px)" }}>Two names,<br/><em>one bench.</em></h1>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, padding: "8px 0 32px" }}>
          <div>
            <div className="micro faint">// 0x01 · THE PERSON</div>
            <h2 style={{ fontFamily: "var(--sans)", fontWeight: 500, fontSize: 32, margin: "12px 0", letterSpacing: "-0.01em" }}>Dexter.</h2>
            <p style={{ color: "var(--ink)", fontSize: 17, lineHeight: 1.6, maxWidth: "52ch" }}>
              Alexander "Dexter" Esselink. Software engineer by day, maker
              by night. I sign the notes. I write the rants. I do the
              soldering.
            </p>
            <p style={{ color: "var(--ink-dim)", fontSize: 15, lineHeight: 1.6, maxWidth: "52ch" }}>
              Based in Delft. Coffee before electronics. Electronics before
              bedtime.
            </p>
          </div>
          <div>
            <div className="micro faint">// 0x02 · THE LAB</div>
            <h2 style={{ fontFamily: "var(--sans)", fontWeight: 500, fontSize: 32, margin: "12px 0", letterSpacing: "-0.01em" }}>Dexterlabs.</h2>
            <p style={{ color: "var(--ink)", fontSize: 17, lineHeight: 1.6, maxWidth: "52ch" }}>
              The name on the box. A one-person lab that ships small
              batches of Eurorack modules, hand-assembled in Delft, with
              warranties you can actually use.
            </p>
            <p style={{ color: "var(--ink-dim)", fontSize: 15, lineHeight: 1.6, maxWidth: "52ch" }}>
              Est. 2019. Still small on purpose.
            </p>
          </div>
        </div>

        <SectionH num="// 0x03" title="What this site is" right="AND ISN'T" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: "20px 0", fontSize: 15, lineHeight: 1.6 }}>
          <div>
            <div className="micro ok">// IS</div>
            <ul style={{ paddingLeft: 18, color: "var(--ink)" }}>
              <li>A workshop window — what's on the bench right now.</li>
              <li>A catalogue — the modules that are actually for sale.</li>
              <li>A feed — short posts, when something interesting happens.</li>
              <li>A notebook — longer pieces, when something took long enough to explain.</li>
            </ul>
          </div>
          <div>
            <div className="micro faint">// ISN'T</div>
            <ul style={{ paddingLeft: 18, color: "var(--ink-dim)" }}>
              <li>A portfolio for client work — that's my day job, not this.</li>
              <li>A content factory — no schedule, no SEO pressure.</li>
              <li>A startup pitch — this is a bench, not a company.</li>
            </ul>
          </div>
        </div>

        <Signature />
      </div>
    </>
  );
}

function ContactPage() {
  return (
    <>
      <Crumb path={[{ label: "contact" }]} />
      <div className="page-inner">
        <section className="hero" style={{ paddingTop: 32, paddingBottom: 40 }}>
          <div className="micro faint" style={{ marginBottom: 16 }}>// CONTACT · ONE CHANNEL</div>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 112px)" }}>Say hello.</h1>
          <p className="sub">
            Best way: email. For prototype-for-hire, include what you're
            trying to test and a rough timeline. For everything else, just
            write.
          </p>
          <div style={{ marginTop: 40, fontFamily: "var(--mono)", fontSize: 22, letterSpacing: "0.04em" }}>
            <a className="link" href="mailto:hello@dxlb.nl">hello@dxlb.nl</a>
          </div>
          <div className="meta" style={{ marginTop: 32 }}>
            <span><b>GH</b> github.com/dxlbnl</span>
            <span><b>LI</b> linkedin/alexander-esselink</span>
            <span><b>IG</b> @dexterotti</span>
          </div>
        </section>
        <Signature />
      </div>
    </>
  );
}

window.CataloguePage = CataloguePage;
window.ProductPage = ProductPage;
window.AboutPage = AboutPage;
window.ContactPage = ContactPage;
