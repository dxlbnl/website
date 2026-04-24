/* =========================================================
   DEXTERLABS // COMPONENT LIBRARY
   All exposed via window.* at the bottom so multiple
   Babel scripts can share them.
   ========================================================= */

/* ---------- small primitives ---------- */

function Led({ tone = "ok", blink = false }) {
  return <span className={`led ${tone} ${blink ? "blink" : ""}`} />;
}

function Bracket({ children }) {
  return <span className="bracket">{children}</span>;
}

function TagPill({ tone, children }) {
  return <span className={`tag-pill ${tone || ""}`}>{children}</span>;
}

function HPTag({ children }) {
  return <span className="m-hp">{children}</span>;
}

/* ---------- placeholder (for imagery we don't have) ---------- */

function Placeholder({ label = "IMG", shape = "" }) {
  return <div className={`ph ${shape}`}>{label}</div>;
}

/* ---------- scope trace (ambient motion) ---------- */

function Scope() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const loop = () => {
      setT((x) => x + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * 120;
    const y = 9 + Math.sin((i + t * 0.08) * 0.45) * 5 * Math.sin((i + t * 0.03) * 0.15);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <svg className="scope" viewBox="0 0 120 18" preserveAspectRatio="none">
      <path d={`M ${pts.join(" L ")}`} />
    </svg>
  );
}

/* ---------- telemetry clock ---------- */

function Clock({ running = true }) {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [running]);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <span>
      T.SYNC {pad(now.getUTCHours())}:{pad(now.getUTCMinutes())}:{pad(now.getUTCSeconds())}
    </span>
  );
}

/* ---------- status bar ---------- */

function StatusBar({ showScope = true, showClock = true }) {
  return (
    <div className="status-bar scanlines">
      <span><Led tone="ok" blink /> PWR 3.3V</span>
      <span><Led tone="cyan" /> NET OK</span>
      {showClock && <span><Clock /></span>}
      <span className="spacer" />
      {showScope && <Scope />}
      <span>SYS / DEXTERLABS v3.0</span>
    </div>
  );
}

/* ---------- nav — now absorbs status bits (less gimmicky) ---------- */

