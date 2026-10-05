import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate("/auth"); };
  return <header className="topbar"><Link className="brand" to="/dashboard"><span className="brand-mark">H</span><span>HubForge</span></Link><nav><Link to="/dashboard">Workspace</Link><Link to="/create" className="button button-small">+ New repository</Link><Link className="avatar" to="/profile">ME</Link><button className="text-button" onClick={signOut}>Sign out</button></nav></header>;
}
