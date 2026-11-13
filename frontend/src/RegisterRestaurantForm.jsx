import { useState } from "react";
import { registerRestaurant } from "./api";

const CATEGORIAS = [
  { value: "comida_corriente", label: "Comida corriente" },
  { value: "comida_rapida", label: "Comida rápida" },
  { value: "pizza", label: "Pizza" },
  { value: "vegetariano", label: "Vegetariano" },
];

const VACIO = {
  name: "",
  address: "",
  schedule: "",
  category: "comida_corriente",
  priceLevel: "1",
  lat: "",
  lng: "",
};

/**
 * HU04 — Como propietario, quiero registrar mi restaurante en la
 * plataforma, para que los estudiantes puedan encontrarlo y conocer
 * mi oferta. El restaurante queda en estado "pendiente" hasta que un
 * administrador lo aprueba.
 */
function RegisterRestaurantForm({ onVolver }) {
  const [datos, setDatos] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  function actualizar(campo, valor) {
    setDatos({ ...datos, [campo]: valor });
  }

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    setExito(null);
    try {
      const creado = await registerRestaurant(datos);
      setExito(creado);
      setDatos(VACIO);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="registro">
      <button className="volver" onClick={onVolver}>
        ← Volver al listado
      </button>
      <h2>Registrar mi restaurante</h2>
      <p>
        Diligencia los datos de tu restaurante. Quedará pendiente de aprobación antes de
        aparecer en las búsquedas de los estudiantes.
      </p>

      {exito && (
        <p className="aviso-exito">
          "{exito.name}" quedó registrado y pendiente de aprobación (id #{exito.id}).
        </p>
      )}
      {error && <p className="error">{error}</p>}

      <form onSubmit={enviar} className="formulario">
        <label>
          Nombre
          <input
            value={datos.name}
            onChange={(e) => actualizar("name", e.target.value)}
            required
          />
        </label>

        <label>
          Dirección
          <input
            value={datos.address}
            onChange={(e) => actualizar("address", e.target.value)}
            required
          />
        </label>

        <label>
          Horario
          <input
            placeholder="Ej: Lun-Sáb 11:00 a 20:00"
            value={datos.schedule}
            onChange={(e) => actualizar("schedule", e.target.value)}
            required
          />
        </label>

        <label>
          Categoría
          <select value={datos.category} onChange={(e) => actualizar("category", e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Nivel de precio
          <select value={datos.priceLevel} onChange={(e) => actualizar("priceLevel", e.target.value)}>
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
              value={datos.lat}
              onChange={(e) => actualizar("lat", e.target.value)}
              required
            />
          </label>
          <label>
            Longitud
            <input
              type="number"
              step="any"
              value={datos.lng}
              onChange={(e) => actualizar("lng", e.target.value)}
              required
            />
          </label>
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Registrar restaurante"}
        </button>
      </form>
    </section>
  );
}

export default RegisterRestaurantForm;
