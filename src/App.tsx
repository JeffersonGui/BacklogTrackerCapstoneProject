import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, signIn, signOut, signUp, type User } from "./api";

type Game = {
  id: number;
  title: string;
  genre: string;
  platform: string;
  progress: number;
  hours: number;
  status: string;
  image: string;
  color: string;
  score?: number;
};

const images = {
  neon: "https://images.unsplash.com/photo-1672872476232-da16b45c9001?auto=format&fit=crop&w=1200&q=85",
  night: "https://images.unsplash.com/photo-1599060052009-24d6d0b0161c?auto=format&fit=crop&w=900&q=85",
  city: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
  tower: "https://images.unsplash.com/photo-1535391879778-3bae11d29a24?auto=format&fit=crop&w=900&q=85",
};
// The above and the below are placeholders, definitely need to replace with actual game data and images via IGDB API.
const initialGames: Game[] = [
  { id: 1, title: "Echoes of Orion", genre: "Sci-fi RPG", platform: "PC", progress: 68, hours: 32, status: "Playing", image: images.neon, color: "#5d46e8", score: 4.8 },
  { id: 2, title: "Midnight Circuit", genre: "Racing", platform: "PS5", progress: 34, hours: 14, status: "Playing", image: images.night, color: "#e84f8a", score: 4.6 },
  { id: 3, title: "The Last Signal", genre: "Adventure", platform: "PC", progress: 12, hours: 4, status: "Backlog", image: images.city, color: "#489bb8", score: 4.7 },
  { id: 4, title: "Citadel Zero", genre: "Strategy", platform: "Xbox", progress: 0, hours: 0, status: "Backlog", image: images.tower, color: "#e19645", score: 4.5 },
];

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    library: <><path d="M4 4h16v16H4z" /><path d="M8 4v16M8 9h12" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 4-4 2 2-4z" /></>,
    journal: <><path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z" /><path d="M8 7h7M8 11h7" /></>,
    users: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M18 11a4 4 0 0 0 0-8M22 20v-2a4 4 0 0 0-3-3.87" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    play: <path d="m8 5 11 7-11 7z" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
    share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5m-7.6 6.9 7.6 4.5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 13.5v-3l-2-.6-.7-1.7 1-1.8-2.1-2.1-1.8 1-1.7-.7L11 2H8l-.6 2.6-1.7.7-1.8-1-2.1 2.1 1 1.8-.7 1.7-2 .6v3l2 .6.7 1.7-1 1.8 2.1 2.1 1.8-1 1.7.7L8 22h3l.6-2.6 1.7-.7 1.8 1 2.1-2.1-1-1.8.7-1.7z" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 3h7v18h-7" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

