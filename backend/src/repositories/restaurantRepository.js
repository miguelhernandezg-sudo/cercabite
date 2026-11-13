const { restaurants: seedRestaurants } = require("../data/restaurants.seed");

/**
 * Repositorio de restaurantes. En modo demo (sin DATABASE_URL configurado)
 * expone los datos semilla en memoria; cuando se define DATABASE_URL,
 * consulta la tabla `restaurants` de PostgreSQL (ver schema.sql).
 */
function createRestaurantRepository(pool = null) {
  if (!pool) {
    return {
      mode: "demo",
      async findAll() {
        return seedRestaurants;
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
  };
}

module.exports = { createRestaurantRepository };
