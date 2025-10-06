import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useGlobalReducer";

export default function Navbar() {
  const { state, actions } = useStore();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg bg-light border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🌿 Konoha</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navKonoha">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="navKonoha" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink className="nav-link" to="/menu">Carta</NavLink></li>
          </ul>
          <div className="d-flex gap-2">
            {state.user ? (
              <>
                <NavLink to="/profile" className="btn btn-outline-secondary">@{state.user.username || state.user.name}</NavLink>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => { actions.logout(); navigate("/auth"); }}
                >Cerrar sesión</button>
              </>
            ) : (
              <NavLink to="/auth" className="btn btn-primary">Entrar</NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