function PublicSite({ page, onNavigate }: { page: "main" | "about"; onNavigate: (page: "main" | "about" | "signin") => void }) {
  return <div className="public-site">
    <header className="public-header">
      <button className="brand public-brand" onClick={() => onNavigate("main")}><span>ℑ</span>Inventory</button>
      <nav className="public-nav"><button className={page === "main" ? "active" : ""} onClick={() => onNavigate("main")}>Home</button><button className={page === "about" ? "active" : ""} onClick={() => onNavigate("about")}>About</button></nav>
      <button className="public-signin" onClick={() => onNavigate("signin")}>Sign in <span>→</span></button>
    </header>
    {page === "main" ? <main className="landing-main">
      <section className="landing-hero">
        <div className="landing-glow" />
        <div className="landing-copy">
          <p className="eyebrow">YOUR GAMES. YOUR STORY.</p>
          <h1>Never lose track<br />of your <em>next world.</em></h1>
          <p>Inventory is the home for every game you've played, loved, paused, or can't wait to begin.</p>
          <div className="landing-actions"><button className="primary" onClick={() => onNavigate("signin")}>Enter Inventory <span>→</span></button><button className="landing-secondary" onClick={() => onNavigate("about")}>Why we built it</button></div>
          <div className="landing-proof"><div className="proof-avatars"><span>AM</span><span>SK</span><span>JR</span></div><p><b>Built for players,</b><br />not algorithms.</p></div>
        </div>
        <div className="landing-visual">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <article className="landing-game-card card-back"><img src={images.night} alt="Neon city game artwork" /><span>BACKLOG</span><h3>Midnight Circuit</h3></article>
          <article className="landing-game-card card-front"><img src={images.neon} alt="Futuristic game world" /><span>NOW PLAYING · 68%</span><h3>Echoes of Orion</h3><div><i /></div></article>
          <div className="floating-stat"><Icon name="star" /><div><b>4.8</b><span>YOUR RATING</span></div></div>
        </div>
      </section>
      <section className="landing-strip"><span>TRACK</span><i /><span>DISCOVER</span><i /><span>REMEMBER</span><i /><span>SHARE</span></section>
    </main> :
    <main className="about-main">
      <section className="about-intro"><p className="eyebrow">ABOUT INVENTORY</p><h1>Games are more than<br /><em>items on a shelf.</em></h1><p>They're places we've been, choices we've made, and stories we carry with us.</p></section>
      <section className="about-story">
        <div className="story-image"><img src={images.city} alt="Friends exploring a city at night" /><span>EST. BY PLAYERS · 2025</span></div>
        <div className="story-copy"><p className="eyebrow">OUR BEGINNING</p><h2>We kept forgetting<br />the games we loved.</h2><p>Inventory started with a familiar problem: sprawling wishlists, forgotten recommendations, and half-finished adventures scattered across different platforms.</p><p>We wanted one thoughtful place that treated a gaming life like a story—not a shopping cart. So we built the tool we wished we had.</p><button className="primary" onClick={() => onNavigate("signin")}>Start your Inventory <span>→</span></button></div>
      </section>
      <section className="about-values"><div><span>01</span><h3>Remember everything</h3><p>Keep the moments, notes, and milestones that made each game yours.</p></div><div><span>02</span><h3>Choose with intention</h3><p>Find what to play next without feeds designed to keep you scrolling.</p></div><div><span>03</span><h3>Share the good stuff</h3><p>Trade thoughtful recommendations with the people you trust.</p></div></section>
    </main>}
    <footer className="public-footer"><div className="brand"><span>ℑ</span>Inventory</div><p>A considered home for your gaming life.</p><span>© 2025 INVENTORY</span></footer>
  </div>;
}

// Sign-in page, leads to create account and password reset. 
function Auth({ onEnter, onBack }: { onEnter: (user: User) => void; onBack: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup" | "recover">("signin");
  // What the user has typed into each box
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  // Messages shown under the form, and whether we're waiting on Django
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const switchMode = (next: "signin" | "signup" | "recover") => { setMode(next); setError(""); setInfo(""); };

  // Runs when the main button is clicked (or Enter is pressed in a box)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (mode === "recover") {
      // Password reset emails aren't connected to Django yet.
      setInfo("Password reset isn't set up yet. Ask a teammate to reset it from the Django admin site.");
      return;
    }
    setBusy(true);
    try {
      const user = mode === "signup" ? await signUp(email, password, username) : await signIn(email, password);
      onEnter(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-art">
        <img src={images.neon} alt="Futuristic city at night" />
        <div className="auth-overlay">
          <div className="brand brand-light"><span>ℑ</span>Inventory</div>
          <div><p className="eyebrow">YOUR NEXT ADVENTURE AWAITS</p><h1>Every game.<br />One journey.</h1><p>Track your backlog, celebrate every completion, and discover what to play next.</p></div>
        </div>
      </div>
      <div className="auth-form">
        <form className="auth-card" onSubmit={submit}>
          <button type="button" className="auth-back" onClick={onBack}>← Back to home</button>
          <div className="mobile-brand brand"><span>ℑ</span>Inventory</div>
          <p className="eyebrow purple">{mode === "recover" ? "ACCOUNT RECOVERY" : "WELCOME, PLAYER"}</p>
          <h2>{mode === "signup" ? "Create your account" : mode === "recover" ? "Reset your password" : "Sign in to Inventory"}</h2>
          <p className="muted">{mode === "signup" ? "Start building the backlog you'll actually finish." : mode === "recover" ? "We'll send a secure reset link to your inbox." : "Your library is right where you left it."}</p>
          <label>Email address<input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
          {mode !== "recover" && <label>Password<input type="password" required autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></label>}
          {mode === "signup" && <label>Username<input required autoComplete="username" placeholder="Choose a player name" value={username} onChange={e => setUsername(e.target.value)} /></label>}
          {mode === "signin" && <button type="button" className="text-button forgot" onClick={() => switchMode("recover")}>Forgot password?</button>}
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          {info && <p className="auth-message" role="status">{info}</p>}
          <button type="submit" className="primary wide" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "recover" ? "Send reset link" : "Sign in"}</button>
          {mode === "recover" ? <button type="button" className="text-button center" onClick={() => switchMode("signin")}>Back to sign in</button> :
            <p className="switch">{mode === "signup" ? "Already have an account?" : "New to Inventory?"} <button type="button" onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}>{mode === "signup" ? "Sign in" : "Create account"}</button></p>}
        </form>
      </div>
    </div>
  );
}

