/**
 * Utilidades de geolocalización para CercaBite.
 * Implementa la fórmula de Haversine para calcular la distancia entre
 * dos coordenadas geográficas (latitud/longitud), expresada en kilómetros.
 * Soporta la historia de usuario HU01 (buscar restaurantes cercanos).
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula la distancia en kilómetros entre dos puntos geográficos.
 * @param {number} lat1 Latitud del primer punto
 * @param {number} lng1 Longitud del primer punto
 * @param {number} lat2 Latitud del segundo punto
 * @param {number} lng2 Longitud del segundo punto
 * @returns {number} Distancia en kilómetros, redondeada a 2 decimales
 */
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => typeof v !== "number" || Number.isNaN(v))) {
    throw new TypeError("Las coordenadas deben ser números válidos");
  }

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = EARTH_RADIUS_KM * c;

  return Math.round(distanceKm * 100) / 100;
}

/**
 * Valida que un par de coordenadas esté dentro de los rangos geográficos válidos.
 */
function isValidCoordinate(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

module.exports = { haversineDistanceKm, isValidCoordinate };
