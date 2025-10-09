import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useGlobalReducer";

const BASE = import.meta.env.VITE_BACKEND_URL ;

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { actions } = useStore();
  const navigate = useNavigate();

  // Al menos 1 mayúscula y 1 carácter especial (solo para REGISTRO)
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).+$/;

  const validateForm = () => {
    if (isLogin) {
      if (!form.username || !form.password) return "Por favor completa todos los campos.";
    } else {
      if (!form.name || !form.username || !form.email || !form.password) return "Por favor completa todos los campos.";
      if (!passwordRegex.test(form.password))
        return "La contraseña debe incluir al menos una mayúscula y un carácter especial.";
    }
    return "";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validation = validateForm();
    if (validation) return setError(validation);

    try {
      const path = isLogin ? "api/login" : "api/register";
      const payload = isLogin
        ? { username: form.username, password: form.password }
        : { name: form.name, username: form.username, email: form.email, password: form.password };

      const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw await res.json();
      const data = await res.json();
      actions.loginSuccess(data);
      navigate("/profile");
    } catch (err) {
      setError(err?.msg || "Error de autenticación");
    }
  }


  return (
    <section className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="text-center" style={{ maxWidth: "400px", width: "100%" }}>
        {/* 🌿 Logo circular */}
        <div className="mb-4">
          <img
            src="/logo-konoha.png"
            alt="Konoha logo"
            className="rounded-circle shadow-sm"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />
        </div>

        {/* 📝 Formulario */}
        <form className="vstack gap-3 text-start" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <>
              <div>
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="form-label">Usuario</label>
            <input
              className="form-control"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Tu nombre de usuario"
              required
            />
          </div>

          <div>
            <label className="form-label">Contraseña</label>
            <div className="input-group">
              <input
                type={showPass ? "text" : "password"}
                className="form-control"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                aria-describedby="password-toggle"
              />
              <button
                type="button"
                id="password-toggle"
                className="btn btn-outline-secondary"
                onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {!isLogin && (
              <div className="form-text text-muted">
                Debe contener al menos <b>una mayúscula</b> y <b>un carácter especial</b>.
              </div>
            )}
          </div>

          {error && <div className="alert alert-danger py-2 small mt-2">{error}</div>}

          <button type="submit" className="btn btn-primary w-100 mt-3">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        {/*  Enlace pequeño para alternar */}
        <p className="mt-3 text-muted small">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setForm({ name: "", username: "", email: "", password: "" });
              setShowPass(false);
            }}
          >
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </section>
  );
}
