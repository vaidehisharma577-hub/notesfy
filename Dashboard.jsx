import { Link } from "react-router-dom";
import { FileText, Globe2, Lock, Plus } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useNotes } from "../lib/notes";
import { greeting } from "../lib/utils";
import NoteCard from "../components/NoteCard";

export default function Dashboard() {
  const { user } = useAuth();
  const n = useNotes();
  const pub = n.active.filter((x) => x.visibility === "public").length;
  const recent = [...n.active].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 6);
  const first = user.name.split(" ")[0];

  const stats = [
    { label: "Total notes", value: n.active.length, icon: FileText, tone: "teal" },
    { label: "Public notes", value: pub, icon: Globe2, tone: "blue" },
    { label: "Private notes", value: n.active.length - pub, icon: Lock, tone: "coral" },
  ];

  return (
    <>
      <h1 className="page-title">{greeting()}, {first} 👋</h1>
      <p className="page-sub">Organise your thoughts, one note at a time.</p>

      <div className="stats">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div className="stat" key={label}>
            <span className={"stat-ico " + tone}><Icon size={22} /></span>
            <div>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="row-between">
        <h2>Recent notes</h2>
        <Link to="/app/new" className="btn btn-primary sm"><Plus size={16} /> Create note</Link>
      </div>

      {n.loading ? <p className="muted">Loading…</p> : recent.length === 0 ? (
        <div className="empty">
          <p>No notes yet.</p>
          <Link to="/app/new" className="btn btn-primary">Write your first note</Link>
        </div>
      ) : (
        <div className="grid">
          {recent.map((x) => (
            <NoteCard key={x.id} note={x} owner to={`/app/edit/${x.id}`}
              actions={{ remove: () => n.remove(x.id), pin: () => n.update(x.id, { pinned: !x.pinned }) }} />
          ))}
        </div>
      )}
    </>
  );
}
