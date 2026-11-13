-- Esquema de base de datos de CercaBite (PostgreSQL)
-- Elemento de configuración versionado: ver sección "Gestión de la configuración" del informe final.

CREATE TABLE IF NOT EXISTS restaurants (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150)      NOT NULL,
    category      VARCHAR(50)       NOT NULL,
    price_level   SMALLINT          NOT NULL CHECK (price_level BETWEEN 1 AND 3),
    rating        NUMERIC(2,1)      NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    lat           DOUBLE PRECISION  NOT NULL,
    lng           DOUBLE PRECISION  NOT NULL,
    address       VARCHAR(200)      NOT NULL,
    schedule      VARCHAR(100),
    status        VARCHAR(20)       NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'published', 'rejected')),
    owner_id      INTEGER,
    created_at    TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_status   ON restaurants (status);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants (category);

CREATE TABLE IF NOT EXISTS menu_items (
    id             SERIAL PRIMARY KEY,
    restaurant_id  INTEGER REFERENCES restaurants (id) ON DELETE CASCADE,
    name           VARCHAR(100) NOT NULL,
    price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HU03 — Opiniones y calificaciones de estudiantes sobre un restaurante.
CREATE TABLE IF NOT EXISTS reviews (
    id             SERIAL PRIMARY KEY,
    restaurant_id  INTEGER REFERENCES restaurants (id) ON DELETE CASCADE,
    author         VARCHAR(100) NOT NULL,
    rating         SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        VARCHAR(500),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews (restaurant_id);

CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    role         VARCHAR(20)  NOT NULL CHECK (role IN ('student', 'owner', 'admin')),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
