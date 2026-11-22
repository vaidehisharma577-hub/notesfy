import { Link } from "react-router-dom";
import { ArrowRight, Globe2, Lock, CalendarDays, PenLine, Tags, Moon } from "lucide-react";
import Logo from "../components/Logo";
import { ThemeButton } from "../components/Layout";
import { useAuth } from "../lib/auth";

export function Hero() {
  return (
    <svg viewBox="0 0 420 380" className="hero-art" role="img" aria-label="Notebook illustration">
      <ellipse cx="215" cy="330" rx="150" ry="20" fill="var(--primary)" opacity=".12" />
      <path d="M60 190c0-70 60-130 140-135s150 40 150 115-50 135-135 140S60 260 60 190z" fill="var(--primary-soft)" />
      <g transform="rotate(-6 210 190)">
        <rect x="120" y="70" width="190" height="240" rx="18" fill="var(--primary)" />
        <rect x="136" y="70" width="174" height="240" rx="14" fill="var(--primary-600)" />
        <rect x="112" y="84" width="14" height="212" rx="7" fill="var(--accent)" />
        <rect x="156" y="104" width="130" height="150" rx="10" fill="var(--surface)" opacity=".96" />
        <path d="M172 134h98M172 158h80M172 182h92M172 206h60" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" opacity=".55" />
        <circle cx="262" cy="232" r="14" fill="var(--accent)" />
        <path d="M256 232l5 5 9-10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="rotate(32 340 230)">
        <rect x="330" y="120" width="16" height="170" rx="8" fill="var(--sun)" />
        <path d="M330 290l8 24 8-24z" fill="var(--ink)" />
      </g>
      <path d="M92 74l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="var(--sun)" />
      <path d="M368 60l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="var(--accent)" />
    </svg>
  );
}

const FEATURES = [
  [PenLine, "Rich editor", "Headings, highlights, checklists, tables, quotes and code."],
  [Globe2, "Share publicly", "Publish a note for everyone, or keep it just for you."],
  [Lock, "Private by default", "Your journal stays yours until you say otherwise."],
  [Tags, "Tags & search", "Filter by tag, sort, and jump to anything with ⌘K."],
  [CalendarDays, "Calendar view", "Attach a date to a note and see your month at a glance."],
  [Moon, "Light & dark", "Easy on the eyes at any hour."],
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <header className="land-nav">
        <Logo />
        <nav>
          <Link to="/explore">Public Notes</Link>
          {user ? (
            <Link to="/app" className="btn btn-primary sm">Open app</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary sm">Register</Link>
            </>
          )}
          <ThemeButton />
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Notes, minus the clutter</p>
          <h1>
            Welcome to <span>Notesfy</span>
          </h1>
          <p className="lead">
            Capture ideas, organise them with tags, and share the good ones with the world — or keep them private.
          </p>
          <div className="hero-cta">
            <Link to={user ? "/app" : "/register"} className="btn btn-primary lg">
              Get started <ArrowRight size={18} />
            </Link>
            <Link to="/explore" className="btn btn-ghost lg">Explore public notes</Link>
          </div>
        </div>
        <Hero />
      </section>

      <section className="features">
        {FEATURES.map(([Icon, t, d]) => (
          <div className="feature" key={t}>
            <span className="feature-ico"><Icon size={20} /></span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </section>
      <footer className="land-foot">© {new Date().getFullYear()} Notesfy</footer>
    </div>
  );
}
