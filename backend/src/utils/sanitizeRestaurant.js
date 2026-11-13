/**
 * Quita el `ownerToken` antes de enviar un restaurante al cliente.
 * El token solo se entrega una vez, en la respuesta de creación
 * (HU04); en cualquier otra respuesta (listado, detalle, edición)
 * nunca debe salir hacia afuera.
 */
function sanitizeRestaurant(restaurant) {
  if (!restaurant) return restaurant;
  const { ownerToken, ...publico } = restaurant;
  return publico;
}

module.exports = { sanitizeRestaurant };
