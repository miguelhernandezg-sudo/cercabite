/**
 * Autorización simple del administrador: un token único, configurable
 * con ADMIN_TOKEN, con un valor de ejemplo para el modo demo. No
 * sustituye un sistema de autenticación completo (fuera del alcance de
 * este taller), pero exige realmente el token en cada operación
 * administrativa (HU07, HU08, HU09).
 */
function getExpectedAdminToken() {
  return process.env.ADMIN_TOKEN || "demo-admin-token";
}

function isValidAdminToken(token) {
  return Boolean(token) && token === getExpectedAdminToken();
}

module.exports = { isValidAdminToken, getExpectedAdminToken };
