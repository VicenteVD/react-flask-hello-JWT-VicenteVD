import { useEffect, useState } from "react";
import { useStore } from "../hooks/useGlobalReducer";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function Profile() {
  const { state, actions } = useStore();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });

  useEffect(() => {
    const fetchMe = async () => {
      const res = await fetch(`${BASE}api/me`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
      setForm({ name: data.name, username: data.username, email: data.email, password: "" });
    };
    fetchMe();
  }, [state.token]);

  async function save() {
    try {
      const payload = { name: form.name, username: form.username, email: form.email };
      if (form.password) payload.password = form.password;
      const res = await fetch(`${BASE}api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setProfile(data.user);
      actions.setUser(data.user);
      setEdit(false);
      setForm({ ...form, password: "" });
    } catch (e) {
      alert(e?.msg || "No se pudo actualizar el perfil");
    }
  }

  if (!profile) return null;

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h3 m-0">Perfil</h1>
          {!edit ? (
            <button className="btn btn-outline-secondary" onClick={() => setEdit(true)}>✏️ Editar</button>
          ) : (
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setEdit(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>Guardar</button>
            </div>
          )}
        </div>
      </div>

      {/* Datos */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            {!edit ? (
              <div className="vstack gap-2">
                <div><strong>Nombre:</strong> {profile.name}</div>
                <div><strong>Usuario:</strong> {profile.username}</div>
                <div><strong>Email:</strong> {profile.email}</div>
              </div>
            ) : (
              <div className="vstack gap-3">
                <div>
                  <label className="form-label">Nombre</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Usuario</label>
                  <input className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Nueva contraseña (opcional)</label>
                  <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-outline-danger" onClick={actions.logout}>Cerrar sesión</button>
        </div>
      </div>

      {/* Favoritos */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h5">Tus favoritos</h2>
            <div className="row g-3 mt-1">
              {(profile.favorites || []).map(f => (
                <div className="col-12" key={f.id}>
                  <div className="card">
                    <div className="row g-0">
                      {f.image_url && (
                        <div className="col-4">
                          <img src={f.image_url} alt={f.name} className="img-fluid rounded-start" />
                        </div>
                      )}
                      <div className="col">
                        <div className="card-body">
                          <h5 className="card-title mb-1">{f.name}</h5>
                          <p className="card-text text-muted mb-2">{f.description}</p>
                          <span className="badge bg-secondary">{f.price.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!profile.favorites || profile.favorites.length === 0) && (
                <p className="text-muted">Aún no tienes favoritos. Ve a la carta y marca ★</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
