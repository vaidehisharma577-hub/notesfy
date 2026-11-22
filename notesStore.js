/**
 * Notes data layer. Every page talks to `notesApi` only.
 *
 *  - VITE_NOTES_API=false (default): notes live in this browser's localStorage.
 *    Your current backend only has login/register, so this works out of the box.
 *  - VITE_NOTES_API=true: same calls go to REST routes (see /backend-additions).
 */
const API = import.meta.env.VITE_API_URL || "/api";
const USE_API = String(import.meta.env.VITE_NOTES_API) === "true";
const KEY = "notesfy.notes.v1";
const SESSION_KEY = "notesfy.session";

const session = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const now = () => new Date().toISOString();

/* ---------------- local implementation ---------------- */
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};
const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));
const me = () => session()?.email;

const SEED = [
  {
    title: "Welcome to Notesfy",
    visibility: "public",
    tags: ["welcome", "tips"],
    content:
      "<h2>Your thoughts. Your notes. Your space.</h2><p>Try the toolbar: <strong>bold</strong>, <em>italic</em>, <mark>highlights</mark>, tables and checklists.</p><ul data-type=\"taskList\"><li data-checked=\"true\" data-type=\"taskItem\"><label><input type=\"checkbox\" checked=\"checked\"><span></span></label><div><p>Create your first note</p></div></li><li data-checked=\"false\" data-type=\"taskItem\"><label><input type=\"checkbox\"><span></span></label><div><p>Pin it, tag it, share it</p></div></li></ul>",
  },
  {
    title: "My Journal",
    visibility: "private",
    tags: ["personal"],
    content: "<p>Only you can see this note. Use private notes for ideas, drafts and diary entries.</p>",
  },
  {
    title: "DSA Tips",
    visibility: "public",
    tags: ["dsa", "study"],
    content:
      "<h3>Patterns worth knowing</h3><ul><li>Two pointers</li><li>Sliding window</li><li>BFS / DFS on graphs</li></ul><blockquote>Solve one problem a day. Consistency beats intensity.</blockquote>",
  },
];

const local = {
  async seedIfEmpty() {
    const email = me();
    if (!email) return;
    const list = load();
    if (list.some((n) => n.owner === email)) return;
    const t = Date.now();
    SEED.forEach((s, i) =>
      list.push({
        id: uid(),
        owner: email,
        ownerName: session()?.name,
        views: i === 0 ? 12 : 0,
        pinned: i === 0,
        deletedAt: null,
        dueDate: null,
        createdAt: new Date(t - i * 86400000).toISOString(),
        updatedAt: new Date(t - i * 86400000).toISOString(),
        ...s,
      })
    );
    save(list);
  },
  async mine() {
    return load().filter((n) => n.owner === me());
  },
  async publicNotes() {
    return load().filter((n) => n.visibility === "public" && !n.deletedAt);
  },
  async get(id) {
    const n = load().find((x) => x.id === id);
    if (!n) throw new Error("Note not found");
    if (n.visibility === "private" && n.owner !== me()) throw new Error("This note is private");
    return n;
  },
  async create(data) {
    const list = load();
    const note = {
      id: uid(),
      owner: me(),
      ownerName: session()?.name,
      title: "Untitled",
      content: "",
      visibility: "private",
      tags: [],
      pinned: false,
      views: 0,
      dueDate: null,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    list.unshift(note);
    save(list);
    return note;
  },
  async update(id, patch) {
    const list = load();
    const i = list.findIndex((n) => n.id === id && n.owner === me());
    if (i < 0) throw new Error("Note not found");
    list[i] = { ...list[i], ...patch, updatedAt: now() };
    save(list);
    return list[i];
  },
  async remove(id) {
    return local.update(id, { deletedAt: now() });
  },
  async restore(id) {
    return local.update(id, { deletedAt: null });
  },
  async purge(id) {
    save(load().filter((n) => !(n.id === id && n.owner === me())));
  },
  async view(id) {
    const list = load();
    const i = list.findIndex((n) => n.id === id);
    if (i >= 0 && list[i].owner !== me()) {
      list[i].views = (list[i].views || 0) + 1;
      save(list);
    }
  },
};

/* ---------------- REST implementation ---------------- */
async function http(method, path, body) {
  const token = session()?.token;
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.msg === "Login First") throw new Error(data?.msg || "Request failed");
  return data;
}
const norm = (n) => ({ ...n, id: n._id || n.id });

const remote = {
  seedIfEmpty: async () => {},
  mine: async () => (await http("GET", "/notes")).map(norm),
  publicNotes: async () => (await http("GET", "/notes/public")).map(norm),
  get: async (id) => norm(await http("GET", `/notes/${id}`)),
  create: async (d) => norm(await http("POST", "/notes", d)),
  update: async (id, p) => norm(await http("PUT", `/notes/${id}`, p)),
  remove: (id) => http("DELETE", `/notes/${id}`),
  restore: (id) => http("PATCH", `/notes/${id}/restore`),
  purge: (id) => http("DELETE", `/notes/${id}/purge`),
  view: (id) => http("POST", `/notes/${id}/view`).catch(() => {}),
};

export const notesApi = USE_API ? remote : local;
export const isOwner = (note) => {
  const s = session();
  return !!s && String(note.owner) === String(USE_API ? s.id : s.email);
};
