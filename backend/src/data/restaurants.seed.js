/**
 * Datos de ejemplo utilizados en modo demo (sin base de datos) y como
 * semilla para PostgreSQL (ver seed.sql). Coordenadas aproximadas en
 * el entorno universitario de Sincelejo, Sucre.
 */

const restaurants = [
  {
    id: 1,
    name: "El Fogón Universitario",
    category: "comida_corriente",
    priceLevel: 1,
    rating: 4.3,
    lat: 9.2903,
    lng: -75.4038,
    address: "Cra 20 #25-10, cerca de la Universidad de Sucre",
    schedule: "Lun-Sáb 11:00 a 20:00",
  },
  {
    id: 2,
    name: "Pizzería NapoliBite",
    category: "pizza",
    priceLevel: 2,
    rating: 4.6,
    lat: 9.2944,
    lng: -75.4001,
    address: "Calle 28 #18-45, Barrio La María",
    schedule: "Mar-Dom 12:00 a 22:00",
  },
  {
    id: 3,
    name: "Sushi Caribe",
    category: "comida_rapida",
    priceLevel: 3,
    rating: 4.1,
    lat: 9.2871,
    lng: -75.3975,
    address: "Av. Principal #10-20, cerca de CECAR",
    schedule: "Lun-Dom 12:00 a 21:30",
  },
  {
    id: 4,
    name: "Jugos y Arepas Doña Nelly",
    category: "comida_corriente",
    priceLevel: 1,
    rating: 4.8,
    lat: 9.2915,
    lng: -75.4055,
    address: "Cra 22 #27-05",
    schedule: "Lun-Sáb 06:00 a 15:00",
  },
  {
    id: 5,
    name: "Burger Point",
    category: "comida_rapida",
    priceLevel: 2,
    rating: 4.0,
    lat: 9.2850,
    lng: -75.3920,
    address: "Calle 23 #15-30",
    schedule: "Lun-Dom 16:00 a 23:00",
  },
  {
    id: 6,
    name: "Vegetariano Verde Vida",
    category: "vegetariano",
    priceLevel: 2,
    rating: 4.5,
    lat: 9.2930,
    lng: -75.4010,
    address: "Cra 19 #26-12",
    schedule: "Lun-Vie 11:00 a 19:00",
  },
];

module.exports = { restaurants };
