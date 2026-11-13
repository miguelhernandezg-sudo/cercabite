import { useState } from "react";
import {
  fetchAdminRestaurants,
  setRestaurantObservations,
  approveRestaurant,
  rejectRestaurant,
  flagRestaurantForReview,
  markRestaurantReviewed,
} from "./api";

/**
 * HU07 — Validar la información de restaurantes registrados.
 * HU08 — Aprobar o rechazar el registro de un restaurante.
 * HU09 — Supervisar periódicamente los restaurantes publicados.
 *
 * El administrador se identifica con un token único (ver
 * backend/src/utils/adminAuth.js). No hay un sistema de autenticación
 * completo todavía: alcance acordado para este sprint.
 */
function AdminPanel({ onVolver }) {
  const [adminToken, setAdminToken] = useState("");
  const [estado, setEstado] = useState("pending"); // pending | published
  const [restaurantes, setRestaurantes] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function cargar(estadoElegido = estado) {
    setEstado(estadoElegido);
    setCargando(true);
    setError(null);
    try {
      const data = await fetchAdminRestaurants(estadoElegido, adminToken);
      setRestaurantes(data.results);
    } catch (err) {
      setError(err.message);
      setRestaurantes(null);
    } finally {
      setCargando(false);
    }
  }

  function actualizarEnLista(id, cambios) {
    setRestaurantes((lista) => lista.map((r) => (r.id === id ? { ...r, ...cambios } : r)));
  }

  function quitarDeLista(id) {
    setRestaurantes((lista) => lista.filter((r) => r.id !== id));
  }

  async function registrarObservaciones(r) {
    const texto = window.prompt("Observaciones para el propietario", r.observations || "");
    if (texto === null || !texto.trim()) return;
    try {
      const actualizado = await setRestaurantObservations(r.id, adminToken, texto);
      actualizarEnLista(r.id, actualizado);
    } catch (err) {
      setError(err.message);
    }
  }

  async function aprobar(r) {
    try {
      await approveRestaurant(r.id, adminToken);
      quitarDeLista(r.id); // deja de estar "pendiente"
    } catch (err) {
      setError(err.message);
    }
  }

  async function rechazar(r) {
    const motivo = window.prompt("Motivo del rechazo (se le informará al propietario)");
    if (motivo === null || !motivo.trim()) return;
    try {
      await rejectRestaurant(r.id, adminToken, motivo);
      quitarDeLista(r.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function marcarParaRevision(r) {
    try {
      const actualizado = await flagRestaurantForReview(r.id, adminToken);
      actualizarEnLista(r.id, actualizado);
    } catch (err) {
      setError(err.message);
    }
  }

  async function registrarSupervision(r) {
    try {
      const actualizado = await markRestaurantReviewed(r.id, adminToken);
      actualizarEnLista(r.id, actualizado);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="admin">
      <button className="volver" onClick={onVolver}>
        ← Volver al listado
      </button>
      <h2>Panel de administrador</h2>
      <p>Valida restaurantes pendientes (HU07, HU08) y supervisa los ya publicados (HU09).</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          cargar(estado);
        }}
        className="formulario formulario-acceso"
      >
        <label>
          Token de administrador
          <input value={adminToken} onChange={(e) => setAdminToken(e.target.value)} required />
        </label>
        <div className="tabs-admin">
          <button type="button" className={estado === "pending" ? "activo" : ""} onClick={() => cargar("pending")}>
            Pendientes
          </button>
          <button
            type="button"
            className={estado === "published" ? "activo" : ""}
            onClick={() => cargar("published")}
          >
            Publicados
          </button>
        </div>
        <button type="submit" disabled={cargando}>
          {cargando ? "Cargando..." : "Actualizar lista"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {restaurantes && restaurantes.length === 0 && <p>No hay restaurantes en este estado.</p>}

      {restaurantes && restaurantes.length > 0 && (
        <ul className="lista-admin">
          {restaurantes.map((r) => (
            <li key={r.id} className="tarjeta">
              <h3>
                {r.name} <span className="id-restaurante">#{r.id}</span>
              </h3>
              <p>{r.address}</p>
              <p className="horario">{r.schedule}</p>
              {r.observations && <p className="aviso-observaciones">Observación: {r.observations}</p>}
              {estado === "published" && (
                <p>
                  {r.flaggedForReview ? "🚩 Marcado para revisión" : "Sin marcar"} ·{" "}
                  {r.lastReviewedAt
                    ? `Última supervisión: ${new Date(r.lastReviewedAt).toLocaleDateString("es-CO")}`
                    : "Nunca supervisado"}
                </p>
              )}

              <div className="acciones-admin">
                {estado === "pending" && (
                  <>
                    <button type="button" onClick={() => registrarObservaciones(r)}>
                      Observaciones
                    </button>
                    <button type="button" onClick={() => aprobar(r)}>
                      Aprobar
                    </button>
                    <button type="button" onClick={() => rechazar(r)}>
                      Rechazar
                    </button>
                  </>
                )}
                {estado === "published" && (
                  <>
                    <button type="button" onClick={() => marcarParaRevision(r)}>
                      Marcar para revisión
                    </button>
                    <button type="button" onClick={() => registrarSupervision(r)}>
                      Registrar supervisión
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminPanel;
