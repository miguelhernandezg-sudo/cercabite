import { useEffect, useState } from "react";
import { fetchRestaurantDetail } from "./api";

/**
 * HU03 — Como estudiante, quiero consultar el detalle de un restaurante
 * (horario, menú, precios, calificación y opiniones), para decidir si
 * es la opción adecuada antes de desplazarme.
 */
function RestaurantDetail({ id, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    fetchRestaurantDetail(id)
      .then(setDetalle)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);

  return (
    <section className="detalle">
      <button className="volver" onClick={onVolver}>
        ← Volver al listado
      </button>

      {cargando && <p>Cargando detalle...</p>}
      {error && <p className="error">{error}</p>}

      {detalle && (
        <>
          <h2>{detalle.name}</h2>
          <p>{detalle.address}</p>
          <p>
            {"$".repeat(detalle.priceLevel)} · ⭐ {detalle.rating}
          </p>
          <p className="horario">{detalle.schedule}</p>

          <h3>Menú</h3>
          {detalle.menu.length === 0 ? (
            <p>Este restaurante todavía no ha publicado su menú.</p>
          ) : (
            <ul className="menu">
              {detalle.menu.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <span>${item.price.toLocaleString("es-CO")}</span>
                </li>
              ))}
            </ul>
          )}

          <h3>Opiniones</h3>
          {detalle.sinResenas ? (
            <p>No hay calificaciones disponibles todavía.</p>
          ) : (
            <ul className="opiniones">
              {detalle.reviews.map((r) => (
                <li key={r.id}>
                  <strong>{r.author}</strong> — ⭐ {r.rating}
                  <p>{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default RestaurantDetail;
