import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, Pencil, ArrowLeft } from "lucide-react";
import { notesApi, isOwner } from "../lib/notesStore";
import DOMPurify from "dompurify";
import { fmtDate } from "../lib/utils";
import { PublicHeader } from "./Explore";

export default function NoteView() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    notesApi.get(id).then((n) => { setNote(n); notesApi.view(id); }).catch((e) => setErr(e.message));
  }, [id]);

  return (
    <div className="landing">
      <PublicHeader />
      <article className="public-wrap reader">
        <Link to="/explore" className="back"><ArrowLeft size={16} /> Public notes</Link>
        {err && <p className="form-err">{err}</p>}
        {!note && !err && <p className="muted">Loading…</p>}
        {note && (
          <>
            <span className={"badge " + note.visibility}>{note.visibility === "public" ? "Public" : "Private"}</span>
            <h1 className="reader-title">{note.title}</h1>
            <p className="meta">
              {note.ownerName ? `by ${note.ownerName} · ` : ""}{fmtDate(note.updatedAt)} · <Eye size={14} /> {note.views || 0}
              {isOwner(note) && <Link to={`/app/edit/${note.id}`} className="btn btn-ghost sm" style={{ marginLeft: 12 }}><Pencil size={14} /> Edit</Link>}
            </p>
            {note.tags?.length > 0 && <div className="chips tiny">{note.tags.map((t) => <span className="chip" key={t}>#{t}</span>)}</div>}
            <div className="prose read" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content || "") }} />
          </>
        )}
      </article>
    </div>
  );
}
