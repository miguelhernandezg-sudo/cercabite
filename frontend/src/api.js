const BASE_URL = "/api/restaurants";

/**
 * HU02 — Consulta restaurantes aplicando filtros opcionales
 * (categoría, precio, calificación, distancia) y, si se provee
 * la ubicación, ordena por distancia.
 */
export async function fetchRestaurants(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, value);
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo consultar los restaurantes");
  }
  return response.json();
}

/**
 * HU03 — Consulta el detalle de un restaurante: datos generales,
 * menú y opiniones/calificaciones de otros estudiantes.
 */
export async function fetchRestaurantDetail(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo consultar el detalle del restaurante");
  }
  return response.json();
}

/**
 * HU04 — Registra un nuevo restaurante (queda pendiente de aprobación).
 */
export async function registerRestaurant(datos) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const mensaje = Array.isArray(body.errors) ? body.errors.join(" · ") : body.error;
    throw new Error(mensaje || "No se pudo registrar el restaurante");
  }
  return body;
}

async function manejarRespuesta(response, mensajePorDefecto) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const mensaje = Array.isArray(body.errors) ? body.errors.join(" · ") : body.error;
    throw new Error(mensaje || mensajePorDefecto);
  }
  return body;
}

/**
 * HU05 — Actualiza la información de un restaurante propio. Requiere el
 * ownerToken entregado al registrarlo (HU04).
 */
export async function updateRestaurant(id, ownerToken, datos) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-owner-token": ownerToken },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(response, "No se pudo actualizar el restaurante");
}

/**
 * HU06 — Gestión del menú de un restaurante propio (agregar, editar,
 * eliminar productos), también protegida por el ownerToken.
 */
export async function addMenuItem(restaurantId, ownerToken, datos) {
  const response = await fetch(`${BASE_URL}/${restaurantId}/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-owner-token": ownerToken },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(response, "No se pudo agregar el producto");
}

export async function updateMenuItem(restaurantId, itemId, ownerToken, datos) {
  const response = await fetch(`${BASE_URL}/${restaurantId}/menu/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-owner-token": ownerToken },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(response, "No se pudo editar el producto");
}

export async function deleteMenuItem(restaurantId, itemId, ownerToken) {
  const response = await fetch(`${BASE_URL}/${restaurantId}/menu/${itemId}`, {
    method: "DELETE",
    headers: { "x-owner-token": ownerToken },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo eliminar el producto");
  }
}

/**
 * Vista del propietario: igual al detalle (HU03) pero visible en
 * cualquier estado (pending/published/rejected), e incluye las
 * observaciones del administrador (HU07) y el motivo de rechazo (HU08).
 */
export async function fetchOwnerView(id, ownerToken) {
  const response = await fetch(`${BASE_URL}/${id}/owner-view`, {
    headers: { "x-owner-token": ownerToken },
  });
  return manejarRespuesta(response, "No se pudo consultar el restaurante");
}

const ADMIN_BASE_URL = "/api/admin/restaurants";

/**
 * HU07 — Lista restaurantes por estado (pendientes para validar,
 * publicados para supervisar — HU09).
 */
export async function fetchAdminRestaurants(status, adminToken) {
  const response = await fetch(`${ADMIN_BASE_URL}?status=${status}`, {
    headers: { "x-admin-token": adminToken },
  });
  return manejarRespuesta(response, "No se pudo consultar los restaurantes");
}

/** HU07 — Registrar observaciones cuando la información está incompleta. */
export async function setRestaurantObservations(id, adminToken, observations) {
  const response = await fetch(`${ADMIN_BASE_URL}/${id}/observations`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
    body: JSON.stringify({ observations }),
  });
  return manejarRespuesta(response, "No se pudieron guardar las observaciones");
}

/** HU08 — Aprobar: el restaurante pasa a "published". */
export async function approveRestaurant(id, adminToken) {
  const response = await fetch(`${ADMIN_BASE_URL}/${id}/approve`, {
    method: "POST",
    headers: { "x-admin-token": adminToken },
  });
  return manejarRespuesta(response, "No se pudo aprobar el restaurante");
}

/** HU08 — Rechazar: se informa el motivo al propietario. */
export async function rejectRestaurant(id, adminToken, reason) {
  const response = await fetch(`${ADMIN_BASE_URL}/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
    body: JSON.stringify({ reason }),
  });
  return manejarRespuesta(response, "No se pudo rechazar el restaurante");
}

/** HU09 — Marcar un restaurante publicado para revisión. */
export async function flagRestaurantForReview(id, adminToken) {
  const response = await fetch(`${ADMIN_BASE_URL}/${id}/flag`, {
    method: "POST",
    headers: { "x-admin-token": adminToken },
  });
  return manejarRespuesta(response, "No se pudo marcar el restaurante para revisión");
}

/** HU09 — Registrar que la supervisión periódica ya se realizó. */
export async function markRestaurantReviewed(id, adminToken) {
  const response = await fetch(`${ADMIN_BASE_URL}/${id}/reviewed`, {
    method: "POST",
    headers: { "x-admin-token": adminToken },
  });
  return manejarRespuesta(response, "No se pudo registrar la supervisión");
}
