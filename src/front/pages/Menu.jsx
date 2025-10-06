import { useEffect, useState } from "react";
import { useStore } from "../hooks/useGlobalReducer";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function Menu() {
  const [dishes, setDishes] = useState([]);
  const { state } = useStore();

  useEffect(() => {
    fetch(`${BASE}/api/dishes`).then(r => r.json()).then(setDishes).catch(() => setDishes([]));
  }, []);

  async function toggleFav(id) {
    if (!state.token) return alert("Inicia sesión para guardar favoritos");
    try {
      const res = await fetch(`${BASE}/api/favorites/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.token}` },
      });
      if (!res.ok) throw await res.json();
      const data = await res.json(); // { msg, favorites: [ ... ] }
      const favIds = new Set(data.favorites.map(f => f.id));
      setDishes(prev => prev.map(d => ({ ...d, _fav: favIds.has(d.id) })));
    } catch (e) {
      alert(e?.msg || "No se pudo actualizar favoritos");
    }
  }

  useEffect(() => {
    if (!state.user?.favorites) return;
    const favIds = new Set((Array.isArray(state.user.favorites) ? state.user.favorites : []).map(f => f.id || f));
    setDishes(prev => prev.map(d => ({ ...d, _fav: favIds.has(d.id) })));
  }, [state.user]);

  return (
    <section>
      <h1 className="h3 mb-3">Nuestra carta</h1>
      <div className="row g-3">
        {dishes.map(d => (
          <div className="col-12 col-sm-6 col-lg-4" key={d.id}>
            <div className="card h-100 shadow-sm">
              {d.image_url && <img src={d.image_url} className="card-img-top" alt={d.name} />}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{d.name}</h5>
                <p className="card-text text-muted">{d.description}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="fw-bold">{d.price.toFixed(2)} €</span>
                  <button
                    className={`btn btn-sm ${d._fav ? "btn-warning" : "btn-outline-warning"}`}
                    title={d._fav ? "Quitar de favoritos" : "Añadir a favoritos"}
                    onClick={() => toggleFav(d.id)}
                  >
                    {d._fav ? "★" : "☆"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {dishes.length === 0 && <p className="text-muted">No hay platos aún.</p>}
      </div>
    </section>
  );
}
