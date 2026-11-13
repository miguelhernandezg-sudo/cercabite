/**
 * Opiniones/calificaciones de ejemplo (modo demo). Cada opinión referencia
 * un restaurantId existente en restaurants.seed.js. El restaurante 6
 * no tiene opiniones a propósito, para probar el caso "sin reseñas".
 */

const reviews = [
  { id: 1, restaurantId: 1, author: "Estudiante CECAR", rating: 4, comment: "Buen precio y porciones grandes." },
  { id: 2, restaurantId: 1, author: "Ana M.", rating: 5, comment: "El sancocho es excelente para el almuerzo." },
  { id: 3, restaurantId: 2, author: "Carlos R.", rating: 4, comment: "La pizza llega caliente, buen servicio." },
  { id: 4, restaurantId: 3, author: "Luisa P.", rating: 4, comment: "Variedad de combos, ideal entre semana." },
  { id: 5, restaurantId: 4, author: "Pedro G.", rating: 5, comment: "Las arepas de huevo son las mejores cerca de la u." },
];

module.exports = { reviews };
