/**
 * HU06 — Valida los datos mínimos de un producto de menú: nombre y
 * precio (criterio de aceptación: "Cada producto del menú incluye
 * como mínimo nombre y precio").
 */
function validateMenuItemInput(data) {
  const errors = [];
  const d = data || {};

  if (!d.name || typeof d.name !== "string" || !d.name.trim()) {
    errors.push("El nombre del producto es obligatorio");
  }

  if (d.price === undefined || d.price === null || d.price === "") {
    errors.push("El precio del producto es obligatorio");
  } else {
    const price = Number(d.price);
    if (Number.isNaN(price) || price < 0) {
      errors.push("El precio debe ser un número mayor o igual a 0");
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateMenuItemInput };
