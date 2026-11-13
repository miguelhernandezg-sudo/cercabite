const request = require("supertest");
const { createApp } = require("../src/app");

// Se crea una app nueva por archivo de pruebas para no compartir el estado
// en memoria del repositorio demo con otros archivos de prueba.
const app = createApp();

describe("GET /api/restaurants/:id (HU03 — consultar detalle)", () => {
  test("devuelve el detalle de un restaurante publicado, con menú y opiniones", async () => {
    const res = await request(app).get("/api/restaurants/1");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("El Fogón Universitario");
    expect(Array.isArray(res.body.menu)).toBe(true);
    expect(res.body.menu.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body.reviews.length).toBeGreaterThan(0);
    expect(res.body.sinResenas).toBe(false);
  });

  test("indica que no hay reseñas cuando el restaurante todavía no tiene", async () => {
    const res = await request(app).get("/api/restaurants/6");
    expect(res.status).toBe(200);
    expect(res.body.reviews).toEqual([]);
    expect(res.body.sinResenas).toBe(true);
  });

  test("devuelve 404 si el restaurante no existe", async () => {
    const res = await request(app).get("/api/restaurants/9999");
    expect(res.status).toBe(404);
  });

  test("devuelve 400 si el id no es numérico", async () => {
    const res = await request(app).get("/api/restaurants/abc");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/restaurants (HU04 — registrar restaurante)", () => {
  const RESTAURANTE_VALIDO = {
    name: "Comidas Rápidas El Primo",
    address: "Cra 10 #5-20, Sincelejo",
    schedule: "Lun-Dom 10:00 a 22:00",
    category: "comida_rapida",
    priceLevel: 2,
    lat: 9.295,
    lng: -75.401,
  };

  test("registra un restaurante válido y lo deja en estado pendiente", async () => {
    const res = await request(app).post("/api/restaurants").send(RESTAURANTE_VALIDO);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe("pending");
    expect(res.body.name).toBe(RESTAURANTE_VALIDO.name);
  });

  test("un restaurante recién registrado no aparece aún en la búsqueda pública", async () => {
    const creado = await request(app).post("/api/restaurants").send({
      ...RESTAURANTE_VALIDO,
      name: "Restaurante Pendiente De Prueba",
    });
    expect(creado.status).toBe(201);

    const detalle = await request(app).get(`/api/restaurants/${creado.body.id}`);
    expect(detalle.status).toBe(404);

    const listado = await request(app).get("/api/restaurants");
    const aparece = listado.body.results.some((r) => r.id === creado.body.id);
    expect(aparece).toBe(false);
  });

  test("devuelve 400 con la lista de errores si faltan campos obligatorios", async () => {
    const res = await request(app).post("/api/restaurants").send({ name: "Solo nombre" });
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test("devuelve 400 si la categoría no es válida", async () => {
    const res = await request(app)
      .post("/api/restaurants")
      .send({ ...RESTAURANTE_VALIDO, category: "comida_gourmet" });
    expect(res.status).toBe(400);
  });
});
