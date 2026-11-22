import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useNotes } from "../lib/notes";
import { initials } from "../lib/utils";

export default function Profile() {
  const { user, updateName, logout } = useAuth();
  const { active, trash } = useNotes();
  const nav = useNavigate();
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <h1 className="page-title">Profile</h1>
      <p className="page-sub">Your account on Notesfy.</p>
      <section className="panel profile">
        <span className="avatar xl">{initials(user.name)}</span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateName(name.trim() || user.name);
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          }}
        >
          <label className="lbl">Display name
            <input className="plain-input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="lbl">Email
            <input className="plain-input" value={user.email} disabled />
          </label>
          <p className="muted">{active.length} notes · {trash.length} in trash</p>
          <div className="row-gap">
            <button className="btn btn-primary sm">{saved ? "Saved ✓" : "Save changes"}</button>
            <button type="button" className="btn btn-ghost sm" onClick={() => { logout(); nav("/"); }}>Log out</button>
          </div>
        </form>
      </section>
    </>
  );
}
