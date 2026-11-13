-- Datos de ejemplo para desarrollo local (equivalentes a src/data/restaurants.seed.js)

INSERT INTO restaurants (name, category, price_level, rating, lat, lng, address, schedule, status)
VALUES
  ('El Fogón Universitario',     'comida_corriente', 1, 4.3, 9.2903, -75.4038, 'Cra 20 #25-10, cerca de la Universidad de Sucre', 'Lun-Sáb 11:00 a 20:00', 'published'),
  ('Pizzería NapoliBite',        'pizza',            2, 4.6, 9.2944, -75.4001, 'Calle 28 #18-45, Barrio La María',               'Mar-Dom 12:00 a 22:00', 'published'),
  ('Sushi Caribe',               'comida_rapida',    3, 4.1, 9.2871, -75.3975, 'Av. Principal #10-20, cerca de CECAR',           'Lun-Dom 12:00 a 21:30', 'published'),
  ('Jugos y Arepas Doña Nelly',  'comida_corriente', 1, 4.8, 9.2915, -75.4055, 'Cra 22 #27-05',                                   'Lun-Sáb 06:00 a 15:00', 'published'),
  ('Burger Point',               'comida_rapida',    2, 4.0, 9.2850, -75.3920, 'Calle 23 #15-30',                                 'Lun-Dom 16:00 a 23:00', 'published'),
  ('Vegetariano Verde Vida',     'vegetariano',      2, 4.5, 9.2930, -75.4010, 'Cra 19 #26-12',                                   'Lun-Vie 11:00 a 19:00', 'published')
ON CONFLICT DO NOTHING;

-- Ítems de menú de ejemplo (HU03). Asume que los restaurantes anteriores
-- se insertaron primero y conservan los id 1 a 6.
INSERT INTO menu_items (restaurant_id, name, price)
VALUES
  (1, 'Bandeja corriente',          12000),
  (1, 'Sancocho de gallina',        15000),
  (2, 'Pizza napolitana personal',  18000),
  (2, 'Pizza familiar hawaiana',    42000),
  (3, 'Combo sushi 10 piezas',      28000),
  (4, 'Arepa de huevo',              4000),
  (4, 'Jugo natural grande',         6000),
  (5, 'Hamburguesa clásica',        14000),
  (6, 'Bowl vegetariano',           16000)
ON CONFLICT DO NOTHING;

-- Opiniones de ejemplo (HU03). El restaurante 6 queda sin reseñas a
-- propósito para probar el caso "sin calificaciones disponibles".
INSERT INTO reviews (restaurant_id, author, rating, comment)
VALUES
  (1, 'Estudiante CECAR', 4, 'Buen precio y porciones grandes.'),
  (1, 'Ana M.',           5, 'El sancocho es excelente para el almuerzo.'),
  (2, 'Carlos R.',        4, 'La pizza llega caliente, buen servicio.'),
  (3, 'Luisa P.',         4, 'Variedad de combos, ideal entre semana.'),
  (4, 'Pedro G.',         5, 'Las arepas de huevo son las mejores cerca de la u.')
ON CONFLICT DO NOTHING;
