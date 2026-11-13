const express = require("express");
const cors = require("cors");
const { createPool } = require("./db/pool");
const { createRestaurantRepository } = require("./repositories/restaurantRepository");
const { createRestaurantsRouter } = require("./routes/restaurants");

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const pool = createPool();
  const repository = createRestaurantRepository(pool);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: repository.mode });
  });

  app.use("/api/restaurants", createRestaurantsRouter(repository));

  return app;
}

module.exports = { createApp };
