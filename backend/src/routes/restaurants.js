const express = require("express");
const { findNearby, filterRestaurants } = require("../services/restaurantService");
const { validateRestaurantInput } = require("../utils/validateRestaurantInput");
const { validateMenuItemInput } = require("../utils/validateMenuItemInput");
const { sanitizeRestaurant } = require("../utils/sanitizeRestaurant");

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
      const resultado = findNearby(restaurants, lat, lng, radiusKm).map(sanitizeRestaurant);
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
      }).map(sanitizeRestaurant);
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
        ...sanitizeRestaurant(restaurante),
        menu,
        reviews,
        sinResenas: reviews.length === 0,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Vista del propietario: igual al detalle público, pero visible en
  // cualquier estado (pending/published/rejected) e incluye las
  // observaciones del administrador (HU07) y el motivo de rechazo
  // (HU08), para que el propietario sepa qué corregir.
  router.get("/:id/owner-view", async (req, res) => {
    try {
      const id = parseNumber(req.params.id);
      if (id === undefined) {
        return res.status(400).json({ error: "El id del restaurante no es válido" });
      }

      const ownerToken = req.header("x-owner-token");
      if (!ownerToken) {
        return res.status(401).json({ error: "Se requiere el encabezado x-owner-token" });
      }

      const restaurante = await repository.findById(id);
      if (!restaurante) {
        return res.status(404).json({ error: "Restaurante no encontrado" });
      }
      if (restaurante.ownerToken !== ownerToken) {
        return res.status(403).json({ error: "No tienes permiso para ver este restaurante" });
      }

      const [menu, reviews] = await Promise.all([
        repository.findMenuByRestaurantId(id),
        repository.findReviewsByRestaurantId(id),
      ]);

      return res.json({
        ...sanitizeRestaurant(restaurante),
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
      // El ownerToken solo se entrega aquí, una única vez: es la
      // credencial que el propietario debe guardar para poder editar
      // después su restaurante (HU05) y su menú (HU06).
      return res.status(201).json({
        ...creado,
        mensaje:
          "Guarda tu ownerToken: lo necesitarás para editar este restaurante o su menú. No se puede recuperar después.",
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  // HU05 — Actualizar información de un restaurante propio
  router.patch("/:id", async (req, res) => {
    try {
      const id = parseNumber(req.params.id);
      if (id === undefined) {
        return res.status(400).json({ error: "El id del restaurante no es válido" });
      }

      const ownerToken = req.header("x-owner-token");
      if (!ownerToken) {
        return res.status(401).json({ error: "Se requiere el encabezado x-owner-token" });
      }

      const { valid, errors } = validateRestaurantInput(req.body);
      if (!valid) {
        return res.status(400).json({ errors });
      }

      const resultado = await repository.update(id, ownerToken, req.body);
      if (resultado.status === "not_found") {
        return res.status(404).json({ error: "Restaurante no encontrado" });
      }
      if (resultado.status === "forbidden") {
        return res.status(403).json({ error: "No tienes permiso para editar este restaurante" });
      }

      return res.json(sanitizeRestaurant(resultado.restaurant));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  // HU06 — Gestionar el menú del restaurante (agregar, editar, eliminar)
  router.post("/:id/menu", async (req, res) => {
    try {
      const id = parseNumber(req.params.id);
      if (id === undefined) {
        return res.status(400).json({ error: "El id del restaurante no es válido" });
      }

      const ownerToken = req.header("x-owner-token");
      if (!ownerToken) {
        return res.status(401).json({ error: "Se requiere el encabezado x-owner-token" });
      }

      const { valid, errors } = validateMenuItemInput(req.body);
      if (!valid) {
        return res.status(400).json({ errors });
      }

      const resultado = await repository.addMenuItem(id, ownerToken, req.body);
      if (resultado.status === "not_found") {
        return res.status(404).json({ error: "Restaurante no encontrado" });
      }
      if (resultado.status === "forbidden") {
        return res.status(403).json({ error: "No tienes permiso para editar el menú de este restaurante" });
      }

      return res.status(201).json(resultado.item);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.patch("/:id/menu/:itemId", async (req, res) => {
    try {
      const id = parseNumber(req.params.id);
      const itemId = parseNumber(req.params.itemId);
      if (id === undefined || itemId === undefined) {
        return res.status(400).json({ error: "Id inválido" });
      }

      const ownerToken = req.header("x-owner-token");
      if (!ownerToken) {
        return res.status(401).json({ error: "Se requiere el encabezado x-owner-token" });
      }

      const { valid, errors } = validateMenuItemInput(req.body);
      if (!valid) {
        return res.status(400).json({ errors });
      }

      const resultado = await repository.updateMenuItem(id, itemId, ownerToken, req.body);
      if (resultado.status === "not_found") {
        return res.status(404).json({ error: "Producto de menú no encontrado" });
      }
      if (resultado.status === "forbidden") {
        return res.status(403).json({ error: "No tienes permiso para editar el menú de este restaurante" });
      }

      return res.json(resultado.item);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.delete("/:id/menu/:itemId", async (req, res) => {
    try {
      const id = parseNumber(req.params.id);
      const itemId = parseNumber(req.params.itemId);
      if (id === undefined || itemId === undefined) {
        return res.status(400).json({ error: "Id inválido" });
      }

      const ownerToken = req.header("x-owner-token");
      if (!ownerToken) {
        return res.status(401).json({ error: "Se requiere el encabezado x-owner-token" });
      }

      const resultado = await repository.deleteMenuItem(id, itemId, ownerToken);
      if (resultado.status === "not_found") {
        return res.status(404).json({ error: "Producto de menú no encontrado" });
      }
      if (resultado.status === "forbidden") {
        return res.status(403).json({ error: "No tienes permiso para editar el menú de este restaurante" });
      }

      return res.status(204).send();
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  return router;
}

module.exports = { createRestaurantsRouter };
