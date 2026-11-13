const { isValidAdminToken } = require("../src/utils/adminAuth");

describe("isValidAdminToken", () => {
  test("acepta el token de administrador por defecto en modo demo", () => {
    expect(isValidAdminToken("demo-admin-token")).toBe(true);
  });

  test("rechaza un token incorrecto", () => {
    expect(isValidAdminToken("token-cualquiera")).toBe(false);
  });

  test("rechaza cuando no se envía token", () => {
    expect(isValidAdminToken(undefined)).toBe(false);
    expect(isValidAdminToken("")).toBe(false);
  });
});
