const { haversineDistanceKm, isValidCoordinate } = require("../utils/geo");

/**
 * HU01 — Buscar restaurantes cercanos a la ubicación del estudiante.
 * Calcula la distancia de cada restaurante al punto del usuario, descarta
 * los que superan el radio indicado y devuelve el resultado ordenado de
 * menor a mayor distancia.
 */
function findNearby(restaurants, userLat, userLng, radiusKm = 5) {
  if (!isValidCoordinate(userLat, userLng)) {
    throw new RangeError("La ubicación del usuario no es válida");
  }

  return restaurants
    .map((r) => ({ ...r, distanceKm: haversineDistanceKm(userLat, userLng, r.lat, r.lng) }))
    .filter((r) => r.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * HU02 — Filtrar restaurantes por categoría, precio, calificación o distancia.
 * Los filtros son opcionales y se pueden combinar; si se proveen lat/lng,
 * también se calcula y ordena por distancia.
 */
function filterRestaurants(restaurants, filters = {}) {
  const { category, maxPrice, minRating, maxDistanceKm, lat, lng } = filters;

  let result = restaurants;

  if (lat !== undefined && lng !== undefined) {
    if (!isValidCoordinate(lat, lng)) {
      throw new RangeError("La ubicación del usuario no es válida");
    }
    result = result.map((r) => ({ ...r, distanceKm: haversineDistanceKm(lat, lng, r.lat, r.lng) }));
  }

  if (category) {
    result = result.filter((r) => r.category === category);
  }

  if (maxPrice !== undefined) {
    result = result.filter((r) => r.priceLevel <= Number(maxPrice));
  }

  if (minRating !== undefined) {
    result = result.filter((r) => r.rating >= Number(minRating));
  }

  if (maxDistanceKm !== undefined) {
    result = result.filter((r) => r.distanceKm !== undefined && r.distanceKm <= Number(maxDistanceKm));
  }

  if (result.every((r) => r.distanceKm !== undefined)) {
    result = [...result].sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return result;
}

module.exports = { findNearby, filterRestaurants };
