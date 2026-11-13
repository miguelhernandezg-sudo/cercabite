const express = require("express");
const { findNearby, filterRestaurants } = require("../services/restaurantService");
const { validateRestaurantInput } = require("../utils/validateRestaurantInput");

function createRestaurantsRouter(repository) {
  const router = express.Router();

  function parseNumber(value) {
    if (value === undefined || value === "") return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }

  // HU01 — Buscar restaurantes cercanos
  router.get("/nearby", async (req, res) => {
    try {
      const lat = parseNumber(req.query.lat);
      const lng = parseNumber(req.query.lng);
      const radiusKm = parseNumber(req.query.radiusKm) ?? 5;

      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ error: "Se requieren los parámetros lat y lng" });
      }

      const restaurants = await repository.findAll();
      const resultado = findNearby(restaurants, lat, lng, radiusKm);
      return res.json({ count: resultado.length, results: resultado });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  // HU02 — Filtrar restaurantes
  router.get("/", async (req, res) => {
    try {
      const { category } = req.query;
      const lat = parseNumber(req.query.lat);
      const lng = parseNumber(req.query.lng);
      const maxPrice = parseNumber(req.query.maxPrice);
      const minRating = parseNumber(req.query.minRating);
      const maxDistanceKm = parseNumber(req.query.maxDistanceKm);

      const restaurants = await repository.findAll();
      const resultado = filterRestaurants(restaurants, {
        category,
        maxPrice,
        minRating,
        maxDistanceKm,
        lat,
        lng,
      });
      return res.json({ count: resultado.length, results: resultado });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  // HU03 — Consultar el detalle de un restaurante (menú y opiniones)
  router.get("/:id", async (req, res) => {
    try {
      const id = parseNumber(req.params.id);
      if (id === undefined) {
        return res.status(400).json({ error: "El id del restaurante no es válido" });
      }

      const restaurante = await repository.findById(id);
      if (!restaurante || restaurante.status === "pending" || restaurante.status === "rejected") {
        return res.status(404).json({ error: "Restaurante no encontrado" });
      }

      const [menu, reviews] = await Promise.all([
        repository.findMenuByRestaurantId(id),
        repository.findReviewsByRestaurantId(id),
      ]);

      return res.json({
        ...restaurante,
        menu,
        reviews,
        sinResenas: reviews.length === 0,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  // HU04 — Registrar restaurante (propietario)
  router.post("/", async (req, res) => {
    const { valid, errors } = validateRestaurantInput(req.body);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    try {
      const creado = await repository.create(req.body);
      return res.status(201).json(creado);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  return router;
}

module.exports = { createRestaurantsRouter };
