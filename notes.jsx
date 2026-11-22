import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { notesApi } from "./notesStore";
import { useAuth } from "./auth";

const Ctx = createContext(null);
export const useNotes = () => useContext(Ctx);

export function NotesProvider({ children }) {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      await notesApi.seedIfEmpty();
      setAll(await notesApi.mine());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const value = useMemo(() => {
    const active = all.filter((n) => !n.deletedAt);
    return {
      loading,
      error,
      active,
      trash: all.filter((n) => n.deletedAt),
      tags: [...new Set(active.flatMap((n) => n.tags || []))].sort(),
      refresh,
      async create(d) {
        const n = await notesApi.create(d);
        await refresh();
        return n;
      },
      async update(id, p) {
        const n = await notesApi.update(id, p);
        await refresh();
        return n;
      },
      async remove(id) {
        await notesApi.remove(id);
        await refresh();
      },
      async restore(id) {
        await notesApi.restore(id);
        await refresh();
      },
      async purge(id) {
        await notesApi.purge(id);
        await refresh();
      },
    };
  }, [all, loading, error, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
