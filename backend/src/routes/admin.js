const express = require("express");
const { isValidAdminToken } = require("../utils/adminAuth");
const { validateAdminNote } = require("../utils/validateAdminNote");
const { sanitizeRestaurant } = require("../utils/sanitizeRestaurant");

const ESTADOS_VALIDOS = ["pending", "published", "rejected"];

/**
 * Rutas de administración (HU07, HU08, HU09). Todas exigen el
 * encabezado x-admin-token (ver utils/adminAuth.js).
 */
function createAdminRouter(repository) {
  const router = express.Router();

  function requireAdmin(req, res) {
    const token = req.header("x-admin-token");
    if (!token) {
      res.status(401).json({ error: "Se requiere el encabezado x-admin-token" });
      return false;
    }
    if (!isValidAdminToken(token)) {
      res.status(403).json({ error: "Token de administrador inválido" });
      return false;
    }
    return true;
  }

  function parseId(value) {
    const n = Number(value);
    return Number.isInteger(n) ? n : undefined;
  }

  // HU07 — Ver restaurantes por estado (pendientes para validar,
  // publicados para supervisar — HU09).
  router.get("/restaurants", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    const { status } = req.query;
    if (!ESTADOS_VALIDOS.includes(status)) {
      return res.status(400).json({ error: `El parámetro status debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}` });
    }

    const restaurantes = await repository.findByStatus(status);
    return res.json({ count: restaurantes.length, results: restaurantes.map(sanitizeRestaurant) });
  });

  // HU07 — Registrar observaciones cuando la información está incompleta.
  router.patch("/restaurants/:id/observations", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    const id = parseId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: "Id inválido" });

    const { valid, errors } = validateAdminNote(req.body.observations, "Las observaciones");
    if (!valid) return res.status(400).json({ errors });

    const actualizado = await repository.setObservations(id, req.body.observations.trim());
    if (!actualizado) return res.status(404).json({ error: "Restaurante no encontrado" });
    return res.json(sanitizeRestaurant(actualizado));
  });

  // HU08 — Aprobar: el restaurante pasa a "published" y queda visible.
  router.post("/restaurants/:id/approve", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    const id = parseId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: "Id inválido" });

    const actualizado = await repository.approve(id);
    if (!actualizado) return res.status(404).json({ error: "Restaurante no encontrado" });
    return res.json(sanitizeRestaurant(actualizado));
  });

  // HU08 — Rechazar: se informa el motivo al propietario (visible en su panel).
  router.post("/restaurants/:id/reject", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    const id = parseId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: "Id inválido" });

    const { valid, errors } = validateAdminNote(req.body.reason, "El motivo del rechazo");
    if (!valid) return res.status(400).json({ errors });

    const actualizado = await repository.reject(id, req.body.reason.trim());
    if (!actualizado) return res.status(404).json({ error: "Restaurante no encontrado" });
    return res.json(sanitizeRestaurant(actualizado));
  });

  // HU09 — Marcar un restaurante publicado para revisión.
  router.post("/restaurants/:id/flag", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    const id = parseId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: "Id inválido" });

    const actualizado = await repository.flagForReview(id);
    if (!actualizado) return res.status(404).json({ error: "Restaurante no encontrado" });
    return res.json(sanitizeRestaurant(actualizado));
  });

  // HU09 — Registrar que la supervisión periódica ya se realizó.
  router.post("/restaurants/:id/reviewed", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    const id = parseId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: "Id inválido" });

    const actualizado = await repository.markReviewed(id);
    if (!actualizado) return res.status(404).json({ error: "Restaurante no encontrado" });
    return res.json(sanitizeRestaurant(actualizado));
  });

  return router;
}

module.exports = { createAdminRouter };
