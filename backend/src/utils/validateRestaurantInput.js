const CATEGORIAS_VALIDAS = ["comida_corriente", "comida_rapida", "pizza", "vegetariano"];

/**
 * HU04 — Valida los datos mínimos que un propietario debe diligenciar
 * para registrar un restaurante: nombre, dirección, horario y categoría
 * (criterio de aceptación: "El sistema solicita como mínimo nombre,
 * dirección, horario y categoría").
 *
 * Es una función pura para poder probarla sin necesidad de Express
 * ni de una base de datos.
 */
function validateRestaurantInput(data) {
  const errors = [];
  const d = data || {};

  if (!d.name || typeof d.name !== "string" || !d.name.trim()) {
    errors.push("El nombre es obligatorio");
  }

  if (!d.address || typeof d.address !== "string" || !d.address.trim()) {
    errors.push("La dirección es obligatoria");
  }

  if (!d.schedule || typeof d.schedule !== "string" || !d.schedule.trim()) {
    errors.push("El horario es obligatorio");
  }

  if (!d.category || !CATEGORIAS_VALIDAS.includes(d.category)) {
    errors.push(`La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`);
  }

  if (d.priceLevel === undefined || d.priceLevel === null || d.priceLevel === "") {
    errors.push("El nivel de precio es obligatorio");
  } else {
    const priceLevel = Number(d.priceLevel);
    if (!Number.isInteger(priceLevel) || priceLevel < 1 || priceLevel > 3) {
      errors.push("El nivel de precio debe ser un entero entre 1 y 3");
    }
  }

  if (d.lat === undefined || d.lat === null || d.lat === "" || Number.isNaN(Number(d.lat))) {
    errors.push("La latitud es obligatoria y debe ser numérica");
  }

  if (d.lng === undefined || d.lng === null || d.lng === "" || Number.isNaN(Number(d.lng))) {
    errors.push("La longitud es obligatoria y debe ser numérica");
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateRestaurantInput, CATEGORIAS_VALIDAS };
