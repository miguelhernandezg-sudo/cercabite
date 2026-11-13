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
| Sprint 4 | HU07 Validar · HU08 Aprobar/rechazar · HU09 Supervisar | Completado |

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

| GET | `/api/restaurants/:id/owner-view` | — | Vista del propietario: su restaurante en cualquier estado, con observaciones y motivo de rechazo (requiere `x-owner-token`) |
| GET | `/api/admin/restaurants?status=pending\|published\|rejected` | HU07/HU09 | Lista restaurantes por estado (requiere `x-admin-token`) |
| PATCH | `/api/admin/restaurants/:id/observations` | HU07 | Registrar observaciones cuando la información está incompleta |
| POST | `/api/admin/restaurants/:id/approve` | HU08 | Aprobar: el restaurante pasa a "published" |
| POST | `/api/admin/restaurants/:id/reject` | HU08 | Rechazar con un motivo, visible para el propietario en su `owner-view` |
| POST | `/api/admin/restaurants/:id/flag` | HU09 | Marcar un restaurante publicado para revisión |
| POST | `/api/admin/restaurants/:id/reviewed` | HU09 | Registrar la fecha de la última supervisión |

**Nota sobre `x-owner-token`:** al registrar un restaurante (HU04) la API entrega un `ownerToken` único; ese valor debe enviarse en el encabezado `x-owner-token` para editar el restaurante o su menú (HU05, HU06) o para consultar su estado (`owner-view`). No hay un sistema de autenticación completo todavía —está fuera del alcance de este taller—, pero el control de propiedad es real: sin el token correcto la API responde 401/403. Los restaurantes semilla usan el token de ejemplo `demo-owner-token` para poder probar estas historias.

**Nota sobre `x-admin-token`:** las rutas de administración (HU07, HU08, HU09) exigen este encabezado, comparado contra la variable de entorno `ADMIN_TOKEN` (en modo demo, el valor de ejemplo es `demo-admin-token`). Al igual que con `ownerToken`, es un control de acceso real pero simplificado, sin un sistema de autenticación completo.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Interfaz mínima que solicita la ubicación del navegador (HU01), muestra el listado de restaurantes cercanos ordenado por distancia y permite aplicar filtros de categoría, precio y calificación (HU02). Cada tarjeta del listado abre una vista de detalle con menú y opiniones (HU03), y un enlace del encabezado permite registrar un nuevo restaurante (HU04), que queda pendiente de aprobación. Un segundo enlace abre el panel "Administrar mi restaurante", donde el propietario —identificado con el id de su restaurante y su `ownerToken`— puede actualizar la información general (HU05), agregar/editar/eliminar productos del menú (HU06), y ver el estado de su restaurante junto con observaciones o motivo de rechazo (HU07, HU08). Un tercer enlace abre el "Panel de administrador" (con `x-admin-token`), donde se listan los restaurantes pendientes para aprobarlos o rechazarlos con un motivo (HU07, HU08), y los publicados para marcarlos para revisión o registrar su última supervisión (HU09). El diseño visual fue pulido al cierre del proyecto (identidad naranja/crema, tarjetas, botones jerarquizados, estados con color y vista responsive) sin modificar el comportamiento de la aplicación.

Con el Sprint 4 queda completo el backlog HU01-HU09 definido en el primer avance del proyecto.

## Gestión de la configuración

- **Control de versiones:** Git, con el flujo `main` (estable) / `develop` (integración) / `feature/<historia>` (desarrollo de cada historia de usuario).
- **Repositorio remoto:** GitHub (enlace en el informe final).
- **Elementos de configuración:** código fuente del backend y frontend, esquema de base de datos (`schema.sql`), datos semilla (`seed.sql`), documentación (`README.md`), configuración de dependencias (`package.json`).
