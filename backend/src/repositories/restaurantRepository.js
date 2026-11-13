const { restaurants: seedRestaurants } = require("../data/restaurants.seed");
const { menuItems: seedMenuItems } = require("../data/menuItems.seed");
const { reviews: seedReviews } = require("../data/reviews.seed");

/**
 * Repositorio de restaurantes. En modo demo (sin DATABASE_URL configurado)
 * expone los datos semilla en memoria (copiados para poder registrar
 * restaurantes nuevos sin mutar los módulos originales); cuando se define
 * DATABASE_URL, consulta las tablas `restaurants`, `menu_items` y `reviews`
 * de PostgreSQL (ver schema.sql).
 */
function createRestaurantRepository(pool = null) {
  if (!pool) {
    // Copias mutables en memoria: permiten que HU04 (registrar restaurante)
    // agregue nuevos registros durante la vida del proceso sin alterar
    // los datos semilla originales que usan las pruebas de HU01/HU02.
    const restaurants = seedRestaurants.map((r) => ({ ...r, status: "published" }));
    const menuItems = seedMenuItems.map((m) => ({ ...m }));
    const reviews = seedReviews.map((r) => ({ ...r }));
    let nextId = Math.max(...restaurants.map((r) => r.id)) + 1;

    return {
      mode: "demo",
      async findAll() {
        return restaurants.filter((r) => r.status === "published");
      },
      async findById(id) {
        return restaurants.find((r) => r.id === Number(id)) || null;
      },
      async findMenuByRestaurantId(id) {
        return menuItems.filter((m) => m.restaurantId === Number(id));
      },
      async findReviewsByRestaurantId(id) {
        return reviews.filter((r) => r.restaurantId === Number(id));
      },
      // HU04 — Registrar restaurante (queda "pending" hasta ser aprobado).
      async create(data) {
        const nuevo = {
          id: nextId++,
          name: data.name.trim(),
          category: data.category,
          priceLevel: Number(data.priceLevel),
          rating: 0,
          lat: Number(data.lat),
          lng: Number(data.lng),
          address: data.address.trim(),
          schedule: data.schedule.trim(),
          status: "pending",
        };
        restaurants.push(nuevo);
        return nuevo;
      },
    };
  }

  return {
    mode: "postgres",
    async findAll() {
      const { rows } = await pool.query(
        `SELECT id, name, category, price_level AS "priceLevel", rating,
                lat, lng, address, schedule
           FROM restaurants
          WHERE status = 'published'`
      );
      return rows;
    },
    async findById(id) {
      const { rows } = await pool.query(
        `SELECT id, name, category, price_level AS "priceLevel", rating,
                lat, lng, address, schedule, status
           FROM restaurants
          WHERE id = $1`,
        [id]
      );
      return rows[0] || null;
    },
    async findMenuByRestaurantId(id) {
      const { rows } = await pool.query(
        `SELECT id, restaurant_id AS "restaurantId", name, price
           FROM menu_items
          WHERE restaurant_id = $1
          ORDER BY id`,
        [id]
      );
      return rows;
    },
    async findReviewsByRestaurantId(id) {
      const { rows } = await pool.query(
        `SELECT id, restaurant_id AS "restaurantId", author, rating, comment
           FROM reviews
          WHERE restaurant_id = $1
          ORDER BY id`,
        [id]
      );
      return rows;
    },
    async create(data) {
      const { rows } = await pool.query(
        `INSERT INTO restaurants (name, category, price_level, rating, lat, lng, address, schedule, status)
         VALUES ($1, $2, $3, 0, $4, $5, $6, $7, 'pending')
         RETURNING id, name, category, price_level AS "priceLevel", rating, lat, lng, address, schedule, status`,
        [
          data.name.trim(),
          data.category,
          Number(data.priceLevel),
          Number(data.lat),
          Number(data.lng),
          data.address.trim(),
          data.schedule.trim(),
        ]
      );
      return rows[0];
    },
  };
}

module.exports = { createRestaurantRepository };