const featureMeta: Record<string, { eyebrow: string; title: string; copy: string }> = {
  Settings: { eyebrow: "ACCOUNT", title: "Settings", copy: "Manage your profile, preferences, privacy, and account." },
  Recommendations: { eyebrow: "DISCOVER", title: "Games picked for you", copy: "Personal recommendations based on your ratings, play history, and favorite genres." },
  "Add games": { eyebrow: "YOUR LIBRARY", title: "Add games", copy: "Search the catalog and grow your backlog." },
  "Remove games": { eyebrow: "LIBRARY MANAGEMENT", title: "Remove games", copy: "Choose games you no longer want to track." },
  "Move games": { eyebrow: "ORGANIZE", title: "Move games between lists", copy: "Keep every game in the right place as your plans change." },
  Reviews: { eyebrow: "YOUR VOICE", title: "Reviews", copy: "Rate finished adventures and share what made them memorable." },
  "Sign up": { eyebrow: "NEW PLAYER", title: "Sign up", copy: "Create an account and start tracking your gaming life." },
  "Sign in": { eyebrow: "WELCOME BACK", title: "Sign in", copy: "Continue exactly where you left off." },
  Recovery: { eyebrow: "ACCOUNT RECOVERY", title: "Recover your account", copy: "We'll send a secure recovery link to your verified email." },
  Search: { eyebrow: "GAME DATABASE", title: "Search games", copy: "Search by title, studio, genre, platform, or release year." },
  Journal: { eyebrow: "ACTIVITY TRACKER", title: "Your gaming journal", copy: "A private timeline of every session, milestone, and memory." },

  Media: { eyebrow: "WATCH · VISIT · EXPLORE", title: "Game media hub", copy: "Trailers, official links, screenshots, and artwork in one place." },
};

