import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Logo from "../components/Logo";
import { ThemeButton } from "../components/Layout";
import NoteCard from "../components/NoteCard";
import { notesApi } from "../lib/notesStore";
import { useAuth } from "../lib/auth";
import { stripHtml, cx } from "../lib/utils";

export function PublicHeader() {
  const { user } = useAuth();
  return (
    <header className="land-nav">
      <Link to="/"><Logo /></Link>
      <nav>
        <Link to="/explore">Public Notes</Link>
        {user ? <Link to="/app" className="btn btn-primary sm">Dashboard</Link> : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary sm">Register</Link>
          </>
        )}
        <ThemeButton />
      </nav>
    </header>
  );
}

export default function Explore({ embedded = false }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params] = useSearchParams();
  const [local, setLocal] = useState("");
  const [tag, setTag] = useState("all");
  const q = (embedded ? params.get("q") || "" : local).toLowerCase();

  useEffect(() => {
    notesApi.publicNotes().then(setNotes).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const tags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags || []))].sort(), [notes]);
  const items = useMemo(() => {
    let l = notes;
    if (tag !== "all") l = l.filter((n) => n.tags?.includes(tag));
    if (q) l = l.filter((n) => (n.title + " " + stripHtml(n.content)).toLowerCase().includes(q));
    return [...l].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [notes, q, tag]);

  const body = (
    <>
      <div className="row-between">
        <div>
          <h1 className="page-title">Explore public notes</h1>
          <p className="page-sub">Discover notes shared by everyone.</p>
        </div>
        {!embedded && (
          <label className="search standalone">
            <Search size={17} />
            <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Search public notes…" />
          </label>
        )}
      </div>
      {tags.length > 0 && (
        <div className="chips">
          <button className={cx("chip", tag === "all" && "on")} onClick={() => setTag("all")}>All</button>
          {tags.map((t) => <button key={t} className={cx("chip", tag === t && "on")} onClick={() => setTag(t)}>{t}</button>)}
        </div>
      )}
      {error && <p className="form-err">{error}</p>}
      {loading ? <p className="muted">Loading…</p> : items.length === 0 ? (
        <div className="empty"><p>No public notes yet.</p></div>
      ) : (
        <div className="grid">
          {items.map((n) => <NoteCard key={n.id} note={n} />)}
        </div>
      )}
    </>
  );

  if (embedded) return body;
  return (
    <div className="landing">
      <PublicHeader />
      <div className="public-wrap">{body}</div>
    </div>
  );
}
