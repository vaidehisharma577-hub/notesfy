import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { NotesProvider } from "./lib/notes";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import { Login, Register } from "./pages/AuthPages";
import Dashboard from "./pages/Dashboard";
import NotesList from "./pages/NotesList";
import Explore from "./pages/Explore";
import NoteEditor from "./pages/NoteEditor";
import NoteView from "./pages/NoteView";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";

function Protected() {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return (
    <NotesProvider>
      <Layout>
        <Outlet />
      </Layout>
    </NotesProvider>
  );
}

function Guest() {
  const { user } = useAuth();
  return user ? <Navigate to="/app" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Guest />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* public pages (also reachable when logged out) */}
      <Route path="/explore" element={<Explore />} />
      <Route path="/note/:id" element={<NoteView />} />

      <Route path="/app" element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="notes" element={<NotesList mode="all" />} />
        <Route path="public" element={<NotesList mode="public" />} />
        <Route path="private" element={<NotesList mode="private" />} />
        <Route path="trash" element={<NotesList mode="trash" />} />
        <Route path="explore" element={<Explore embedded />} />
        <Route path="new" element={<NoteEditor />} />
        <Route path="edit/:id" element={<NoteEditor />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
