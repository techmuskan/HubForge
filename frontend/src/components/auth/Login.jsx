import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { api } from "../../lib/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth(); const navigate = useNavigate();
  const submit = async (event) => { event.preventDefault(); setLoading(true); setError(""); try { const data = await api.login(form); localStorage.setItem("token", data.token); localStorage.setItem("userId", data.userId); setCurrentUser(data.userId); navigate("/dashboard"); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  return <main className="auth-page"><section className="auth-panel"><Link to="/" className="brand"><span className="brand-mark">H</span>HubForge</Link><p className="eyebrow">WELCOME BACK</p><h1>Build what’s next.</h1><p className="muted">Sign in to your developer workspace.</p><form onSubmit={submit} className="form-card"><label>Email<input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" /></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" /></label>{error && <p className="form-error">{error}</p>}<button className="button full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form><p className="muted">New to HubForge? <Link to="/signup">Create an account</Link></p></section><aside className="auth-aside"><span className="orb orb-one" /><span className="orb orb-two" /><div><p className="eyebrow">ONE WORKSPACE</p><h2>From idea to shipped.</h2><p>Organize repositories, track issues and keep your product momentum in one calm place.</p></div></aside></main>;
}
