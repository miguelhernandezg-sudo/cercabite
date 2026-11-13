# CercaBite

Plataforma web de geolocalización para que los estudiantes universitarios de Sincelejo encuentren restaurantes cercanos, consulten su información y filtren resultados según sus preferencias. Proyecto desarrollado para la asignatura **Gestión de Desarrollo de Software** (CECAR), siguiendo la metodología ágil **Scrum**.

## Equipo

- Edward David Molina Cuadrado
- Miguel Ángel Hernández Gale
- Tomás Alfonso Madariaga Suárez

## Estructura del repositorio

```
cercabite/
├── backend/     API REST en Node.js + Express (+ PostgreSQL en producción)
├── frontend/    Interfaz web en React (Vite)
└── docs/        Documentación de apoyo del proyecto
```

## Estado del desarrollo (por sprint)

| Sprint | Historias de usuario | Estado |
| --- | --- | --- |
| Sprint 0 | Fundamentos (backlog, arquitectura, entorno) | Completado |
| Sprint 1 | HU01 Buscar restaurantes cercanos · HU02 Filtrar restaurantes | Completado |
| Sprint 2 | HU03 Consultar detalle · HU04 Registrar restaurante | Completado |
| Sprint 3 | HU05 Actualizar información · HU06 Gestionar menú | Completado |
| Sprint 4 | HU07 Validar · HU08 Aprobar/rechazar · HU09 Supervisar | Pendiente |

## Backend

### Ejecutar en modo demo (sin base de datos)

```bash
cd backend
npm install
npm run dev
```

Por defecto, si no se define la variable de entorno `DATABASE_URL`, la API funciona en **modo demo**, usando un conjunto de restaurantes de ejemplo (`src/data/restaurants.seed.js`) para poder probar la búsqueda y el filtrado sin necesidad de levantar PostgreSQL.

### Ejecutar con PostgreSQL

```bash
cd backend
docker compose up -d        # levanta un contenedor de PostgreSQL
cp .env.example .env        # ajustar DATABASE_URL si es necesario
psql "$DATABASE_URL" -f schema.sql
psql "$DATABASE_URL" -f seed.sql
npm run dev
```

### Pruebas unitarias

```bash
cd backend
npm test
```

### Endpoints disponibles

| Método | Ruta | Historia | Descripción |
| --- | --- | --- | --- |
| GET | `/api/restaurants/nearby?lat=&lng=&radiusKm=` | HU01 | Restaurantes cercanos a una ubicación, ordenados por distancia |
| GET | `/api/restaurants?category=&maxPrice=&minRating=&maxDistanceKm=&lat=&lng=` | HU02 | Restaurantes filtrados por categoría, precio, calificación o distancia |
| GET | `/api/restaurants/:id` | HU03 | Detalle de un restaurante publicado: datos generales, menú y opiniones |
| POST | `/api/restaurants` | HU04 | Registrar un restaurante nuevo (queda "pending" hasta ser aprobado) |
| PATCH | `/api/restaurants/:id` | HU05 | Actualizar la información de un restaurante propio (requiere `x-owner-token`) |
| POST | `/api/restaurants/:id/menu` | HU06 | Agregar un producto al menú (requiere `x-owner-token`) |
| PATCH | `/api/restaurants/:id/menu/:itemId` | HU06 | Editar un producto del menú (requiere `x-owner-token`) |
| DELETE | `/api/restaurants/:id/menu/:itemId` | HU06 | Eliminar un producto del menú (requiere `x-owner-token`) |

**Nota sobre `x-owner-token`:** al registrar un restaurante (HU04) la API entrega un `ownerToken` único; ese valor debe enviarse en el encabezado `x-owner-token` para editar el restaurante o su menú (HU05, HU06). No hay un sistema de autenticación completo todavía —está fuera del alcance de este taller—, pero el control de propiedad es real: sin el token correcto la API responde 401/403. Los restaurantes semilla usan el token de ejemplo `demo-owner-token` para poder probar estas historias.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Interfaz mínima que solicita la ubicación del navegador (HU01), muestra el listado de restaurantes cercanos ordenado por distancia y permite aplicar filtros de categoría, precio y calificación (HU02). Cada tarjeta del listado abre una vista de detalle con menú y opiniones (HU03), y un enlace del encabezado permite registrar un nuevo restaurante (HU04), que queda pendiente de aprobación. Un segundo enlace abre el panel "Administrar mi restaurante", donde el propietario —identificado con el id de su restaurante y su `ownerToken`— puede actualizar la información general (HU05) y agregar, editar o eliminar productos del menú (HU06). El diseño visual es intencionalmente básico por ahora; se mejorará en una iteración posterior.

## Gestión de la configuración

- **Control de versiones:** Git, con el flujo `main` (estable) / `develop` (integración) / `feature/<historia>` (desarrollo de cada historia de usuario).
- **Repositorio remoto:** GitHub (enlace en el informe final).
- **Elementos de configuración:** código fuente del backend y frontend, esquema de base de datos (`schema.sql`), datos semilla (`seed.sql`), documentación (`README.md`), configuración de dependencias (`package.json`).
