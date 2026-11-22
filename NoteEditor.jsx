import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Globe2, Lock, Save, X, CalendarClock } from "lucide-react";
import RichEditor from "../components/RichEditor";
import { notesApi } from "../lib/notesStore";
import { useNotes } from "../lib/notes";
import { cx, dayKey } from "../lib/utils";

export default function NoteEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const notes = useNotes();
  const [ready, setReady] = useState(!id);
  const [form, setForm] = useState({
    title: "",
    content: "",
    visibility: "private",
    tags: [],
    dueDate: params.get("date") || "",
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    notesApi.get(id).then((n) => {
      setForm({
        title: n.title,
        content: n.content,
        visibility: n.visibility,
        tags: n.tags || [],
        dueDate: n.dueDate ? dayKey(n.dueDate) : "",
      });
      setReady(true);
    }).catch((e) => setErr(e.message));
  }, [id]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const addTag = (raw) => {
    const t = raw.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
    if (t && !form.tags.includes(t)) set("tags")([...form.tags, t]);
    setTagInput("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setErr("Give your note a title.");
    setSaving(true);
    setErr("");
    const payload = {
      ...form,
      title: form.title.trim(),
      dueDate: form.dueDate ? new Date(form.dueDate + "T09:00:00").toISOString() : null,
    };
    try {
      if (id) await notes.update(id, payload);
      else await notes.create(payload);
      nav("/app/notes");
    } catch (x) {
      setErr(x.message);
      setSaving(false);
    }
  };

  if (err && !ready) return <p className="form-err">{err}</p>;
  if (!ready) return <p className="muted">Loading…</p>;

  return (
    <form onSubmit={save} className="editor-page">
      <div className="row-between">
        <h1 className="page-title">{id ? "Edit note" : "Create new note"}</h1>
        <div className="row-gap">
          <button type="button" className="btn btn-ghost sm" onClick={() => nav(-1)}><X size={16} /> Cancel</button>
          <button className="btn btn-primary sm" disabled={saving}><Save size={16} /> {saving ? "Saving…" : "Save note"}</button>
        </div>
      </div>

      <input className="title-input" placeholder="Note title" value={form.title}
        onChange={(e) => set("title")(e.target.value)} aria-label="Note title" autoFocus={!id} />

      <div className="meta-row">
        <div className="seg-radio" role="radiogroup" aria-label="Visibility">
          <button type="button" role="radio" aria-checked={form.visibility === "private"}
            className={cx(form.visibility === "private" && "on")} onClick={() => set("visibility")("private")}>
            <Lock size={15} /> Private
          </button>
          <button type="button" role="radio" aria-checked={form.visibility === "public"}
            className={cx(form.visibility === "public" && "on")} onClick={() => set("visibility")("public")}>
            <Globe2 size={15} /> Public
          </button>
        </div>
        <label className="date-field">
          <CalendarClock size={16} />
          <input type="date" value={form.dueDate} onChange={(e) => set("dueDate")(e.target.value)} aria-label="Reminder date" />
        </label>
        <div className="tag-input">
          {form.tags.map((t) => (
            <span className="chip on" key={t}>
              #{t}
              <button type="button" aria-label={`Remove ${t}`} onClick={() => set("tags")(form.tags.filter((x) => x !== t))}>×</button>
            </span>
          ))}
          <input value={tagInput} placeholder="Add tag + Enter"
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
              else if (e.key === "Backspace" && !tagInput && form.tags.length) set("tags")(form.tags.slice(0, -1));
            }}
            onBlur={() => tagInput && addTag(tagInput)} />
        </div>
      </div>

      <RichEditor value={form.content} onChange={set("content")} />
      {err && <p className="form-err" role="alert">{err}</p>}
    </form>
  );
}
