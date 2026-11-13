const { Pool } = require("pg");

/**
 * Crea el pool de conexión a PostgreSQL únicamente si DATABASE_URL está
 * definido. Si no, la aplicación arranca en modo demo (ver restaurantRepository.js),
 * lo cual permite probar la API sin depender de una base de datos real.
 */
function createPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

module.exports = { createPool };
