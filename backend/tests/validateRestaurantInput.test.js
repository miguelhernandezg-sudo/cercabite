const { validateRestaurantInput } = require("../src/utils/validateRestaurantInput");

const DATOS_VALIDOS = {
  name: "Comidas Rápidas El Primo",
  address: "Cra 10 #5-20",
  schedule: "Lun-Dom 10:00 a 22:00",
  category: "comida_rapida",
  priceLevel: 2,
  lat: 9.29,
  lng: -75.4,
};

describe("validateRestaurantInput (HU04)", () => {
  test("acepta datos completos y válidos", () => {
    const resultado = validateRestaurantInput(DATOS_VALIDOS);
    expect(resultado.valid).toBe(true);
    expect(resultado.errors).toHaveLength(0);
  });

  test("rechaza cuando falta el nombre", () => {
    const resultado = validateRestaurantInput({ ...DATOS_VALIDOS, name: "" });
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.some((e) => e.includes("nombre"))).toBe(true);
  });

  test("rechaza cuando falta la dirección", () => {
    const resultado = validateRestaurantInput({ ...DATOS_VALIDOS, address: "   " });
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.some((e) => e.includes("dirección"))).toBe(true);
  });

  test("rechaza cuando falta el horario", () => {
    const { schedule, ...sinHorario } = DATOS_VALIDOS;
    const resultado = validateRestaurantInput(sinHorario);
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.some((e) => e.includes("horario"))).toBe(true);
  });

  test("rechaza una categoría que no existe en el catálogo", () => {
    const resultado = validateRestaurantInput({ ...DATOS_VALIDOS, category: "comida_gourmet" });
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.some((e) => e.includes("categoría"))).toBe(true);
  });

  test("rechaza un nivel de precio fuera de rango", () => {
    const resultado = validateRestaurantInput({ ...DATOS_VALIDOS, priceLevel: 5 });
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.some((e) => e.includes("precio"))).toBe(true);
  });

  test("rechaza coordenadas no numéricas", () => {
    const resultado = validateRestaurantInput({ ...DATOS_VALIDOS, lat: "no-es-un-número" });
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.some((e) => e.includes("latitud"))).toBe(true);
  });

  test("acumula varios errores a la vez", () => {
    const resultado = validateRestaurantInput({});
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.length).toBeGreaterThanOrEqual(5);
  });
});
