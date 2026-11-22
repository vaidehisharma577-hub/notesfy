import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Globe2,
  Lock,
  PlusCircle,
  UserRound,
  LogOut,
  Search,
  Moon,
  Sun,
  CalendarDays,
  NotebookText,
  Trash2,
  Menu,
} from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../lib/auth";
import { initials } from "../lib/utils";

export function useTheme() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("notesfy.theme", next);
    } catch {}
    setTheme(next);
  };
  return [theme, toggle];
}

export function ThemeButton() {
  const [theme, toggle] = useTheme();
  return (
    <button className="icon-btn" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/notes", label: "My Notes", icon: NotebookText },
  { to: "/app/explore", label: "Public Notes", icon: Globe2 },
  { to: "/app/private", label: "Private Notes", icon: Lock },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/trash", label: "Trash", icon: Trash2 },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => setOpen(false), [loc.pathname]);

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSearch = (v) => {
    setQ(v);
    const target = loc.pathname.startsWith("/app/explore") ? "/app/explore" : "/app/notes";
    nav(`${target}${v ? `?q=${encodeURIComponent(v)}` : ""}`, { replace: loc.pathname === target });
  };

  return (
    <div className="shell">
      <aside className={"sidebar" + (open ? " open" : "")}>
        <Link to="/app" className="side-logo">
          <Logo />
        </Link>
        <Link to="/app/new" className="btn btn-accent side-create">
          <PlusCircle size={18} /> New note
        </Link>
        <nav className="side-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => "side-link" + (isActive ? " active" : "")}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <NavLink to="/app/profile" className={({ isActive }) => "side-link" + (isActive ? " active" : "")}>
            <UserRound size={18} /> Profile
          </NavLink>
        </nav>
        <button
          className="side-link side-logout"
          onClick={() => {
            logout();
            nav("/");
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <label className="search">
            <Search size={17} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search notes…"
              aria-label="Search notes"
            />
            <kbd>⌘K</kbd>
          </label>
          <ThemeButton />
          <Link to="/app/profile" className="avatar" title={user.name}>
            {initials(user.name)}
          </Link>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
