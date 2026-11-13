const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

// Ubicación cercana a "El Fogón Universitario" y a "Jugos y Arepas Doña Nelly"
const LAT = 9.2903;
const LNG = -75.4038;

describe("GET /api/health", () => {
  test("responde 200 e indica el modo de ejecución", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.mode).toBe("demo");
  });
});

describe("GET /api/restaurants/nearby (HU01)", () => {
  test("devuelve 400 si faltan lat o lng", async () => {
    const res = await request(app).get("/api/restaurants/nearby");
    expect(res.status).toBe(400);
  });

  test("devuelve restaurantes cercanos ordenados por distancia", async () => {
    const res = await request(app).get("/api/restaurants/nearby").query({ lat: LAT, lng: LNG, radiusKm: 5 });
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    const distancias = res.body.results.map((r) => r.distanceKm);
    const ordenado = [...distancias].sort((a, b) => a - b);
    expect(distancias).toEqual(ordenado);
  });
});

describe("GET /api/restaurants (HU02)", () => {
  test("sin parámetros devuelve todos los restaurantes", async () => {
    const res = await request(app).get("/api/restaurants");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(6);
  });

  test("filtra por categoría y precio combinados", async () => {
    const res = await request(app)
      .get("/api/restaurants")
      .query({ category: "comida_corriente", maxPrice: 1 });
    expect(res.status).toBe(200);
    res.body.results.forEach((r) => {
      expect(r.category).toBe("comida_corriente");
      expect(r.priceLevel).toBeLessThanOrEqual(1);
    });
  });

  test("devuelve 400 si la ubicación enviada no es válida", async () => {
    const res = await request(app).get("/api/restaurants").query({ lat: 999, lng: LNG });
    expect(res.status).toBe(400);
  });
});
