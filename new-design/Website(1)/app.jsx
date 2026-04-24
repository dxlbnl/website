/* =========================================================
   DEXTERLABS // APP SHELL + ROUTER + TWEAKS
   ========================================================= */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "phosphor",
  "telemetry": "nav",
  "showScope": false
}/*EDITMODE-END*/;

function useHashRoute() {
  const [hash, setHash] = React.useState(window.location.hash || "#/");
  React.useEffect(() => {
    const on = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash.replace(/^#/, "") || "/";
}

function matchRoute(route) {
  // returns { current, Page, props }
  if (route === "/" || route === "")
    return { current: "home", Page: window.Home, props: {} };

  if (route === "/feed" || route.startsWith("/feed/"))
    return { current: "feed", Page: window.FeedPage, props: {} };

  if (route === "/notes")
    return { current: "notes", Page: window.NotesPage, props: {} };

  const noteMatch = route.match(/^\/notes\/(.+)$/);
  if (noteMatch)
    return { current: "notes", Page: window.NotePostPage, props: { slug: noteMatch[1] } };

  if (route === "/catalogue")
    return { current: "catalogue", Page: window.CataloguePage, props: {} };

  const prodMatch = route.match(/^\/catalogue\/(.+)$/);
  if (prodMatch)
    return { current: "catalogue", Page: window.ProductPage, props: { slug: prodMatch[1] } };

  if (route === "/about")   return { current: "about",   Page: window.AboutPage,   props: {} };
  if (route === "/contact") return { current: "contact", Page: window.ContactPage, props: {} };

  return { current: "home", Page: window.Home, props: {} };
}

function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const route = useHashRoute();

  React.useEffect(() => {
    document.documentElement.setAttribute("data-palette", t.palette);
    window.scrollTo(0, 0);
  }, [t.palette, route]);

  const { current, Page, props } = matchRoute(route);

  const showFullBar = t.telemetry === "full";
  const showNavTele = t.telemetry === "nav" || t.telemetry === "full";

  return (
    <div className="page" data-screen-label={`dxlb / ${current}`}>
      {showFullBar && <StatusBar showScope={t.showScope} showClock={true} />}
      <Nav current={current} showTelemetry={showNavTele && !showFullBar} />
      <main style={{ flex: 1 }}>
        {Page ? <Page {...props} /> : <div className="page-inner"><p>404</p></div>}
      </main>
      <Footer />

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Theme" />
        <window.TweakRadio
          label="Palette"
          value={t.palette}
          options={["phosphor", "paper"]}
          onChange={(v) => setTweak("palette", v)}
        />

        <window.TweakSection label="Telemetry" />
        <window.TweakRadio
          label="Placement"
          value={t.telemetry}
          options={["off", "nav", "full"]}
          onChange={(v) => setTweak("telemetry", v)}
        />
        <window.TweakToggle
          label="Scope trace"
          value={t.showScope}
          onChange={(v) => setTweak("showScope", v)}
        />

        <window.TweakSection label="Navigate" />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 0", fontFamily: "var(--mono)", fontSize: 11 }}>
          <a href="#/" className="link">→ Home</a>
          <a href="#/feed" className="link">→ Feed</a>
          <a href="#/notes" className="link">→ Notes index</a>
          <a href="#/notes/tr909-ghost" className="link">→ Note (TR-909)</a>
          <a href="#/catalogue" className="link">→ Catalogue</a>
          <a href="#/catalogue/mrx-1" className="link">→ Product (MRX-1)</a>
          <a href="#/about" className="link">→ About</a>
          <a href="#/contact" className="link">→ Contact</a>
        </div>
      </window.TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
