const crypto = require("crypto");
const { restaurants: seedRestaurants } = require("../data/restaurants.seed");
const { menuItems: seedMenuItems } = require("../data/menuItems.seed");
const { reviews: seedReviews } = require("../data/reviews.seed");

function aplicarCamposEditables(destino, datos) {
  destino.name = datos.name.trim();
  destino.address = datos.address.trim();
  destino.schedule = datos.schedule.trim();
  destino.category = datos.category;
  destino.priceLevel = Number(datos.priceLevel);
  destino.lat = Number(datos.lat);
  destino.lng = Number(datos.lng);
  return destino;
}

/**
 * Repositorio de restaurantes. En modo demo (sin DATABASE_URL configurado)
 * expone los datos semilla en memoria (copiados para poder registrar y
 * editar restaurantes sin mutar los módulos originales); cuando se define
 * DATABASE_URL, consulta las tablas `restaurants`, `menu_items` y `reviews`
 * de PostgreSQL (ver schema.sql).
 *
 * HU05/HU06 — Las operaciones de edición (update, menú) exigen el
 * `ownerToken` entregado al registrar el restaurante (HU04), de modo que
 * un propietario solo pueda modificar su propio restaurante.
 */
function createRestaurantRepository(pool = null) {
  if (!pool) {
    // Copias mutables en memoria: permiten que HU04 (registrar restaurante)
    // agregue nuevos registros y que HU05/HU06 los editen durante la vida
    // del proceso, sin alterar los datos semilla originales.
    const restaurants = seedRestaurants.map((r) => ({ ...r, status: "published" }));
    const menuItems = seedMenuItems.map((m) => ({ ...m }));
    const reviews = seedReviews.map((r) => ({ ...r }));
    let nextId = Math.max(...restaurants.map((r) => r.id)) + 1;
    let nextMenuItemId = Math.max(...menuItems.map((m) => m.id)) + 1;

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
          ownerToken: crypto.randomUUID(),
          observations: null,
          rejectionReason: null,
          flaggedForReview: false,
          lastReviewedAt: null,
        };
        restaurants.push(nuevo);
        return nuevo;
      },
      // HU05 — Actualizar información de un restaurante propio.
      async update(id, ownerToken, data) {
        const restaurante = restaurants.find((r) => r.id === Number(id));
        if (!restaurante) return { status: "not_found" };
        if (restaurante.ownerToken !== ownerToken) return { status: "forbidden" };

        aplicarCamposEditables(restaurante, data);
        return { status: "ok", restaurant: restaurante };
      },
      // HU06 — Gestionar menú (agregar, editar, eliminar productos).
      async addMenuItem(restaurantId, ownerToken, data) {
        const restaurante = restaurants.find((r) => r.id === Number(restaurantId));
        if (!restaurante) return { status: "not_found" };
        if (restaurante.ownerToken !== ownerToken) return { status: "forbidden" };

        const nuevo = {
          id: nextMenuItemId++,
          restaurantId: Number(restaurantId),
          name: data.name.trim(),
          price: Number(data.price),
        };
        menuItems.push(nuevo);
        return { status: "ok", item: nuevo };
      },
      async updateMenuItem(restaurantId, itemId, ownerToken, data) {
        const restaurante = restaurants.find((r) => r.id === Number(restaurantId));
        if (!restaurante) return { status: "not_found" };
        if (restaurante.ownerToken !== ownerToken) return { status: "forbidden" };

        const item = menuItems.find(
          (m) => m.id === Number(itemId) && m.restaurantId === Number(restaurantId)
        );
        if (!item) return { status: "not_found" };

        item.name = data.name.trim();
        item.price = Number(data.price);
        return { status: "ok", item };
      },
      async deleteMenuItem(restaurantId, itemId, ownerToken) {
        const restaurante = restaurants.find((r) => r.id === Number(restaurantId));
        if (!restaurante) return { status: "not_found" };
        if (restaurante.ownerToken !== ownerToken) return { status: "forbidden" };

        const index = menuItems.findIndex(
          (m) => m.id === Number(itemId) && m.restaurantId === Number(restaurantId)
        );
        if (index === -1) return { status: "not_found" };

        menuItems.splice(index, 1);
        return { status: "ok" };
      },
      // HU07 — Ver restaurantes pendientes y registrar observaciones.
      async findByStatus(status) {
        return restaurants.filter((r) => r.status === status);
      },
      async setObservations(id, text) {
        const restaurante = restaurants.find((r) => r.id === Number(id));
        if (!restaurante) return null;
        restaurante.observations = text;
        return restaurante;
      },
      // HU08 — Aprobar o rechazar el registro de un restaurante.
      async approve(id) {
        const restaurante = restaurants.find((r) => r.id === Number(id));
        if (!restaurante) return null;
        restaurante.status = "published";
        restaurante.rejectionReason = null;
        return restaurante;
      },
      async reject(id, reason) {
        const restaurante = restaurants.find((r) => r.id === Number(id));
        if (!restaurante) return null;
        restaurante.status = "rejected";
        restaurante.rejectionReason = reason;
        return restaurante;
      },
      // HU09 — Supervisar periódicamente los restaurantes publicados.
      async flagForReview(id) {
        const restaurante = restaurants.find((r) => r.id === Number(id));
        if (!restaurante) return null;
        restaurante.flaggedForReview = true;
        return restaurante;
      },
      async markReviewed(id) {
        const restaurante = restaurants.find((r) => r.id === Number(id));
        if (!restaurante) return null;
        restaurante.flaggedForReview = false;
        restaurante.lastReviewedAt = new Date().toISOString();
        return restaurante;
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
                lat, lng, address, schedule, status, owner_token AS "ownerToken",
                observations, rejection_reason AS "rejectionReason",
                flagged_for_review AS "flaggedForReview", last_reviewed_at AS "lastReviewedAt"
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
      const ownerToken = crypto.randomUUID();
      const { rows } = await pool.query(
        `INSERT INTO restaurants (name, category, price_level, rating, lat, lng, address, schedule, status, owner_token)
         VALUES ($1, $2, $3, 0, $4, $5, $6, $7, 'pending', $8)
         RETURNING id, name, category, price_level AS "priceLevel", rating, lat, lng, address, schedule, status, owner_token AS "ownerToken"`,
        [
          data.name.trim(),
          data.category,
          Number(data.priceLevel),
          Number(data.lat),
          Number(data.lng),
          data.address.trim(),
          data.schedule.trim(),
          ownerToken,
        ]
      );
      return rows[0];
    },
    async update(id, ownerToken, data) {
      const { rows } = await pool.query(
        `UPDATE restaurants
            SET name = $1, address = $2, schedule = $3, category = $4,
                price_level = $5, lat = $6, lng = $7, updated_at = now()
          WHERE id = $8 AND owner_token = $9
          RETURNING id, name, category, price_level AS "priceLevel", rating,
                    lat, lng, address, schedule, status`,
        [
          data.name.trim(),
          data.address.trim(),
          data.schedule.trim(),
          data.category,
          Number(data.priceLevel),
          Number(data.lat),
          Number(data.lng),
          id,
          ownerToken,
        ]
      );
      if (rows.length > 0) return { status: "ok", restaurant: rows[0] };

      const existe = await pool.query("SELECT id FROM restaurants WHERE id = $1", [id]);
      return existe.rows.length === 0 ? { status: "not_found" } : { status: "forbidden" };
    },
    async addMenuItem(restaurantId, ownerToken, data) {
      const dueño = await pool.query("SELECT id FROM restaurants WHERE id = $1 AND owner_token = $2", [
        restaurantId,
        ownerToken,
      ]);
      if (dueño.rows.length === 0) {
        const existe = await pool.query("SELECT id FROM restaurants WHERE id = $1", [restaurantId]);
        return existe.rows.length === 0 ? { status: "not_found" } : { status: "forbidden" };
      }

      const { rows } = await pool.query(
        `INSERT INTO menu_items (restaurant_id, name, price)
         VALUES ($1, $2, $3)
         RETURNING id, restaurant_id AS "restaurantId", name, price`,
        [restaurantId, data.name.trim(), Number(data.price)]
      );
      return { status: "ok", item: rows[0] };
    },
    async updateMenuItem(restaurantId, itemId, ownerToken, data) {
      const dueño = await pool.query("SELECT id FROM restaurants WHERE id = $1 AND owner_token = $2", [
        restaurantId,
        ownerToken,
      ]);
      if (dueño.rows.length === 0) {
        const existe = await pool.query("SELECT id FROM restaurants WHERE id = $1", [restaurantId]);
        return existe.rows.length === 0 ? { status: "not_found" } : { status: "forbidden" };
      }

      const { rows } = await pool.query(
        `UPDATE menu_items SET name = $1, price = $2
          WHERE id = $3 AND restaurant_id = $4
          RETURNING id, restaurant_id AS "restaurantId", name, price`,
        [data.name.trim(), Number(data.price), itemId, restaurantId]
      );
      return rows.length > 0 ? { status: "ok", item: rows[0] } : { status: "not_found" };
    },
    async deleteMenuItem(restaurantId, itemId, ownerToken) {
      const dueño = await pool.query("SELECT id FROM restaurants WHERE id = $1 AND owner_token = $2", [
        restaurantId,
        ownerToken,
      ]);
      if (dueño.rows.length === 0) {
        const existe = await pool.query("SELECT id FROM restaurants WHERE id = $1", [restaurantId]);
        return existe.rows.length === 0 ? { status: "not_found" } : { status: "forbidden" };
      }

      const { rowCount } = await pool.query(
        "DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2",
        [itemId, restaurantId]
      );
      return rowCount > 0 ? { status: "ok" } : { status: "not_found" };
    },
    // HU07 — Ver restaurantes pendientes y registrar observaciones.
    async findByStatus(status) {
      const { rows } = await pool.query(
        `SELECT id, name, category, price_level AS "priceLevel", rating,
                lat, lng, address, schedule, status, observations,
                rejection_reason AS "rejectionReason",
                flagged_for_review AS "flaggedForReview", last_reviewed_at AS "lastReviewedAt"
           FROM restaurants
          WHERE status = $1
          ORDER BY created_at`,
        [status]
      );
      return rows;
    },
    async setObservations(id, text) {
      const { rows } = await pool.query(
        `UPDATE restaurants SET observations = $1, updated_at = now()
          WHERE id = $2
          RETURNING id, name, category, price_level AS "priceLevel", rating, lat, lng,
                    address, schedule, status, observations`,
        [text, id]
      );
      return rows[0] || null;
    },
    // HU08 — Aprobar o rechazar el registro de un restaurante.
    async approve(id) {
      const { rows } = await pool.query(
        `UPDATE restaurants SET status = 'published', rejection_reason = NULL, updated_at = now()
          WHERE id = $1
          RETURNING id, name, category, price_level AS "priceLevel", rating, lat, lng,
                    address, schedule, status`,
        [id]
      );
      return rows[0] || null;
    },
    async reject(id, reason) {
      const { rows } = await pool.query(
        `UPDATE restaurants SET status = 'rejected', rejection_reason = $1, updated_at = now()
          WHERE id = $2
          RETURNING id, name, category, price_level AS "priceLevel", rating, lat, lng,
                    address, schedule, status, rejection_reason AS "rejectionReason"`,
        [reason, id]
      );
      return rows[0] || null;
    },
    // HU09 — Supervisar periódicamente los restaurantes publicados.
    async flagForReview(id) {
      const { rows } = await pool.query(
        `UPDATE restaurants SET flagged_for_review = true, updated_at = now()
          WHERE id = $1
          RETURNING id, name, category, price_level AS "priceLevel", rating, lat, lng,
                    address, schedule, status, flagged_for_review AS "flaggedForReview"`,
        [id]
      );
      return rows[0] || null;
    },
    async markReviewed(id) {
      const { rows } = await pool.query(
        `UPDATE restaurants
            SET flagged_for_review = false, last_reviewed_at = now(), updated_at = now()
          WHERE id = $1
          RETURNING id, name, category, price_level AS "priceLevel", rating, lat, lng,
                    address, schedule, status, flagged_for_review AS "flaggedForReview",
                    last_reviewed_at AS "lastReviewedAt"`,
        [id]
      );
      return rows[0] || null;
    },
  };
}

module.exports = { createRestaurantRepository };
