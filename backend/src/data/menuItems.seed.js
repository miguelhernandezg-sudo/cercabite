/**
 * Ítems de menú de ejemplo (modo demo). Cada ítem referencia un
 * restaurantId existente en restaurants.seed.js.
 */

const menuItems = [
  { id: 1, restaurantId: 1, name: "Bandeja corriente", price: 12000 },
  { id: 2, restaurantId: 1, name: "Sancocho de gallina", price: 15000 },
  { id: 3, restaurantId: 2, name: "Pizza napolitana personal", price: 18000 },
  { id: 4, restaurantId: 2, name: "Pizza familiar hawaiana", price: 42000 },
  { id: 5, restaurantId: 3, name: "Combo sushi 10 piezas", price: 28000 },
  { id: 6, restaurantId: 4, name: "Arepa de huevo", price: 4000 },
  { id: 7, restaurantId: 4, name: "Jugo natural grande", price: 6000 },
  { id: 8, restaurantId: 5, name: "Hamburguesa clásica", price: 14000 },
  { id: 9, restaurantId: 6, name: "Bowl vegetariano", price: 16000 },
];

module.exports = { menuItems };
