/**
 * HU07/HU08 — Valida un texto obligatorio y no vacío usado tanto para
 * las observaciones del administrador (HU07) como para el motivo de
 * rechazo que se informa al propietario (HU08).
 */
function validateAdminNote(text, etiqueta = "El texto") {
  if (!text || typeof text !== "string" || !text.trim()) {
    return { valid: false, errors: [`${etiqueta} es obligatorio`] };
  }
  return { valid: true, errors: [] };
}

module.exports = { validateAdminNote };
