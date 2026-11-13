const express = require("express");
const { findNearby, filterRestaurants } = require("../services/restaurantService");

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

  return router;
}

module.exports = { createRestaurantsRouter };
