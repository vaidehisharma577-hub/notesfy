import { createContext, useContext, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "/api";
const SESSION_KEY = "notesfy.session";
const NAMES_KEY = "notesfy.names"; // email -> name (backend /login doesn't return the name)

const read = (k, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? fallback;
  } catch {
    return fallback;
  }
};

async function post(path, body) {
  let res;
  try {
    res = await fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Is the backend running on port 8080?");
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text; // backend often replies with plain strings
  }
}

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return {};
  }
}

const prettify = (email) => {
  const base = (email || "").split("@")[0].replace(/[._-]+/g, " ").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Friend";
};

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read(SESSION_KEY, null));

  const value = useMemo(
    () => ({
      user,
      async register({ name, email, password }) {
        const res = await post("/user/register", { name, email, password });
        if (typeof res === "string" && /success/i.test(res) && !/can't/i.test(res)) {
          const names = read(NAMES_KEY, {});
          names[email.toLowerCase()] = name;
          localStorage.setItem(NAMES_KEY, JSON.stringify(names));
          return res;
        }
        throw new Error(typeof res === "string" ? res : res?.msg || "Registration failed");
      },
      async login({ email, password }) {
        const res = await post("/user/login", { email, password });
        if (res && typeof res === "object" && res.token) {
          const claims = decodeJwt(res.token);
          const names = read(NAMES_KEY, {});
          const session = {
            token: res.token,
            email: email.toLowerCase(),
            id: claims.userId || email.toLowerCase(),
            name: res.name || claims.name || names[email.toLowerCase()] || prettify(email),
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          setUser(session);
          return session;
        }
        throw new Error(typeof res === "string" ? res : res?.msg || "Login failed");
      },
      logout() {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
      updateName(name) {
        const next = { ...user, name };
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
        const names = read(NAMES_KEY, {});
        names[user.email] = name;
        localStorage.setItem(NAMES_KEY, JSON.stringify(names));
        setUser(next);
      },
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
