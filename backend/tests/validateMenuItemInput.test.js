const { validateMenuItemInput } = require("../src/utils/validateMenuItemInput");

describe("validateMenuItemInput (HU06)", () => {
  test("acepta un producto con nombre y precio válidos", () => {
    const resultado = validateMenuItemInput({ name: "Arepa de huevo", price: 4000 });
    expect(resultado.valid).toBe(true);
    expect(resultado.errors).toHaveLength(0);
  });

  test("rechaza cuando falta el nombre", () => {
    const resultado = validateMenuItemInput({ price: 4000 });
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.some((e) => e.includes("nombre"))).toBe(true);
  });

  test("rechaza cuando falta el precio", () => {
    const resultado = validateMenuItemInput({ name: "Arepa de huevo" });
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.some((e) => e.includes("precio"))).toBe(true);
  });

  test("rechaza un precio negativo", () => {
    const resultado = validateMenuItemInput({ name: "Arepa de huevo", price: -100 });
    expect(resultado.valid).toBe(false);
  });

  test("acepta precio 0 (producto de cortesía)", () => {
    const resultado = validateMenuItemInput({ name: "Agua", price: 0 });
    expect(resultado.valid).toBe(true);
  });
});
