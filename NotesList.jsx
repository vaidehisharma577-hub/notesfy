import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowDownUp, LayoutGrid, List, Plus } from "lucide-react";
import { useNotes } from "../lib/notes";
import { stripHtml, cx } from "../lib/utils";
import NoteCard from "../components/NoteCard";

const TITLES = {
  all: ["My Notes", "Everything you've written."],
  public: ["Public Notes", "Notes you've shared with everyone."],
  private: ["Private Notes 🔒", "Your personal notes, only visible to you."],
  trash: ["Trash", "Deleted notes. Restore them or remove them for good."],
};
const SORTS = { updated: "Last updated", created: "Newest", title: "Title A–Z" };

export default function NotesList({ mode }) {
  const n = useNotes();
  const [params] = useSearchParams();
  const q = (params.get("q") || "").toLowerCase();
  const [tag, setTag] = useState("all");
  const [view, setView] = useState(() => localStorage.getItem("notesfy.view") || "grid");
  const [sort, setSort] = useState("updated");

  const setViewPersist = (v) => {
    setView(v);
    try { localStorage.setItem("notesfy.view", v); } catch {}
  };

  const items = useMemo(() => {
    let list = mode === "trash" ? n.trash : n.active;
    if (mode === "public") list = list.filter((x) => x.visibility === "public");
    if (mode === "private") list = list.filter((x) => x.visibility === "private");
    if (tag !== "all") list = list.filter((x) => x.tags?.includes(tag));
    if (q) list = list.filter((x) => (x.title + " " + stripHtml(x.content) + " " + (x.tags || []).join(" ")).toLowerCase().includes(q));
    const by = {
      updated: (a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""),
      created: (a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""),
      title: (a, b) => a.title.localeCompare(b.title),
    }[sort];
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || by(a, b));
  }, [n.active, n.trash, mode, tag, q, sort]);

  const [title, sub] = TITLES[mode];
  const trash = mode === "trash";

  return (
    <>
      <div className="row-between">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{sub}</p>
        </div>
        {!trash && <Link to="/app/new" className="btn btn-primary sm"><Plus size={16} /> Create note</Link>}
      </div>

      {!trash && n.tags.length > 0 && (
        <div className="chips" role="tablist" aria-label="Filter by tag">
          <button className={cx("chip", tag === "all" && "on")} onClick={() => setTag("all")}>All notes</button>
          {n.tags.map((t) => (
            <button key={t} className={cx("chip", tag === t && "on")} onClick={() => setTag(t)}>{t}</button>
          ))}
        </div>
      )}

      <div className="toolbar-row">
        <span className="muted">{items.length} {items.length === 1 ? "note" : "notes"}{q && ` matching “${q}”`}</span>
        <div className="seg">
          <label className="sort">
            <ArrowDownUp size={15} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort notes">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <button className={cx("icon-btn", view === "grid" && "on")} onClick={() => setViewPersist("grid")} aria-label="Grid view"><LayoutGrid size={17} /></button>
          <button className={cx("icon-btn", view === "list" && "on")} onClick={() => setViewPersist("list")} aria-label="List view"><List size={17} /></button>
        </div>
      </div>

      {n.error && <p className="form-err">{n.error}</p>}
      {n.loading ? <p className="muted">Loading…</p> : items.length === 0 ? (
        <div className="empty"><p>{trash ? "Trash is empty." : q ? "No notes match your search." : "Nothing here yet."}</p></div>
      ) : (
        <div className={view === "grid" ? "grid" : "stack"}>
          {items.map((x) => (
            <NoteCard key={x.id} note={x} owner trash={trash} list={view === "list"}
              to={trash ? `/app/edit/${x.id}` : `/app/edit/${x.id}`}
              actions={{
                remove: () => n.remove(x.id),
                restore: () => n.restore(x.id),
                purge: () => window.confirm("Delete this note forever?") && n.purge(x.id),
                pin: () => n.update(x.id, { pinned: !x.pinned }),
              }} />
          ))}
        </div>
      )}
    </>
  );
}
