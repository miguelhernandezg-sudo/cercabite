import { useState } from "react";
import {
  fetchOwnerView,
  updateRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "./api";

const ETIQUETAS_ESTADO = {
  pending: "Pendiente de aprobación",
  published: "Publicado",
  rejected: "Rechazado",
};

const CATEGORIAS = [
  { value: "comida_corriente", label: "Comida corriente" },
  { value: "comida_rapida", label: "Comida rápida" },
  { value: "pizza", label: "Pizza" },
  { value: "vegetariano", label: "Vegetariano" },
];

/**
 * HU05 — Actualizar información del restaurante.
 * HU06 — Gestionar el menú (agregar, editar, eliminar productos).
 *
 * El propietario se identifica con el id de su restaurante y el
 * ownerToken que recibió al registrarlo (HU04). No hay un sistema de
 * autenticación completo todavía: este panel es el alcance acordado
 * para este sprint.
 */
function ManageRestaurantPanel({ onVolver }) {
  const [restaurantId, setRestaurantId] = useState("");
  const [ownerToken, setOwnerToken] = useState("");
  const [restaurante, setRestaurante] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [nuevoItem, setNuevoItem] = useState({ name: "", price: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  async function cargarRestaurante(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setMensaje(null);
    try {
      const detalle = await fetchOwnerView(restaurantId, ownerToken);
      setRestaurante(detalle);
      setFormulario({
        name: detalle.name,
        address: detalle.address,
        schedule: detalle.schedule,
        category: detalle.category,
        priceLevel: String(detalle.priceLevel),
        lat: String(detalle.lat),
        lng: String(detalle.lng),
      });
    } catch (err) {
      setError(err.message);
      setRestaurante(null);
    } finally {
      setCargando(false);
    }
  }

  async function guardarInformacion(e) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    try {
      const actualizado = await updateRestaurant(restaurantId, ownerToken, formulario);
      setRestaurante({ ...restaurante, ...actualizado });
      setMensaje("Información actualizada correctamente.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function agregarProducto(e) {
    e.preventDefault();
    setError(null);
    try {
      const item = await addMenuItem(restaurantId, ownerToken, nuevoItem);
      setRestaurante({ ...restaurante, menu: [...restaurante.menu, item] });
      setNuevoItem({ name: "", price: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  async function editarProducto(item) {
    const nuevoNombre = window.prompt("Nombre del producto", item.name);
    if (nuevoNombre === null) return;
    const nuevoPrecio = window.prompt("Precio del producto", item.price);
    if (nuevoPrecio === null) return;

    try {
      const actualizado = await updateMenuItem(restaurantId, item.id, ownerToken, {
        name: nuevoNombre,
        price: nuevoPrecio,
      });
      setRestaurante({
        ...restaurante,
        menu: restaurante.menu.map((m) => (m.id === item.id ? actualizado : m)),
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminarProducto(item) {
    try {
      await deleteMenuItem(restaurantId, item.id, ownerToken);
      setRestaurante({ ...restaurante, menu: restaurante.menu.filter((m) => m.id !== item.id) });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="administrar">
      <button className="volver" onClick={onVolver}>
        ← Volver al listado
      </button>
      <h2>Administrar mi restaurante</h2>
      <p>Ingresa el id de tu restaurante y tu código de propietario (ownerToken) para editarlo.</p>

      <form onSubmit={cargarRestaurante} className="formulario formulario-acceso">
        <label>
          Id del restaurante
          <input value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} required />
        </label>
        <label>
          Código de propietario (ownerToken)
          <input value={ownerToken} onChange={(e) => setOwnerToken(e.target.value)} required />
        </label>
        <button type="submit" disabled={cargando}>
          {cargando ? "Cargando..." : "Cargar restaurante"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="aviso-exito">{mensaje}</p>}

      {restaurante && formulario && (
        <>
          <p className={`estado-restaurante estado-${restaurante.status}`}>
            Estado: {ETIQUETAS_ESTADO[restaurante.status] || restaurante.status}
          </p>
          {restaurante.status === "rejected" && restaurante.rejectionReason && (
            <p className="aviso-rechazo">
              Tu restaurante fue rechazado. Motivo: {restaurante.rejectionReason}
            </p>
          )}
          {restaurante.observations && (
            <p className="aviso-observaciones">
              Observaciones del administrador: {restaurante.observations}
            </p>
          )}
          {restaurante.flaggedForReview && (
            <p className="aviso-observaciones">
              Este restaurante fue marcado para revisión por el administrador.
            </p>
          )}

          <h3>Información del restaurante</h3>
          <form onSubmit={guardarInformacion} className="formulario">
            <label>
              Nombre
              <input
                value={formulario.name}
                onChange={(e) => setFormulario({ ...formulario, name: e.target.value })}
                required
              />
            </label>
            <label>
              Dirección
              <input
                value={formulario.address}
                onChange={(e) => setFormulario({ ...formulario, address: e.target.value })}
                required
              />
            </label>
            <label>
              Horario
              <input
                value={formulario.schedule}
                onChange={(e) => setFormulario({ ...formulario, schedule: e.target.value })}
                required
              />
            </label>
            <label>
              Categoría
              <select
                value={formulario.category}
                onChange={(e) => setFormulario({ ...formulario, category: e.target.value })}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nivel de precio
              <select
                value={formulario.priceLevel}
                onChange={(e) => setFormulario({ ...formulario, priceLevel: e.target.value })}
              >
                <option value="1">$ (económico)</option>
                <option value="2">$$ (medio)</option>
                <option value="3">$$$ (alto)</option>
              </select>
            </label>
            <div className="coordenadas">
              <label>
                Latitud
                <input
                  type="number"
                  step="any"
                  value={formulario.lat}
                  onChange={(e) => setFormulario({ ...formulario, lat: e.target.value })}
                  required
                />
              </label>
              <label>
                Longitud
                <input
                  type="number"
                  step="any"
                  value={formulario.lng}
                  onChange={(e) => setFormulario({ ...formulario, lng: e.target.value })}
                  required
                />
              </label>
            </div>
            <button type="submit">Guardar cambios</button>
          </form>

          <h3>Menú</h3>
          <ul className="menu menu-editable">
            {restaurante.menu.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name} — ${Number(item.price).toLocaleString("es-CO")}
                </span>
                <span className="acciones-menu">
                  <button type="button" onClick={() => editarProducto(item)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => eliminarProducto(item)}>
                    Eliminar
                  </button>
                </span>
              </li>
            ))}
            {restaurante.menu.length === 0 && <li>Todavía no hay productos en el menú.</li>}
          </ul>

          <form onSubmit={agregarProducto} className="formulario formulario-inline">
            <label>
              Nuevo producto
              <input
                placeholder="Nombre"
                value={nuevoItem.name}
                onChange={(e) => setNuevoItem({ ...nuevoItem, name: e.target.value })}
                required
              />
            </label>
            <label>
              Precio
              <input
                type="number"
                step="any"
                placeholder="Precio"
                value={nuevoItem.price}
                onChange={(e) => setNuevoItem({ ...nuevoItem, price: e.target.value })}
                required
              />
            </label>
            <button type="submit">Agregar al menú</button>
          </form>
        </>
      )}
    </section>
  );
}

export default ManageRestaurantPanel;