function FeaturePage({ view, games, onAdd, onRemove, onMove, notify }: { view: string; games: Game[]; onAdd: (game: Game) => void; onRemove: (id: number) => void; onMove: (id: number, status: string) => void; notify: (message: string) => void }) {
  const meta = featureMeta[view];
  const accountView = ["Sign up", "Sign in", "Recovery"].includes(view);
  return <div className="feature-page">
    <div className="feature-head"><div><p className="eyebrow purple">{meta.eyebrow}</p><h1>{meta.title}</h1><p>{meta.copy}</p></div><span>INVENTORY</span></div>

    {accountView && <section className="standalone-card auth-view">
      <div className="auth-view-copy"><span className="feature-glyph"><Icon name={view === "Recovery" ? "link" : "users"} size={25} /></span><h2>{view === "Recovery" ? "Find your account" : view === "Sign in" ? "Good to see you again" : "Begin your quest"}</h2><p>{view === "Recovery" ? "Enter the email connected to your account." : "Use your email and password to continue."}</p></div>
      <div className="view-form"><label>Email address<input placeholder="alex@example.com" /></label>{view !== "Recovery" && <label>Password<input type="password" placeholder="••••••••" /></label>}{view === "Sign up" && <label>Player name<input placeholder="Your public name" /></label>}<button className="primary" onClick={() => notify(view === "Recovery" ? "Recovery email sent" : "Account details saved")}>{view === "Recovery" ? "Send recovery link" : view === "Sign in" ? "Sign in securely" : "Create my account"}</button></div>
    </section>}

    {view === "Settings" && <div className="settings-layout">
      <section className="standalone-card settings-card"><div className="settings-title"><span className="feature-glyph"><Icon name="users" size={22} /></span><div><h2>Profile</h2><p>Update how you appear across Inventory.</p></div></div><div className="settings-form"><label>Display name<input defaultValue="Alex Morgan" /></label><label>Email address<input defaultValue="alex@inventory.gg" /></label><label>Profile visibility<select defaultValue="Friends only"><option>Public</option><option>Friends only</option><option>Private</option></select></label><button className="primary" onClick={() => notify("Settings saved")}>Save changes</button></div></section>
      <section className="standalone-card danger-zone"><span className="feature-glyph danger-glyph"><Icon name="trash" size={25} /></span><div><p className="eyebrow danger">DANGER ZONE</p><h2>Delete your account</h2><p>This permanently removes your profile, library, reviews, journal entries, and friend connections. Export your data first if you'd like to keep a copy.</p><label>Type DELETE to confirm<input placeholder="DELETE" /></label><div><button className="secondary" onClick={() => notify("Your archive is being prepared")}>Export my data</button><button className="delete-button" onClick={() => notify("Confirmation email sent")}>Delete account</button></div></div></section>
    </div>}

    {view === "Search" && <><div className="big-search"><Icon name="search" size={22} /><input autoFocus placeholder="Try “open-world RPG” or “co-op on PC”" /><button className="primary">Search</button></div><div className="filter-row"><button className="active">All games</button><button>PC</button><button>PlayStation</button><button>Xbox</button><button>Nintendo</button></div><FeatureGames games={games} action="Details" notify={notify} /></>}

    {view === "Add games" && <><div className="big-search"><Icon name="search" /><input placeholder="Search more than 250,000 games..." /></div><p className="collection-label">POPULAR THIS WEEK</p><FeatureGames games={games} action="Add" notify={notify} onAction={onAdd} /></>}

    {view === "Remove games" && <><div className="selection-bar"><span><b>{games.length}</b> games in your library</span><span>Select a game to remove it from your account</span></div><FeatureGames games={games} action="Remove" notify={notify} onRemove={onRemove} /></>}

    {view === "Move games" && <section className="board">{["Playing", "Backlog", "Completed"].map(status => <div className="board-column" key={status}><div><h3>{status}</h3><span>{games.filter(g => g.status === status).length}</span></div>{games.filter(g => g.status === status).map(game => <article key={game.id}><img src={game.image} alt="" /><div><b>{game.title}</b><small>{game.platform} · {game.hours}h</small><select value={game.status} onChange={e => onMove(game.id, e.target.value)}>{["Playing", "Backlog", "Completed", "On hold"].map(s => <option key={s}>{s}</option>)}</select></div></article>)}</div>)}</section>}

    {view === "Reviews" && <section className="reviews-layout"><div className="review-editor standalone-card"><p className="collection-label">WRITE A REVIEW</p><div className="review-game"><img src={games[0].image} alt="" /><div><b>{games[0].title}</b><span>32 hours played</span></div></div><div className="stars">{[1,2,3,4,5].map(x => <button key={x}><Icon name="star" /></button>)}</div><textarea placeholder="What did you think? Avoid spoilers if you can..." /><div><label><input type="checkbox" /> Contains spoilers</label><button className="primary" onClick={() => notify("Review published")}>Publish review</button></div></div><div className="review-list"><p className="collection-label">YOUR REVIEWS</p>{games.slice(0,3).map((g,i)=><article key={g.id}><img src={g.image} alt="" /><div><b>{g.title}</b><span>★ {4.5 + i * .1} · {i+2} months ago</span><p>{i === 0 ? "A brilliant world that rewards curiosity at every turn." : "I kept thinking about this one long after the credits."}</p></div></article>)}</div></section>}

    {view === "Journal" && <section className="journal-view"><div className="journal-stats"><div><b>12</b><span>sessions this month</span></div><div><b>34h</b><span>time played</span></div><div><b>3</b><span>milestones reached</span></div><button className="primary" onClick={() => notify("New journal entry started")}><Icon name="plus" /> New entry</button></div><div className="journal-days"><p className="collection-label">OCTOBER 2025</p>{[["14","Echoes of Orion","Reached the floating observatory after two hours exploring the outer rim.","2h 18m"],["12","Midnight Circuit","Finally beat my personal best on the Osaka night route.","48m"],["09","The Last Signal","Started a new adventure. The sound design is already incredible.","1h 32m"]].map(x=><article key={x[0]}><div className="date"><b>{x[0]}</b><span>OCT</span></div><span className="line-dot" /><img src={games.find(g=>g.title===x[1])?.image} alt="" /><div><h3>{x[1]}</h3><p>{x[2]}</p><small><Icon name="clock" size={13} />{x[3]}</small></div></article>)}</div></section>}

    {view === "Sharing" && <section className="sharing-grid"><div className="share-preview"><div className="share-banner"><img src={images.neon} alt="" /><div><span>INVENTORY COLLECTION</span><h2>Alex's must-play adventures</h2><p>12 games · Updated today</p></div></div><div className="share-covers">{games.map(g=><img key={g.id} src={g.image} alt="" />)}</div></div><div className="standalone-card share-settings"><h2>Share your list</h2><p>Anyone with the link can view this collection.</p><label>Share link<div className="copy-field"><input value="inventory.gg/alex/adventures" readOnly /><button onClick={() => notify("Share link copied")}><Icon name="link" /></button></div></label><div className="share-buttons"><button onClick={() => notify("Shared with friends")}><Icon name="users" />Friends</button><button onClick={() => notify("Share sheet opened")}><Icon name="share" />More</button></div></div></section>}

    {view === "Media" && <><section className="media-hero"><img src={images.neon} alt="Echoes of Orion cinematic screenshot" /><button onClick={() => notify("Trailer playing")}><Icon name="play" size={28} /></button><div><span>OFFICIAL TRAILER · 2:14</span><h2>Echoes of Orion</h2></div></section><div className="media-lower"><div><p className="collection-label">SCREENSHOTS</p><div className="screenshot-grid">{Object.values(images).slice(1).map((image,i)=><img src={image} alt={`Game screenshot ${i+1}`} key={image} />)}</div></div><div className="official-links"><p className="collection-label">OFFICIAL LINKS</p>{["Official website","Steam store page","Community wiki"].map(x=><button key={x}><Icon name="link" />{x}<span>↗</span></button>)}</div></div></>}
  </div>;
}

function FeatureGames({ games, action, notify, onAction, onRemove }: { games: Game[]; action: string; notify: (message: string) => void; onAction?: (game: Game) => void; onRemove?: (id: number) => void }) {
  return <div className="catalog-grid">{games.map(game => <article key={game.id}><img src={game.image} alt="" /><div><span>{game.genre} · {game.platform}</span><h3>{game.title}</h3><p><Icon name="star" size={13} /> {game.score} <i /> {game.hours || "—"}h played</p><button className={action === "Remove" ? "remove-action" : "secondary"} onClick={() => { onAction?.(game); onRemove?.(game.id); notify(action === "Remove" ? `${game.title} removed` : action === "Add" ? `${game.title} added` : `Opening ${game.title}`); }}>{action === "Add" && <Icon name="plus" />}{action === "Remove" && <Icon name="trash" />}{action}</button></div></article>)}</div>;
}

export default function App() {
  // The signed-in account from Django (null = nobody signed in)
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [publicView, setPublicView] = useState<"main" | "about" | "signin">("main");
  const [games, setGames] = useState(initialGames);
  const [activeList, setActiveList] = useState("All games");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [currentView, setCurrentView] = useState("Recommendations");

  const visibleGames = useMemo(() => games.filter(g => (activeList === "All games" || g.status === activeList) && g.title.toLowerCase().includes(query.toLowerCase())), [games, activeList, query]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };
  const addGame = (game: Game) => { if (!games.some(g => g.id === game.id)) setGames([...games, game]); setShowAdd(false); notify(`${game.title} added to your backlog`); };
  const moveGame = (id: number, status: string) => { setGames(games.map(g => g.id === id ? { ...g, status, progress: status === "Completed" ? 100 : g.progress } : g)); notify(`Game moved to ${status}`); };

  // When the page first loads, ask Django whether this browser is already signed in
  useEffect(() => { getCurrentUser().then(u => { setUser(u); setCheckingSession(false); }); }, []);

  const handleSignOut = async () => {
    try { await signOut(); } catch {  } // signed out locally even if Django is unreachable //comment here should be in the curly braces
    setUser(null); setProfileOpen(false); setPublicView("main");
  };

  const displayName = user?.username ?? "";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (checkingSession) return null;
  if (!user) {
    if (publicView === "signin") return <Auth onEnter={u => { setUser(u); setCurrentView("Recommendations"); }} onBack={() => setPublicView("main")} />;
    return <PublicSite page={publicView} onNavigate={setPublicView} />;
  }
  return (
    <div className="app-shell">
      <aside>
        <div className="brand"><span>ℑ</span>Inventory</div>
        <nav className="feature-nav">
          <p>LIBRARY</p>
          {[["compass","Recommendations"],["plus","Add games"],["trash","Remove games"],["library","Move games"],["star","Reviews"],["search","Search"],["journal","Journal"],["play","Media"],["settings","Settings"]].map(([icon, label]) =>
            <button key={label} className={currentView === label ? "active" : ""} onClick={() => setCurrentView(label)}><Icon name={icon} />{label}</button>)}
        </nav>
        <div className="side-bottom">
          {profileOpen && <div className="profile-menu side-profile-menu">
            <strong>{displayName}</strong><span>{user.email}</span><hr />
            <button onClick={() => { setCurrentView("Settings"); setProfileOpen(false); }}><Icon name="settings" />Account settings</button>
            <button onClick={handleSignOut}><Icon name="logout" />Sign out</button>
            <button className="danger" onClick={() => { setCurrentView("Settings"); setProfileOpen(false); notify("Open the danger zone to delete your account"); }}><Icon name="trash" />Delete account</button>
          </div>}
          <div className="mini-user" onClick={() => setProfileOpen(!profileOpen)}><div className="avatar">{initials}</div><div><strong>{displayName}</strong><span>Level 12</span></div><button aria-label="Open account menu"><Icon name="more" /></button></div>
        </div>
      </aside>

      <main>
        <header>
          <button className="mobile-logo brand"><span>ℑ</span></button>
          <div className="search"><Icon name="search" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your games..." /><kbd>⌘ K</kbd></div>
          <button className="primary" onClick={() => setShowAdd(true)}><Icon name="plus" /> Add game</button>
        </header>

        <div className="content">
          {currentView !== "Recommendations" ? <FeaturePage view={currentView} games={games} onAdd={addGame} onRemove={id => setGames(games.filter(g => g.id !== id))} onMove={moveGame} notify={notify} /> : <>
          <section className="welcome">
            <div><p className="eyebrow purple">MONDAY, 14 OCTOBER</p><h1>Good evening, {displayName}.</h1><p>Your backlog isn't getting any smaller. Let's change that.</p></div>
            <div className="streak"><span>7</span><div><strong>day streak</strong><small>Keep it going</small></div></div>
          </section>

          <section className="hero">
            <img src={images.neon} alt="Neon-lit futuristic city" />
            <div className="hero-shade" />
            <div className="hero-content">
              <span className="chip">NOW PLAYING</span>
              <h2>Echoes of Orion</h2>
              <p>Lost among the stars. Found in the choices you make.</p>
              <div className="hero-progress"><span><b>68%</b> complete</span><div><i /></div><span>32h played</span></div>
              <div className="hero-actions"><button className="light-button"><Icon name="play" /> Watch trailer</button><button className="glass-button" onClick={() => notify("Journal entry opened")}><Icon name="journal" /> Add journal entry</button><button className="icon-button" onClick={() => notify("Share link copied")}><Icon name="share" /></button></div>
            </div>
            <div className="hero-rating"><Icon name="star" /><b>4.8</b><span>COMMUNITY</span></div>
          </section>

          <section className="stats">
            <div><span className="stat-icon purple-bg"><Icon name="play" /></span><p>Currently playing<strong>{games.filter(g => g.status === "Playing").length}</strong><small>2 this month</small></p></div>
            <div><span className="stat-icon blue-bg"><Icon name="library" /></span><p>In your backlog<strong>{games.filter(g => g.status === "Backlog").length}</strong><small>≈ 148 hours</small></p></div>
            <div><span className="stat-icon green-bg"><Icon name="check" /></span><p>Completed<strong>{games.filter(g => g.status === "Completed").length}</strong><small>6 this year</small></p></div>
            <div><span className="stat-icon orange-bg"><Icon name="clock" /></span><p>Time played<strong>286h</strong><small>+12h this week</small></p></div>
          </section>

          <div className="section-title"><div><p className="eyebrow">YOUR LIBRARY</p><h2>Keep the momentum</h2></div><button onClick={() => setActiveList("All games")}>View all games →</button></div>
          <div className="tabs">{["All games", "Playing", "Backlog", "Completed"].map(x => <button className={activeList === x ? "active" : ""} onClick={() => setActiveList(x)} key={x}>{x}</button>)}</div>
          <section className="game-grid">
            {visibleGames.map(game => <article className="game-card" key={game.id}>
              <div className="cover"><img src={game.image} alt="" /><span>{game.platform}</span><div className="card-menu">
                <button><Icon name="more" /></button><div className="card-pop"><p>Move to</p>{["Playing", "Backlog", "Completed", "On hold"].map(s => <button onClick={() => moveGame(game.id, s)} key={s}>{s}</button>)}<button className="danger" onClick={() => { setGames(games.filter(g => g.id !== game.id)); notify("Game removed"); }}>Remove game</button></div>
              </div></div>
              <div className="card-info"><div><small>{game.genre}</small><h3>{game.title}</h3></div><span className="rating"><Icon name="star" size={13} />{game.score}</span></div>
              <div className="progress-row"><div><i style={{ width: `${game.progress}%`, background: game.color }} /></div><span>{game.progress}%</span></div>
              <div className="card-meta"><span><Icon name="clock" size={14} />{game.hours}h played</span><button onClick={() => notify("Review editor opened")}>Write review</button></div>
            </article>)}
          </section>

          <section className="lower-grid">
            <div className="recommend">
              <div className="section-title"><div><p className="eyebrow">MADE FOR YOU</p><h2>Your next obsession</h2></div><button>See all →</button></div>
              <div className="recommend-card"><img src={images.tower} alt="City towers at night" /><div><span className="match">94% MATCH</span><h3>Citadel Zero</h3><p>A tactical city-builder shaped by impossible choices.</p><div><button className="primary small" onClick={() => addGame(initialGames[3])}><Icon name="plus" /> Add to backlog</button><button className="icon-button"><Icon name="play" /></button><button className="icon-button"><Icon name="link" /></button></div></div></div>
            </div>
            <div className="activity">
              <div className="section-title"><div><p className="eyebrow">JOURNAL</p><h2>Recent activity</h2></div><button>Open journal →</button></div>
              <div className="timeline">
                <div><span className="dot purple-bg"><Icon name="play" size={14} /></span><p><b>You played Echoes of Orion</b><small>2 hours · Today at 8:42 PM</small></p></div>
                <div><span className="dot green-bg"><Icon name="star" size={14} /></span><p><b>Rated Hollow Vale 4.5</b><small>“A world worth getting lost in.” · Yesterday</small></p></div>
                <div><span className="dot blue-bg"><Icon name="users" size={14} /></span><p><b>Sam shared a list with you</b><small>Best co-op games · 2 days ago</small></p></div>
              </div>
            </div>
          </section>
          </>}
        </div>
      </main>

      {showAdd && <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
        <div className="modal" onMouseDown={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAdd(false)}><Icon name="x" /></button><p className="eyebrow purple">SEARCH THE CATALOG</p><h2>Add a game</h2><div className="modal-search"><Icon name="search" /><input autoFocus placeholder="Search by title, genre, or platform..." /></div>
          <p className="modal-label">TRENDING SEARCHES</p>
          {[{ ...initialGames[2], id: 12 }, { ...initialGames[3], id: 13 }, { ...initialGames[1], id: 14, title: "Neon Drifter" }].map(g => <div className="search-result" key={g.id}><img src={g.image} alt="" /><div><strong>{g.title}</strong><span>{g.genre} · {g.platform}</span></div><button onClick={() => addGame(g)}><Icon name="plus" /></button></div>)}
        </div>
      </div>}
      {toast && <div className="toast"><Icon name="check" />{toast}</div>}
    </div>
  );
}
