/* =========================================================
   DEXTERLABS // FEED + NOTES pages
   ========================================================= */

function FeedPage() {
  const D = window.DXLB;
  return (
    <>
      <Crumb path={[{ label: "feed" }]} />
      <div className="page-inner">
        <section className="hero" style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div className="micro faint" style={{ marginBottom: 16 }}>
            // FEED · THE LIVE BENCH
          </div>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 112px)" }}>Feed.</h1>
          <p className="sub">
            Short posts from the bench. What I'm building, breaking, or
            shipping right now — the kind of thing I'd otherwise lose in
            a chat thread. Longer writeups live in <a className="link" href="#/notes">notes</a>.
          </p>
          <div className="meta">
            <span><b>{D.feed.length}</b> POSTS</span>
            <span><b>LATEST</b> {D.feed[0].stamp}</span>
            <span><b>CADENCE</b> WHEN IT'S INTERESTING</span>
          </div>
        </section>

        <div className="feed-list">
          {D.feed.map((f, i) => (
            <div className="feed-row" key={i}>
              <div className="fd-date">{f.date}</div>
              <div className="fd-body">{f.body}</div>
              <div className="fd-tags">
                {(f.tags || []).map((t) => <TagPill key={t}>{t}</TagPill>)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, color: "var(--ink-dim)", fontFamily: "var(--mono)", fontSize: "var(--t-mono)" }}>
          // end of feed. newest on top.
        </div>
        <Signature />
      </div>
    </>
  );
}

function NotesPage() {
  const D = window.DXLB;
  return (
    <>
      <Crumb path={[{ label: "notes" }]} />
      <div className="page-inner">
        <section className="hero" style={{ paddingTop: 32, paddingBottom: 40 }}>
          <div className="micro faint" style={{ marginBottom: 16 }}>
            // NOTES · LONGER PIECES
          </div>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 112px)" }}>Notes.</h1>
          <p className="sub">
            Longer writing. Build logs, post-mortems, opinions. Written
            when something took long enough to be worth explaining.
            Signed by <i>Dexter</i>.
          </p>
          <div className="meta">
            <span><b>{D.notes.length}</b> PIECES</span>
            <span><b>LATEST</b> {D.notes[0].date}</span>
          </div>
        </section>

        <SectionH num="// INDEX" title="All notes" right="NEWEST FIRST" />

        {D.notes.map((n) => (
          <a key={n.id} href={`#/notes/${n.slug}`} className="idx-row" style={{ textDecoration: "none" }}>
            <div className="idx-n">{n.id}</div>
            <div className="idx-t">
              {n.title}
              <small>{n.date} · {n.kind} · {n.lede.slice(0, 80)}{n.lede.length > 80 ? "…" : ""}</small>
            </div>
            <div className="idx-i">
              <Placeholder label={n.kind} />
            </div>
          </a>
        ))}

        <Signature />
      </div>
    </>
  );
}

function NotePostPage({ slug }) {
  const D = window.DXLB;
  const note = D.notes.find((n) => n.slug === slug) || D.notes[0];

  return (
    <>
      <Crumb path={[{ label: "notes", href: "#/notes" }, { label: note.slug }]} />
      <div className="page-inner">
        <article className="note-article">
          <div className="micro faint" style={{ marginBottom: 16 }}>
            // {note.id} · {note.kind} · {note.date}
          </div>
          <h1 style={{ fontFamily: "var(--sans)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05, margin: 0 }}>
            {note.title}
          </h1>
          <p className="lede" style={{ marginTop: 20 }}>{note.lede}</p>

          {/* Sample body — in Svelte this is the MD content */}
          <p>
            I'll tell you up front: this took me longer than it should have.
            If you're debugging the same thing, skip to the last paragraph.
            If you want the full story, including the part where I blamed
            the wrong component for two evenings, read on.
          </p>

          <h2>The symptom</h2>
          <p>
            A gentle ghost on the hi-hat decay — barely audible on headphones,
            very audible through a PA. It only showed up after about ninety
            seconds of running, which ruled out a lot of things I initially
            suspected.
          </p>

          <h2>The wrong suspects</h2>
          <p>
            I spent two evenings chasing <code>C42</code>, which was the
            obvious culprit on paper. New cap, same ghost. I replaced
            <code>R78</code> next, still the ghost. I was about to
            reflow the whole envelope section when I did the thing I
            should have done first: compared against a known-good unit on
            the scope, trigger-aligned.
          </p>

          <blockquote>
            The thing you don't measure is the thing that's lying to you.
          </blockquote>

          <h2>The actual fix</h2>
          <p>
            One bad electrolytic two stages upstream, visibly fine, measured
            within spec on a DMM, but drooping under load in a way you only
            see on a scope. Five cents, thirty seconds with an iron, ghost gone.
          </p>

          <p className="faint" style={{ marginTop: 40, fontSize: 14 }}>
            — Dexter, at the bench, <span style={{ fontFamily: "var(--mono)" }}>{note.date}</span>
          </p>
        </article>

        <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 24, display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "var(--t-mono)", color: "var(--ink-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          <a href="#/notes" className="link">← BACK TO NOTES</a>
          <span>SIGNED / DEXTER</span>
        </div>
      </div>
    </>
  );
}

window.FeedPage = FeedPage;
window.NotesPage = NotesPage;
window.NotePostPage = NotePostPage;
