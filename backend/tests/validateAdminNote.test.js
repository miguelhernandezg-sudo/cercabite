const { validateAdminNote } = require("../src/utils/validateAdminNote");

describe("validateAdminNote (HU07, HU08)", () => {
  test("acepta un texto no vacío", () => {
    const resultado = validateAdminNote("Falta el horario de atención");
    expect(resultado.valid).toBe(true);
  });

  test("rechaza un texto vacío", () => {
    const resultado = validateAdminNote("   ");
    expect(resultado.valid).toBe(false);
  });

  test("rechaza cuando no se envía nada", () => {
    const resultado = validateAdminNote(undefined);
    expect(resultado.valid).toBe(false);
    expect(resultado.errors[0]).toContain("obligatorio");
  });
});