function Nav({ current = "home", showTelemetry = true }) {
  const items = [
    { id: "home",       label: "HOME",       href: "#/" },
    { id: "feed",       label: "FEED",       href: "#/feed" },
    { id: "notes",      label: "NOTES",      href: "#/notes" },
    { id: "catalogue",  label: "CATALOGUE",  href: "#/catalogue" },
    { id: "about",      label: "ABOUT",      href: "#/about" },
    { id: "contact",    label: "CONTACT",    href: "#/contact" },
  ];
  return (
    <nav className="nav">
      <a href="#/" className="brand">
        <b>DEXTERLABS</b> <span className="faint">// [ PATH ] ~</span>
      </a>
      {showTelemetry && (
        <span className="nav-tele">
          <Led tone="ok" blink /> <span className="faint">PWR</span>
          <span className="faint" style={{ margin: "0 6px" }}>·</span>
          <Clock />
        </span>
      )}
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a href={it.href} className={current === it.id ? "active" : ""}>{it.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- breadcrumb ---------- */

function Crumb({ path = [] }) {
  // path = [{label, href}]; last has no href
  return (
    <div className="page-inner">
      <div className="crumb">
        <a href="#/">[ PATH ]</a>
        <span className="sep">~</span>
        {path.map((p, i) => (
          <React.Fragment key={i}>
            <span className="sep">/</span>
            {p.href ? <a href={p.href}>{p.label}</a> : <span style={{ color: "var(--ink)" }}>{p.label}</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer className="footer">
      <div>
        <h4>// DEXTERLABS</h4>
        <div>Dexter / maker</div>
        <div className="faint">Est. 2019 · Delft, NL</div>
      </div>
      <div>
        <h4>// SECTIONS</h4>
        <ul>
          <li><a href="#/feed">Feed</a></li>
          <li><a href="#/notes">Notes</a></li>
          <li><a href="#/catalogue">Catalogue</a></li>
          <li><a href="#/about">About</a></li>
          <li><a href="#/contact">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>// NET</h4>
        <ul>
          <li><a href="https://github.com/dxlbnl/">[NET.GH] github</a></li>
          <li><a href="https://www.linkedin.com/in/alexander-esselink-414685a/">[NET.LI] linkedin</a></li>
          <li><a href="https://www.instagram.com/dexterotti/">[NET.IG] instagram</a></li>
        </ul>
      </div>
      <div>
        <h4>// SYS</h4>
        <div>© 2026 DEXTERLABS</div>
        <div className="faint">ALL SYSTEMS OPERATIONAL</div>
      </div>
    </footer>
  );
}

/* ---------- rack row (Eurorack grid layout primitive) ---------- */

function RackRow({ children, rails = true }) {
  return (
    <div className="rack">
      {rails && <div className="rack-rail" />}
      <div className="rack-row">{children}</div>
      {rails && <div className="rack-rail bottom" />}
    </div>
  );
}

/* ---------- module card (the atomic "project" tile) ---------- */

function ModuleCard({ sku, hp, title, desc, kind, state, accent, size }) {
  const cls = ["module", size === "wide" ? "wide" : "", size === "narrow" ? "narrow" : ""].join(" ");
  return (
    <a href="#/repository" className={cls}>
      <div className="m-head">
        <span>{sku}</span>
        {hp && hp !== "—" ? <HPTag>{hp}</HPTag> : <span className="faint">{kind}</span>}
      </div>
      <h3 className="m-title">{title}</h3>
      <div className="m-desc">{desc}</div>
      <div className="m-foot">
        <span><Led tone={accent === "amber" ? "amber" : "cyan"} /> {state}</span>
        <span className="faint">→</span>
      </div>
    </a>
  );
}

/* ---------- log row (Repository) ---------- */

function LogRow({ stamp, kind, title, sub }) {
  return (
    <a href="#/repository" className="log">
      <span className="stamp">{stamp}</span>
      <span className="tag">{kind}</span>
      <span className="t">{title}<small>{sub}</small></span>
      <span className="arrow">READ →</span>
    </a>
  );
}

/* ---------- feed item (Oscilloscope variation) ---------- */

function FeedItem({ when, kind, title, sub, now = false }) {
  return (
    <div className={`feed-item ${now ? "now" : ""}`}>
      <span className="dot" />
      <div>
        <div className="when">{when} · <span className="cyan">{kind}</span></div>
        <div className="what"><b>{title}</b> <em>— {sub}</em></div>
      </div>
    </div>
  );
}

/* ---------- product card (Catalogue) ---------- */

function ProductCard({ sku, title, desc, price, stock, stockLabel }) {
  return (
    <a href="#/catalogue" className="product">
      <div className="p-img">
        <Placeholder label={`${sku} · PRODUCT SHOT`} />
      </div>
      <div className="p-body">
        <div className="p-sku">{sku}</div>
        <h3 className="p-title">{title}</h3>
        <div className="p-desc">{desc}</div>
        <div className="p-meta">
          <span className="p-price">{price}</span>
          <span className={`p-stock ${stock}`}>{stockLabel}</span>
        </div>
      </div>
      <div className="p-cta">
        <span>{stock === "out" ? "PREORDER" : "ADD TO RACK"}</span>
        <span>→</span>
      </div>
    </a>
  );
}

/* ---------- section header ---------- */

function SectionH({ num, title, sub, right }) {
  return (
    <header className="section-h">
      <span className="num">{num}</span>
      <span className="title">{title}</span>
      <span className="sub">{right || sub}</span>
    </header>
  );
}

/* ---------- signature block (Dexter signs the logs) ---------- */

function Signature() {
  return (
    <div className="sig">
      <div>
        <div className="micro faint">// SIGNED</div>
        <div className="hand">— Dexter, at the bench</div>
      </div>
      <div>
        <div className="micro faint">// SHIPPED BY</div>
        <div className="hand">DEXTERLABS <span className="faint">/ a one-person lab</span></div>
      </div>
    </div>
  );
}

/* ---------- export to window for cross-file use ---------- */

Object.assign(window, {
  Led, Bracket, TagPill, HPTag, Placeholder,
  Scope, Clock, StatusBar, Nav, Crumb, Footer,
  RackRow, ModuleCard, LogRow, FeedItem, ProductCard,
  SectionH, Signature,
});
