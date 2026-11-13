const { findNearby, filterRestaurants } = require("../src/services/restaurantService");
const { restaurants } = require("../src/data/restaurants.seed");

// Ubicación de referencia: entrada de la Universidad de Sucre (cerca del seed)
const STUDENT_LAT = 9.2903;
const STUDENT_LNG = -75.4038;

describe("findNearby (HU01)", () => {
  test("devuelve solo restaurantes dentro del radio indicado", () => {
    const resultado = findNearby(restaurants, STUDENT_LAT, STUDENT_LNG, 1.5);
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((r) => expect(r.distanceKm).toBeLessThanOrEqual(1.5));
  });

  test("devuelve los resultados ordenados de menor a mayor distancia", () => {
    const resultado = findNearby(restaurants, STUDENT_LAT, STUDENT_LNG, 10);
    for (let i = 1; i < resultado.length; i++) {
      expect(resultado[i].distanceKm).toBeGreaterThanOrEqual(resultado[i - 1].distanceKm);
    }
  });

  test("con un punto alejado de todos los restaurantes, no devuelve resultados", () => {
    const puntoLejano = { lat: 9.45, lng: -75.55 }; // fuera del radio de cualquier restaurante del seed
    const resultado = findNearby(restaurants, puntoLejano.lat, puntoLejano.lng, 1);
    expect(resultado.length).toBe(0);
  });

  test("lanza un error si la ubicación del usuario no es válida", () => {
    expect(() => findNearby(restaurants, 200, STUDENT_LNG, 5)).toThrow(RangeError);
  });
});

describe("filterRestaurants (HU02)", () => {
  test("filtra por categoría", () => {
    const resultado = filterRestaurants(restaurants, { category: "pizza" });
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((r) => expect(r.category).toBe("pizza"));
  });

  test("filtra por precio máximo", () => {
    const resultado = filterRestaurants(restaurants, { maxPrice: 1 });
    resultado.forEach((r) => expect(r.priceLevel).toBeLessThanOrEqual(1));
  });

  test("filtra por calificación mínima", () => {
    const resultado = filterRestaurants(restaurants, { minRating: 4.5 });
    resultado.forEach((r) => expect(r.rating).toBeGreaterThanOrEqual(4.5));
  });

  test("combina varios filtros a la vez", () => {
    const resultado = filterRestaurants(restaurants, {
      category: "comida_corriente",
      maxPrice: 1,
      minRating: 4,
    });
    resultado.forEach((r) => {
      expect(r.category).toBe("comida_corriente");
      expect(r.priceLevel).toBeLessThanOrEqual(1);
      expect(r.rating).toBeGreaterThanOrEqual(4);
    });
  });

  test("filtra por distancia máxima cuando se da la ubicación del usuario", () => {
    const resultado = filterRestaurants(restaurants, {
      lat: STUDENT_LAT,
      lng: STUDENT_LNG,
      maxDistanceKm: 1,
    });
    resultado.forEach((r) => expect(r.distanceKm).toBeLessThanOrEqual(1));
  });

  test("sin filtros devuelve todos los restaurantes", () => {
    const resultado = filterRestaurants(restaurants, {});
    expect(resultado.length).toBe(restaurants.length);
  });
});
