const request = require("supertest");
const { createApp } = require("../src/app");

// Se crea una app nueva por archivo de pruebas para no compartir el estado
// en memoria del repositorio demo con otros archivos de prueba.
const app = createApp();

const RESTAURANTE_NUEVO = {
  name: "Taquería Sabor Norte",
  address: "Cra 5 #8-20, Sincelejo",
  schedule: "Lun-Dom 11:00 a 21:00",
  category: "comida_rapida",
  priceLevel: 2,
  lat: 9.296,
  lng: -75.402,
};

async function registrarRestaurante() {
  const res = await request(app).post("/api/restaurants").send(RESTAURANTE_NUEVO);
  return res.body; // incluye id y ownerToken
}

describe("PATCH /api/restaurants/:id (HU05 — actualizar información)", () => {
  test("devuelve 401 si no se envía el token de propietario", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .patch(`/api/restaurants/${creado.id}`)
      .send({ ...RESTAURANTE_NUEVO, name: "Nuevo nombre" });
    expect(res.status).toBe(401);
  });

  test("devuelve 403 si el token de propietario no corresponde", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .patch(`/api/restaurants/${creado.id}`)
      .set("x-owner-token", "token-equivocado")
      .send({ ...RESTAURANTE_NUEVO, name: "Nuevo nombre" });
    expect(res.status).toBe(403);
  });

  test("devuelve 404 si el restaurante no existe", async () => {
    const res = await request(app)
      .patch("/api/restaurants/999999")
      .set("x-owner-token", "cualquiera")
      .send(RESTAURANTE_NUEVO);
    expect(res.status).toBe(404);
  });

  test("actualiza el restaurante con el token correcto y no expone el ownerToken", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .patch(`/api/restaurants/${creado.id}`)
      .set("x-owner-token", creado.ownerToken)
      .send({ ...RESTAURANTE_NUEVO, name: "Taquería Sabor Norte 2.0", schedule: "Lun-Dom 10:00 a 22:00" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Taquería Sabor Norte 2.0");
    expect(res.body.ownerToken).toBeUndefined();
  });

  test("el restaurante sigue en estado pendiente: el cambio no se ve en la búsqueda pública aún", async () => {
    const creado = await registrarRestaurante();
    await request(app)
      .patch(`/api/restaurants/${creado.id}`)
      .set("x-owner-token", creado.ownerToken)
      .send({ ...RESTAURANTE_NUEVO, name: "Pendiente Editado" });

    const listado = await request(app).get("/api/restaurants");
    expect(listado.body.results.some((r) => r.id === creado.id)).toBe(false);
  });

  test("un restaurante ya publicado refleja de inmediato el cambio en la vista del estudiante", async () => {
    // El restaurante semilla #2 ya está "published" y usa el token demo.
    const res = await request(app)
      .patch("/api/restaurants/2")
      .set("x-owner-token", "demo-owner-token")
      .send({
        name: "Pizzería NapoliBite",
        address: "Calle 28 #18-45, Barrio La María",
        schedule: "Lun-Dom 12:00 a 23:00",
        category: "pizza",
        priceLevel: 2,
        lat: 9.2944,
        lng: -75.4001,
      });
    expect(res.status).toBe(200);

    const detalle = await request(app).get("/api/restaurants/2");
    expect(detalle.body.schedule).toBe("Lun-Dom 12:00 a 23:00");
  });
});

describe("Gestión del menú (HU06)", () => {
  test("agrega un producto al menú con el token correcto", async () => {
    const res = await request(app)
      .post("/api/restaurants/1/menu")
      .set("x-owner-token", "demo-owner-token")
      .send({ name: "Limonada de coco", price: 7000 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Limonada de coco");

    const detalle = await request(app).get("/api/restaurants/1");
    expect(detalle.body.menu.some((m) => m.name === "Limonada de coco")).toBe(true);
  });

  test("rechaza agregar un producto sin el token de propietario", async () => {
    const res = await request(app).post("/api/restaurants/1/menu").send({ name: "Postre", price: 5000 });
    expect(res.status).toBe(401);
  });

  test("rechaza agregar un producto con datos inválidos", async () => {
    const res = await request(app)
      .post("/api/restaurants/1/menu")
      .set("x-owner-token", "demo-owner-token")
      .send({ name: "" });
    expect(res.status).toBe(400);
  });

  test("edita un producto existente del menú", async () => {
    const creado = await request(app)
      .post("/api/restaurants/1/menu")
      .set("x-owner-token", "demo-owner-token")
      .send({ name: "Jugo de mango", price: 6000 });

    const editado = await request(app)
      .patch(`/api/restaurants/1/menu/${creado.body.id}`)
      .set("x-owner-token", "demo-owner-token")
      .send({ name: "Jugo de mango grande", price: 7500 });

    expect(editado.status).toBe(200);
    expect(editado.body.price).toBe(7500);
  });

  test("elimina un producto y deja de aparecer en el detalle del restaurante", async () => {
    const creado = await request(app)
      .post("/api/restaurants/1/menu")
      .set("x-owner-token", "demo-owner-token")
      .send({ name: "Producto temporal", price: 1000 });

    const eliminado = await request(app)
      .delete(`/api/restaurants/1/menu/${creado.body.id}`)
      .set("x-owner-token", "demo-owner-token");
    expect(eliminado.status).toBe(204);

    const detalle = await request(app).get("/api/restaurants/1");
    expect(detalle.body.menu.some((m) => m.id === creado.body.id)).toBe(false);
  });

  test("no permite gestionar el menú de un restaurante ajeno", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .post(`/api/restaurants/${creado.id}/menu`)
      .set("x-owner-token", "demo-owner-token") // token de otro restaurante
      .send({ name: "Producto intruso", price: 1000 });
    expect(res.status).toBe(403);
  });
});
