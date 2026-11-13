import { useEffect, useState } from "react";
import { fetchRestaurants } from "./api";
import RestaurantDetail from "./RestaurantDetail";
import RegisterRestaurantForm from "./RegisterRestaurantForm";
import ManageRestaurantPanel from "./ManageRestaurantPanel";
import AdminPanel from "./AdminPanel";

const CATEGORIAS = [
  { value: "", label: "Todas las categorías" },
  { value: "comida_corriente", label: "Comida corriente" },
  { value: "comida_rapida", label: "Comida rápida" },
  { value: "pizza", label: "Pizza" },
  { value: "vegetariano", label: "Vegetariano" },
];

// Coordenadas de referencia (CECAR, Sincelejo) usadas si el estudiante
// no autoriza el acceso a su ubicación real.
const UBICACION_POR_DEFECTO = { lat: 9.2903, lng: -75.4038 };

function App() {
  const [ubicacion, setUbicacion] = useState(null);
  const [permisoEstado, setPermisoEstado] = useState("pendiente"); // pendiente | concedido | denegado
  const [filtros, setFiltros] = useState({ category: "", maxPrice: "", minRating: "" });
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  // vista: "listado" | "detalle" | "registro" | "administrar" | "admin"
  const [vista, setVista] = useState("listado");
  const [idSeleccionado, setIdSeleccionado] = useState(null);

  // HU01 — Solicitar la ubicación del estudiante al cargar la aplicación.
  useEffect(() => {
    if (!navigator.geolocation) {
      setUbicacion(UBICACION_POR_DEFECTO);
      setPermisoEstado("denegado");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPermisoEstado("concedido");
      },
      () => {
        setUbicacion(UBICACION_POR_DEFECTO);
        setPermisoEstado("denegado");
      }
    );
  }, []);

  useEffect(() => {
    if (!ubicacion) return;

    setCargando(true);
    setError(null);
    fetchRestaurants({ ...filtros, lat: ubicacion.lat, lng: ubicacion.lng })
      .then((data) => setRestaurantes(data.results))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [ubicacion, filtros]);

  if (vista === "detalle" && idSeleccionado) {
    return (
      <div className="contenedor">
        <header>
          <h1>CercaBite</h1>
        </header>
        <RestaurantDetail
          id={idSeleccionado}
          onVolver={() => {
            setVista("listado");
            setIdSeleccionado(null);
          }}
        />
      </div>
    );
  }

  if (vista === "registro") {
    return (
      <div className="contenedor">
        <header>
          <h1>CercaBite</h1>
        </header>
        <RegisterRestaurantForm onVolver={() => setVista("listado")} />
      </div>
    );
  }

  if (vista === "administrar") {
    return (
      <div className="contenedor">
        <header>
          <h1>CercaBite</h1>
        </header>
        <ManageRestaurantPanel onVolver={() => setVista("listado")} />
      </div>
    );
  }

  if (vista === "admin") {
    return (
      <div className="contenedor">
        <header>
          <h1>CercaBite</h1>
        </header>
        <AdminPanel onVolver={() => setVista("listado")} />
      </div>
    );
  }

  return (
    <div className="contenedor">
      <header>
        <h1>CercaBite</h1>
        <p>Encuentra restaurantes cercanos a tu ubicación en Sincelejo.</p>
        {permisoEstado === "denegado" && (
          <p className="aviso">
            No se pudo acceder a tu ubicación; se está usando una ubicación de referencia (CECAR).
          </p>
        )}
        <div className="enlaces-propietario">
          <button className="enlace-registro" onClick={() => setVista("registro")}>
            ¿Tienes un restaurante? Regístralo aquí
          </button>
          <button className="enlace-registro" onClick={() => setVista("administrar")}>
            Administrar mi restaurante
          </button>
          <button className="enlace-registro enlace-admin" onClick={() => setVista("admin")}>
            Panel de administrador
          </button>
        </div>
      </header>

      <section className="filtros">
        <select
          value={filtros.category}
          onChange={(e) => setFiltros({ ...filtros, category: e.target.value })}
        >
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={filtros.maxPrice}
          onChange={(e) => setFiltros({ ...filtros, maxPrice: e.target.value })}
        >
          <option value="">Cualquier precio</option>
          <option value="1">$ (económico)</option>
          <option value="2">$$ (medio)</option>
          <option value="3">$$$ (alto)</option>
        </select>

        <select
          value={filtros.minRating}
          onChange={(e) => setFiltros({ ...filtros, minRating: e.target.value })}
        >
          <option value="">Cualquier calificación</option>
          <option value="4">4 ★ o más</option>
          <option value="4.5">4.5 ★ o más</option>
        </select>
      </section>

      {cargando && <p>Buscando restaurantes...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="lista-restaurantes">
        {restaurantes.map((r) => (
          <li
            key={r.id}
            className="tarjeta tarjeta-clicable"
            onClick={() => {
              setIdSeleccionado(r.id);
              setVista("detalle");
            }}
          >
            <h2>{r.name}</h2>
            <p>{r.address}</p>
            <p>
              {"$".repeat(r.priceLevel)} · ⭐ {r.rating} · {r.distanceKm} km
            </p>
            <p className="horario">{r.schedule}</p>
            <p className="ver-detalle">Ver detalle →</p>
          </li>
        ))}
      </ul>

      {!cargando && !error && restaurantes.length === 0 && (
        <p>No se encontraron restaurantes con esos filtros.</p>
      )}
    </div>
  );
}

export default App;
