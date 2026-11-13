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
