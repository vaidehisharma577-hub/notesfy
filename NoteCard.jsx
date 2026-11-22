import { Link, useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, Pin, PinOff, RotateCcw, CalendarClock } from "lucide-react";
import { excerpt, fmtDate } from "../lib/utils";

export default function NoteCard({ note, owner = false, trash = false, list = false, actions = {}, to }) {
  const nav = useNavigate();
  const href = to || `/note/${note.id}`;
  const stop = (fn) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    fn?.();
  };

  return (
    <article className={"note-card" + (list ? " is-list" : "")} onClick={() => nav(href)} tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && nav(href)}>
      <div className="note-top">
        <span className={"badge " + note.visibility}>{note.visibility === "public" ? "Public" : "Private"}</span>
        {note.pinned && <Pin size={14} className="pin-mark" />}
      </div>
      <h3 className="note-title">
        <Link to={href} onClick={(e) => e.stopPropagation()}>
          {note.title || "Untitled"}
        </Link>
      </h3>
      <p className="note-excerpt">{excerpt(note.content) || "Empty note"}</p>
      {note.tags?.length > 0 && (
        <div className="chips tiny">
          {note.tags.map((t) => (
            <span key={t} className="chip">#{t}</span>
          ))}
        </div>
      )}
      <div className="note-foot">
        <span className="meta">
          {fmtDate(note.updatedAt || note.createdAt)}
          {note.dueDate && (
            <span className="due" title="Reminder date">
              <CalendarClock size={13} /> {fmtDate(note.dueDate)}
            </span>
          )}
        </span>
        <span className="note-actions">
          {!owner && (
            <span className="meta">
              <Eye size={14} /> {note.views || 0}
            </span>
          )}
          {owner && !trash && (
            <>
              <button className="icon-btn sm" title={note.pinned ? "Unpin" : "Pin"} onClick={stop(actions.pin)}>
                {note.pinned ? <PinOff size={15} /> : <Pin size={15} />}
              </button>
              <button className="icon-btn sm" title="Edit" onClick={stop(() => nav(`/app/edit/${note.id}`))}>
                <Pencil size={15} />
              </button>
              <button className="icon-btn sm danger" title="Move to trash" onClick={stop(actions.remove)}>
                <Trash2 size={15} />
              </button>
            </>
          )}
          {owner && trash && (
            <>
              <button className="icon-btn sm" title="Restore" onClick={stop(actions.restore)}>
                <RotateCcw size={15} />
              </button>
              <button className="icon-btn sm danger" title="Delete forever" onClick={stop(actions.purge)}>
                <Trash2 size={15} />
              </button>
            </>
          )}
        </span>
      </div>
    </article>
  );
}
