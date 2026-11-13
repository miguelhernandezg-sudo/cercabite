const BASE_URL = "/api/restaurants";

/**
 * HU02 — Consulta restaurantes aplicando filtros opcionales
 * (categoría, precio, calificación, distancia) y, si se provee
 * la ubicación, ordena por distancia.
 */
export async function fetchRestaurants(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, value);
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo consultar los restaurantes");
  }
  return response.json();
}

/**
 * HU03 — Consulta el detalle de un restaurante: datos generales,
 * menú y opiniones/calificaciones de otros estudiantes.
 */
export async function fetchRestaurantDetail(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo consultar el detalle del restaurante");
  }
  return response.json();
}

/**
 * HU04 — Registra un nuevo restaurante (queda pendiente de aprobación).
 */
export async function registerRestaurant(datos) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const mensaje = Array.isArray(body.errors) ? body.errors.join(" · ") : body.error;
    throw new Error(mensaje || "No se pudo registrar el restaurante");
  }
  return body;
}
