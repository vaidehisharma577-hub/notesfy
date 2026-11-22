import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useNotes } from "../lib/notes";
import { cx, dayKey, excerpt, fmtDate } from "../lib/utils";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { active } = useNotes();
  const nav = useNavigate();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [sel, setSel] = useState(dayKey(today));

  const byDay = useMemo(() => {
    const m = {};
    active.forEach((n) => {
      if (!n.dueDate) return;
      (m[dayKey(n.dueDate)] ||= []).push(n);
    });
    return m;
  }, [active]);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const upcoming = useMemo(
    () => active.filter((n) => n.dueDate && dayKey(n.dueDate) >= dayKey(today)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6),
    [active]
  );
  const selected = byDay[sel] || [];
  const shift = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <>
      <div className="row-between">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">Attach a date to any note and find it here.</p>
        </div>
        <Link to={`/app/new?date=${sel}`} className="btn btn-primary sm"><Plus size={16} /> Note for {fmtDate(sel + "T12:00")}</Link>
      </div>

      <div className="cal-layout">
        <section className="panel">
          <div className="cal-head">
            <h2>{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
            <div className="row-gap">
              <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={18} /></button>
              <button className="btn btn-ghost sm" onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSel(dayKey(today)); }}>Today</button>
              <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="cal-grid">
            {DOW.map((d) => <span className="dow" key={d}>{d}</span>)}
            {cells.map((d) => {
              const k = dayKey(d);
              const count = byDay[k]?.length || 0;
              return (
                <button key={k} onClick={() => setSel(k)} onDoubleClick={() => nav(`/app/new?date=${k}`)}
                  className={cx("day", d.getMonth() !== cursor.getMonth() && "out", k === dayKey(today) && "today", k === sel && "sel", count && "has")}
                  aria-label={`${d.toDateString()}${count ? `, ${count} notes` : ""}`}>
                  {d.getDate()}
                  {count > 0 && <i className="dots">{"•".repeat(Math.min(count, 3))}</i>}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="cal-side">
          <section className="panel">
            <h3>{fmtDate(sel + "T12:00")}</h3>
            {selected.length === 0 ? <p className="muted">No notes on this day. Double-click a date to add one.</p> : selected.map((n) => (
              <Link key={n.id} to={`/app/edit/${n.id}`} className="mini-note">
                <b>{n.title}</b><span>{excerpt(n.content, 70)}</span>
              </Link>
            ))}
          </section>
          <section className="panel">
            <h3>Upcoming</h3>
            {upcoming.length === 0 ? <p className="muted">Nothing scheduled.</p> : upcoming.map((n, i) => (
              <Link key={n.id} to={`/app/edit/${n.id}`} className={"mini-note tint" + (i % 4)}>
                <small>{fmtDate(n.dueDate)}</small><b>{n.title}</b>
              </Link>
            ))}
          </section>
        </aside>
      </div>
    </>
  );
}
