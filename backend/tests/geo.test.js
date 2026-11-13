const { haversineDistanceKm, isValidCoordinate } = require("../src/utils/geo");

describe("haversineDistanceKm", () => {
  test("la distancia de un punto a sí mismo es 0", () => {
    expect(haversineDistanceKm(9.3047, -75.3978, 9.3047, -75.3978)).toBe(0);
  });

  test("calcula correctamente la distancia entre dos puntos conocidos (Sincelejo - Corozal, ≈ 11-12 km en línea recta)", () => {
    // Sincelejo (centro) y Corozal, Sucre
    const distancia = haversineDistanceKm(9.3047, -75.3978, 9.3186, -75.2947);
    expect(distancia).toBeGreaterThan(9);
    expect(distancia).toBeLessThan(13);
  });

  test("la distancia es simétrica (A→B es igual a B→A)", () => {
    const aB = haversineDistanceKm(9.3047, -75.3978, 9.3186, -75.2947);
    const bA = haversineDistanceKm(9.3186, -75.2947, 9.3047, -75.3978);
    expect(aB).toBe(bA);
  });

  test("lanza un error si alguna coordenada no es un número", () => {
    expect(() => haversineDistanceKm("9.3", -75.3978, 9.3186, -75.2947)).toThrow(TypeError);
  });
});

describe("isValidCoordinate", () => {
  test("acepta coordenadas válidas", () => {
    expect(isValidCoordinate(9.3047, -75.3978)).toBe(true);
  });

  test("rechaza latitudes fuera de rango", () => {
    expect(isValidCoordinate(120, -75.3978)).toBe(false);
  });

  test("rechaza longitudes fuera de rango", () => {
    expect(isValidCoordinate(9.3047, -200)).toBe(false);
  });

  test("rechaza valores que no son numéricos", () => {
    expect(isValidCoordinate("9.3047", -75.3978)).toBe(false);
  });
});
