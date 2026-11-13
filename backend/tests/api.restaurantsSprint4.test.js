const request = require("supertest");
const { createApp } = require("../src/app");

// Se crea una app nueva por archivo de pruebas para no compartir el estado
// en memoria del repositorio demo con otros archivos de prueba.
const app = createApp();
const ADMIN_TOKEN = "demo-admin-token"; // valor por defecto en modo demo (ver adminAuth.js)

const RESTAURANTE_NUEVO = {
  name: "Postres La Dulcería",
  address: "Cra 12 #9-30, Sincelejo",
  schedule: "Lun-Sáb 14:00 a 20:00",
  category: "comida_corriente",
  priceLevel: 1,
  lat: 9.292,
  lng: -75.403,
};

async function registrarRestaurante() {
  const res = await request(app).post("/api/restaurants").send(RESTAURANTE_NUEVO);
  return res.body; // incluye id y ownerToken
}

describe("GET /api/admin/restaurants (HU07 — ver pendientes / HU09 — ver publicados)", () => {
  test("devuelve 401 sin token de administrador", async () => {
    const res = await request(app).get("/api/admin/restaurants").query({ status: "pending" });
    expect(res.status).toBe(401);
  });

  test("devuelve 403 con un token de administrador incorrecto", async () => {
    const res = await request(app)
      .get("/api/admin/restaurants")
      .set("x-admin-token", "token-falso")
      .query({ status: "pending" });
    expect(res.status).toBe(403);
  });

  test("devuelve 400 si el status no es válido", async () => {
    const res = await request(app)
      .get("/api/admin/restaurants")
      .set("x-admin-token", ADMIN_TOKEN)
      .query({ status: "aprobado" });
    expect(res.status).toBe(400);
  });

  test("lista los restaurantes pendientes y no expone el ownerToken", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .get("/api/admin/restaurants")
      .set("x-admin-token", ADMIN_TOKEN)
      .query({ status: "pending" });

    expect(res.status).toBe(200);
    const encontrado = res.body.results.find((r) => r.id === creado.id);
    expect(encontrado).toBeDefined();
    expect(encontrado.ownerToken).toBeUndefined();
  });
});

describe("PATCH /api/admin/restaurants/:id/observations (HU07)", () => {
  test("registra observaciones cuando la información está incompleta", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .patch(`/api/admin/restaurants/${creado.id}/observations`)
      .set("x-admin-token", ADMIN_TOKEN)
      .send({ observations: "Falta confirmar el horario de fin de semana" });

    expect(res.status).toBe(200);
    expect(res.body.observations).toBe("Falta confirmar el horario de fin de semana");
  });

  test("rechaza observaciones vacías", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .patch(`/api/admin/restaurants/${creado.id}/observations`)
      .set("x-admin-token", ADMIN_TOKEN)
      .send({ observations: "" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/admin/restaurants/:id/approve y /reject (HU08)", () => {
  test("aprobar publica el restaurante y lo hace visible para los estudiantes", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .post(`/api/admin/restaurants/${creado.id}/approve`)
      .set("x-admin-token", ADMIN_TOKEN);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("published");

    const listado = await request(app).get("/api/restaurants");
    expect(listado.body.results.some((r) => r.id === creado.id)).toBe(true);
  });

  test("rechazar informa el motivo y el restaurante sigue sin ser visible", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .post(`/api/admin/restaurants/${creado.id}/reject`)
      .set("x-admin-token", ADMIN_TOKEN)
      .send({ reason: "La dirección no corresponde a Sincelejo" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rejected");
    expect(res.body.rejectionReason).toBe("La dirección no corresponde a Sincelejo");

    const listado = await request(app).get("/api/restaurants");
    expect(listado.body.results.some((r) => r.id === creado.id)).toBe(false);
  });

  test("rechazar sin motivo devuelve 400", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .post(`/api/admin/restaurants/${creado.id}/reject`)
      .set("x-admin-token", ADMIN_TOKEN)
      .send({});
    expect(res.status).toBe(400);
  });

  test("el propietario puede ver el motivo de rechazo en su panel (owner-view)", async () => {
    const creado = await registrarRestaurante();
    await request(app)
      .post(`/api/admin/restaurants/${creado.id}/reject`)
      .set("x-admin-token", ADMIN_TOKEN)
      .send({ reason: "Falta el menú" });

    const vista = await request(app)
      .get(`/api/restaurants/${creado.id}/owner-view`)
      .set("x-owner-token", creado.ownerToken);

    expect(vista.status).toBe(200);
    expect(vista.body.status).toBe("rejected");
    expect(vista.body.rejectionReason).toBe("Falta el menú");
  });
});

describe("POST /api/admin/restaurants/:id/flag y /reviewed (HU09)", () => {
  test("marca un restaurante publicado para revisión", async () => {
    // Restaurante semilla #4, ya publicado.
    const res = await request(app)
      .post("/api/admin/restaurants/4/flag")
      .set("x-admin-token", ADMIN_TOKEN);
    expect(res.status).toBe(200);
    expect(res.body.flaggedForReview).toBe(true);
  });

  test("registra la fecha de la última supervisión realizada", async () => {
    const res = await request(app)
      .post("/api/admin/restaurants/4/reviewed")
      .set("x-admin-token", ADMIN_TOKEN);
    expect(res.status).toBe(200);
    expect(res.body.flaggedForReview).toBe(false);
    expect(res.body.lastReviewedAt).toBeDefined();
    expect(new Date(res.body.lastReviewedAt).toString()).not.toBe("Invalid Date");
  });

  test("devuelve 404 si el restaurante no existe", async () => {
    const res = await request(app)
      .post("/api/admin/restaurants/999999/flag")
      .set("x-admin-token", ADMIN_TOKEN);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/restaurants/:id/owner-view", () => {
  test("permite al propietario ver su restaurante pendiente (no visible públicamente)", async () => {
    const creado = await registrarRestaurante();

    const publico = await request(app).get(`/api/restaurants/${creado.id}`);
    expect(publico.status).toBe(404);

    const vista = await request(app)
      .get(`/api/restaurants/${creado.id}/owner-view`)
      .set("x-owner-token", creado.ownerToken);
    expect(vista.status).toBe(200);
    expect(vista.body.status).toBe("pending");
  });

  test("devuelve 403 si el token no corresponde al propietario", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app)
      .get(`/api/restaurants/${creado.id}/owner-view`)
      .set("x-owner-token", "token-equivocado");
    expect(res.status).toBe(403);
  });

  test("devuelve 401 si no se envía el token", async () => {
    const creado = await registrarRestaurante();
    const res = await request(app).get(`/api/restaurants/${creado.id}/owner-view`);
    expect(res.status).toBe(401);
  });
});
