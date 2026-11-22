import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import Logo from "../components/Logo";
import { ThemeButton } from "../components/Layout";
import { Hero } from "./Landing";
import { useAuth } from "../lib/auth";

function Shell({ title, sub, children, foot }) {
  return (
    <div className="auth-page">
      <div className="auth-theme"><ThemeButton /></div>
      <div className="auth-side">
        <Link to="/"><Logo size={36} /></Link>
        <Hero />
        <p className="muted">{sub}</p>
      </div>
      <div className="auth-card">
        <h1>{title}</h1>
        {children}
        <p className="auth-foot">{foot}</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type = "text", right, ...rest }) {
  return (
    <label className="field">
      <Icon size={17} />
      <input type={type} required {...rest} />
      {right}
    </label>
  );
}

function PasswordField(props) {
  const [show, setShow] = useState(false);
  return (
    <Field
      icon={Lock}
      type={show ? "text" : "password"}
      right={
        <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Toggle password">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
      {...props}
    />
  );
}

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await login(f);
      nav(loc.state?.from || "/app", { replace: true });
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Login" sub="Sign in to continue your journey" foot={<>Don't have an account? <Link to="/register">Register</Link></>}>
      <form onSubmit={submit}>
        <Field icon={Mail} type="email" placeholder="Email" autoComplete="email" value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })} />
        <PasswordField placeholder="Password" autoComplete="current-password" value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p className="form-err" role="alert">{err}</p>}
        <button className="btn btn-primary block" disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
      </form>
    </Shell>
  );
}

export function Register() {
  const { register, login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await register(f);
      await login({ email: f.email, password: f.password });
      nav("/app", { replace: true });
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Create account" sub="Your thoughts. Your notes. Your space." foot={<>Already have an account? <Link to="/login">Login</Link></>}>
      <form onSubmit={submit}>
        <Field icon={User} placeholder="Full name" autoComplete="name" value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Field icon={Mail} type="email" placeholder="Email" autoComplete="email" value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })} />
        <PasswordField placeholder="Password (min 6 characters)" minLength={6} autoComplete="new-password" value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p className="form-err" role="alert">{err}</p>}
        <button className="btn btn-primary block" disabled={busy}>{busy ? "Creating…" : "Register"}</button>
      </form>
    </Shell>
  );
}
