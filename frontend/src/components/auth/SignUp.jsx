import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { api } from "../../lib/api";

export default function SignUp() {
  const [form, setForm] = useState({ username: "", email: "", password: "" }); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth(); const navigate = useNavigate();
  const submit = async (event) => { event.preventDefault(); setLoading(true); setError(""); try { const data = await api.signup(form); localStorage.setItem("token", data.token); localStorage.setItem("userId", data.userId); setCurrentUser(data.userId); navigate("/dashboard"); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  return <main className="auth-page"><section className="auth-panel"><Link to="/" className="brand"><span className="brand-mark">H</span>HubForge</Link><p className="eyebrow">START FREE</p><h1>Create your space.</h1><p className="muted">Your next project has a home.</p><form onSubmit={submit} className="form-card"><label>Name<input required minLength="2" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Ada Lovelace" /></label><label>Email<input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" /></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="At least 6 characters" /></label>{error && <p className="form-error">{error}</p>}<button className="button full" disabled={loading}>{loading ? "Creating…" : "Create workspace"}</button></form><p className="muted">Already a member? <Link to="/auth">Sign in</Link></p></section><aside className="auth-aside"><span className="orb orb-one" /><span className="orb orb-two" /><div><p className="eyebrow">A BETTER DEV HUB</p><h2>Clarity for your craft.</h2><p>One focused home for your repositories and the issues that move them forward.</p></div></aside></main>;
}
