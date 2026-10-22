import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FilePenLine,
  History,
  Menu,
  Moon,
  MoreHorizontal,
  PenLine,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Sun,
  Upload,
  WalletCards,
  X,
} from "lucide-react";

type View = "feed" | "article" | "studio";

type Story = {
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  credit: string;
  status: "Endorsed" | "Flagged" | "Delisted" | "Unreviewed";
};

const stories: Story[] = [
  {
    category: "World",
    title: "The quiet infrastructure powering a new era of public reporting",
    excerpt:
      "Across cities, small newsrooms are building resilient networks that keep local stories visible, verifiable, and alive.",
    author: "0x71F2…93A8",
    date: "Oct 03, 2026",
    readTime: "6 min",
    image:
      "https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?auto=format&fit=crop&w=1400&q=88",
    credit: "Photo by Rishabh Sharma",
    status: "Endorsed",
  },
  {
    category: "Culture",
    title: "Why the morning paper still matters in an age of infinite feeds",
    excerpt:
      "The ritual is changing, but our need for a considered record of the day has never felt more urgent.",
    author: "0x83C1…104E",
    date: "Oct 02, 2026",
    readTime: "4 min",
    image:
      "https://images.unsplash.com/photo-1529243856184-fd5465488984?auto=format&fit=crop&w=1400&q=88",
    credit: "Photo by Hayden Walker",
    status: "Flagged",
  },
  {
    category: "Ideas",
    title: "A public record should belong to the public",
    excerpt:
      "What content-addressed publishing can teach us about authorship, corrections, and lasting trust.",
    author: "0x4B92…CC07",
    date: "Sep 28, 2026",
    readTime: "8 min",
    image:
      "https://images.unsplash.com/photo-1546085020-407431a34851?auto=format&fit=crop&w=1400&q=88",
    credit: "Photo by Yang Xia",
    status: "Delisted",
  },
];

function Brand() {
  return (
    <button className="brand" type="button" aria-label="ActaMundi home">
      <span className="brand-mark">A</span>
      <span>ActaMundi</span>
    </button>
  );
}

const TRUST_BADGE_CONFIG = {
  Endorsed: { modifier: "endorsed", Icon: ShieldCheck },
  Flagged: { modifier: "flagged", Icon: ShieldAlert },
  Delisted: { modifier: "delisted", Icon: ShieldX },
  Unreviewed: { modifier: "unreviewed", Icon: Shield },
} as const;

function TrustBadge({ status, dark = false }: { status: Story["status"]; dark?: boolean }) {
  const { modifier, Icon } = TRUST_BADGE_CONFIG[status];
  return (
    <span className={`trust-badge ${modifier} ${dark ? "on-dark" : ""}`}>
      <Icon size={14} strokeWidth={2.3} />
      {status}
    </span>
  );
}

function Header({
  view,
  setView,
  darkMode,
  setDarkMode,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  view: View;
  setView: (view: View) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const navItems: { id: View; label: string }[] = [
    { id: "feed", label: "Dispatch" },
    { id: "article", label: "Latest story" },
    { id: "studio", label: "Publisher" },
  ];

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        <nav className="primary-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Search">
            <Search size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={darkMode ? "Use light theme" : "Use dark theme"}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="wallet-button" type="button">
            <span className="wallet-dot" />
            0x71F2…93A8
          </button>
          <button
            className="mobile-menu icon-button"
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

function StoryCard({ story, openStory }: { story: Story; openStory: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="story-card">
      {imageFailed ? (
        <div className="story-image-fallback" aria-hidden="true" />
      ) : (
        <img src={story.image} alt={story.title} onError={() => setImageFailed(true)} />
      )}
      <div className="story-shade" />
      <div className="story-topline">
        <span className="category-pill">{story.category}</span>
        <TrustBadge status={story.status} dark />
      </div>
      <div className="story-copy">
        <p className="eyebrow light">Independent reporting · Signed at source</p>
        <h1>{story.title}</h1>
        <p className="story-excerpt">{story.excerpt}</p>
        <div className="story-meta">
          <span>{story.author}</span>
          <span>{story.date}</span>
          <span>
            <Clock3 size={13} /> {story.readTime} read
          </span>
        </div>
        <button className="read-story" type="button" onClick={openStory}>
          Read the dispatch <ArrowRight size={16} />
        </button>
      </div>
      <span className="photo-credit">{story.credit}</span>
    </article>
  );
}

function FeedView({ openStory }: { openStory: (story: Story) => void }) {
  const [storyIndex, setStoryIndex] = useState(0);
  const story = stories[storyIndex];

  function move(direction: number) {
    setStoryIndex((current) => (current + direction + stories.length) % stories.length);
  }

  return (
    <main className="feed-layout">
      <section className="feed-intro">
        <div>
          <p className="eyebrow">The public record, rebuilt</p>
          <h2>News with a visible chain of trust.</h2>
          <p className="intro-copy">
            Every dispatch is signed by its author, preserved by the network, and accompanied by its editorial status.
          </p>
        </div>
        <div className="network-card">
          <div className="network-heading">
            <span className="live-dot" />
            <span>Protocol live</span>
            <span>12 peers</span>
          </div>
          <dl>
            <div>
              <dt>Published today</dt>
              <dd>24</dd>
            </div>
            <div>
              <dt>Board endorsed</dt>
              <dd>18</dd>
            </div>
            <div>
              <dt>Corrections logged</dt>
              <dd>03</dd>
            </div>
          </dl>
        </div>
        <p className="feed-note">
          <ShieldCheck size={16} />
          Trust signals are shown inline, never hidden behind a click.
        </p>
      </section>

      <section className="feed-stage" aria-label="Article feed">
        <div className="feed-toolbar">
          <div>
            <span className="section-kicker">Live dispatch</span>
            <span className="story-count">
              {String(storyIndex + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}
            </span>
          </div>
          <div className="feed-arrows">
            <button type="button" onClick={() => move(-1)} aria-label="Previous story">
              <ArrowLeft size={17} />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Next story">
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <StoryCard story={story} openStory={() => openStory(story)} />
        <div className="feed-pagination">
          {stories.map((item, index) => (
            <button
              key={item.title}
              className={index === storyIndex ? "active" : ""}
              type="button"
              aria-label={`Show story ${index + 1}`}
              onClick={() => setStoryIndex(index)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ArticleView({ story, close }: { story: Story; close: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <main className="article-page">
      <button className="back-link" type="button" onClick={close}>
        <ArrowLeft size={16} /> Back to dispatch
      </button>
      <article className="article-shell">
        <header className="article-header">
          <p className="eyebrow">{story.category} · Field report 042</p>
          <h1>{story.title}</h1>
          <p className="article-deck">{story.excerpt}</p>
          <div className="byline">
            <div className="author-avatar">PS</div>
            <div>
              <strong>P. Sivakumaran</strong>
              <span>{story.date} · {story.readTime} read</span>
            </div>
            <button className="more-button" type="button" aria-label="More options">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        <figure className="article-hero">
          {imageFailed ? (
            <div className="story-image-fallback" aria-hidden="true" />
          ) : (
            <img src={story.image} alt={story.title} onError={() => setImageFailed(true)} />
          )}
          <figcaption>{story.credit} · Unsplash</figcaption>
        </figure>

        <section className="trust-strip" aria-label="Article trust information">
          <div className="trust-primary">
            <CheckCircle2 size={19} />
            <div>
              <strong>Signature verified</strong>
              <span>Published by 0x71F2…93A8</span>
            </div>
          </div>
          <div className="trust-divider" />
          <TrustBadge status={story.status} />
          <div className="trust-divider" />
          <button type="button">
            <History size={15} /> 2 earlier versions
          </button>
        </section>

        <div className="article-grid">
          <div className="article-body">
            <p className="drop-cap">
              Journalism has always depended on trust. For generations, that trust lived in mastheads, printing presses,
              and the accumulated reputation of institutions. Today, the machinery of publishing is changing faster than
              the public language we use to understand it.
            </p>
            <p>
              Across cities, a quieter infrastructure is taking shape. Local reporters are preserving their work across
              distributed networks, attaching authorship directly to each dispatch, and recording corrections without
              erasing what came before.
            </p>
            <blockquote>
              “The goal is not to make every claim unquestionable. It is to make the path from author to reader visible.”
            </blockquote>
            <p>
              ActaMundi treats an article less like a disposable page and more like a public record. Each version receives
              a content address. Each author signs their work. Editorial boards can endorse, flag, or delist a dispatch,
              while the underlying history remains inspectable.
            </p>
            <h2>A record that can show its work</h2>
            <p>
              This does not replace editorial judgment. It gives that judgment a clearer surface: readers can distinguish
              authentic authorship from endorsement, and endorsement from independent fact verification.
            </p>
          </div>
          <aside className="article-aside">
            <p className="aside-label">On this dispatch</p>
            <div className="aside-item">
              <ShieldCheck size={17} />
              <div>
                <strong>Editorially endorsed</strong>
                <span>Reviewed by the ActaMundi board</span>
              </div>
            </div>
            <div className="aside-item">
              <History size={17} />
              <div>
                <strong>Version 3</strong>
                <span>Two corrections preserved</span>
              </div>
            </div>
            <div className="aside-item">
              <WalletCards size={17} />
              <div>
                <strong>Author signed</strong>
                <span>Wallet identity verified</span>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}

function StudioView({ openStory }: { openStory: (story: Story) => void }) {
  const [published, setPublished] = useState(false);
  const [title, setTitle] = useState(stories[0].title);
  const [excerpt, setExcerpt] = useState(stories[0].excerpt);
  const draftStory: Story = { ...stories[0], title: title || "Untitled", excerpt };

  return (
    <main className="studio-page">
      <div className="studio-heading">
        <div>
          <p className="eyebrow">Publisher workspace</p>
          <h1>Compose a dispatch</h1>
          <p>Preview exactly what readers will see before signing your story.</p>
        </div>
        <div className="studio-actions">
          <span className="saved-state">
            <Check size={14} /> Saved locally
          </span>
          <button className="preview-link" type="button" onClick={() => openStory(draftStory)}>
            Full preview
          </button>
          <button className="publish-button" type="button" onClick={() => setPublished(true)}>
            {published ? <Check size={16} /> : <Sparkles size={16} />}
            {published ? "Signed & published" : "Sign & publish"}
          </button>
        </div>
      </div>

      {published && (
        <div className="publish-notice">
          <CheckCircle2 size={18} />
          Your dispatch is signed and announced to the network.
          <button type="button" onClick={() => setPublished(false)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="studio-grid">
        <section className="editor-card">
          <div className="editor-card-heading">
            <FilePenLine size={18} />
            <div>
              <strong>Article details</strong>
              <span>Draft · Stored on this device</span>
            </div>
          </div>
          <label>
            Headline
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Standfirst
            <textarea rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
          </label>
          <div className="form-row">
            <label>
              Section
              <select defaultValue="World">
                <option>World</option>
                <option>Culture</option>
                <option>Ideas</option>
              </select>
            </label>
            <label>
              Status
              <select defaultValue="Published">
                <option>Draft</option>
                <option>Published</option>
              </select>
            </label>
          </div>
          <label>
            Story
            <div className="editor-toolbar">
              <button type="button"><strong>B</strong></button>
              <button type="button"><em>I</em></button>
              <button type="button">H2</button>
              <span />
              <button type="button">Link</button>
              <button type="button">Quote</button>
            </div>
            <textarea
              className="story-editor"
              rows={9}
              defaultValue="Journalism has always depended on trust. For generations, that trust lived in mastheads, printing presses, and the accumulated reputation of institutions."
            />
          </label>
          <button className="upload-area" type="button">
            <Upload size={20} />
            <span>
              <strong>Replace cover image</strong>
              <small>JPG, PNG or WebP · 8 MB max</small>
            </span>
          </button>
        </section>

        <aside className="preview-pane">
          <p className="preview-label">
            <PenLine size={14} /> Live reader preview
          </p>
          <div className="preview-frame">
            <StoryCard story={draftStory} openStory={() => openStory(draftStory)} />
          </div>
          <p className="preview-footnote">
            <Shield size={14} /> Trust status appears after the editorial board reviews this dispatch.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState<View>("feed");
  const [darkMode, setDarkMode] = useState(false);
  const [activeStory, setActiveStory] = useState<Story>(stories[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function openArticle(story: Story) {
    setActiveStory(story);
    setView("article");
  }

  function changeView(next: View) {
    setView(next);
    setMobileMenuOpen(false);
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <Header
        view={view}
        setView={changeView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      {view === "feed" && <FeedView openStory={openArticle} />}
      {view === "article" && <ArticleView story={activeStory} close={() => setView("feed")} />}
      {view === "studio" && <StudioView openStory={openArticle} />}
      <footer className="site-footer">
        <Brand />
        <p>Independent reporting. Verifiable by design.</p>
        <span>Protocol preview · 2026</span>
      </footer>
    </div>
  );
}
