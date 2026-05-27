/**
 * ARCHIVO: script.js - Rama: Caballero
 * DESCRIPCIÓN: Manejo de renderizado de datos (GET), inyección de componentes globales (menu.html)
 * e interactividad visual de las interfaces de usuario.
 */

document.addEventListener("DOMContentLoaded", () => {
  cargarMenuGlobal();
  inicializarVistas();
});

/**
 * 1. INYECTOR DEL MENÚ GLOBAL (menu.html)
 * Carga el menú asíncronamente en cualquier contenedor con id "sidebar" o "menu-container"
 */
async function cargarMenuGlobal() {
  const contenedorMenu = document.getElementById("menu-container");
  if (!contenedorMenu) return;

  try {
    // Buscamos menu.html asumiendo que estamos dentro de la carpeta /html/
    // Si se abre desde la raíz, ajusta la ruta relativa correspondientemente.
    const rutaMenu = window.location.pathname.includes('/html/') ? "../menu.html" : "menu.html";
    const respuesta = await fetch(rutaMenu);

    if (respuesta.ok) {
      contenedorMenu.innerHTML = await respuesta.text();
      marcarEnlaceActivo();
    }
  } catch (error) {
    console.error("Error al inyectar el menú global:", error);
  }
}

/**
 * Resalta visualmente en el menú la página en la que se encuentra el usuario actualmente
 */
function marcarEnlaceActivo() {
  const paginaActual = window.location.pathname.split("/").pop();
  const enlaces = document.querySelectorAll("#menu-container a");
  enlaces.forEach(enlace => {
    if (enlace.getAttribute("href") === paginaActual || enlace.getAttribute("href").includes(paginaActual)) {
      enlace.classList.add("activo");
    }
  });
}

/**
 * 2. ENRUTADOR DE RENDERIZACIÓN
 * Detecta en qué archivo HTML está el usuario y dispara la carga de datos correspondiente
 */
function inicializarVistas() {
  const pathname = window.location.pathname;

  if (pathname.includes("barberos.html")) {
    listarDatos("barberos", renderizarBarberos);
  } else if (pathname.includes("clientes.html")) {
    listarDatos("clientes", renderizarClientes);
  } else if (pathname.includes("servicios.html")) {
    listarDatos("servicios", renderizarServicios);
  } else if (pathname.includes("citas.html")) {
    listarDatos("citas", renderizarCitas);
  }
}

/**
 * 3. FUNCIÓN GENÉRICA DE PETICIÓN GET
 * Consume la API de Laragon de forma segura y pasa el array a una función callback de renderizado
 */
async function listarDatos(tabla, callbackRender) {
  try {
    const apiUrl = new URL("../api.php", window.location.href);
    const respuesta = await fetch(`${apiUrl.href}?tabla=${tabla}`);
    const datos = await respuesta.json();

    if (Array.isArray(datos)) {
      callbackRender(datos);
    } else {
      console.error(`Error en formato de datos de la tabla [${tabla}]:`, datos);
    }
  } catch (error) {
    console.error(`Error de red al listar la tabla [${tabla}]:`, error);
  }
}

// =========================================================
// 4. FUNCIONES DE RENDERIZADO (INYECTORES DE TABLAS HTML)
// =========================================================

function renderizarBarberos(barberos) {
  const tabla = document.getElementById("tablaBarberos");
  if (!tabla) return;
  tabla.innerHTML = ""; // Limpiar esqueleto base

  barberos.forEach(barbero => {
    tabla.innerHTML += `
            <tr>
                <td>${barbero.id_barbero}</td>
                <td><strong>${barbero.nombre}</strong></td>
                <td><span class="badge-especialidad">${barbero.especialidad}</span></td>
                <td>${barbero.telefono}</td>
            </tr>
        `;
  });
}

function renderizarClientes(clientes) {
  const tabla = document.getElementById("tablaClientes");
  if (!tabla) return;
  tabla.innerHTML = "";

  clientes.forEach(cliente => {
    tabla.innerHTML += `
            <tr>
                <td>${cliente.id_cliente}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.email}</td>
            </tr>
        `;
  });
}

function renderizarServicios(servicios) {
  const tabla = document.getElementById("tablaServicios");
  if (!tabla) return;
  tabla.innerHTML = "";

  servicios.forEach(servicio => {
    tabla.innerHTML += `
            <tr>
                <td>${servicio.id_servicio}</td>
                <td>${servicio.nombre_servicio}</td>
                <td>$${parseFloat(servicio.precio).toLocaleString()}</td>
            </tr>
        `;
  });
}

function renderizarCitas(citas) {
  const tabla = document.getElementById("tablaCitas");
  if (!tabla) return;
  tabla.innerHTML = "";

  citas.forEach(cita => {
    // Mapeo dinámico de estados para estilos CSS personalizados
    let claseEstado = "status-pendiente";
    if (cita.estado === "completada") claseEstado = "status-completada";
    if (cita.estado === "cancelada") claseEstado = "status-cancelada";

    tabla.innerHTML += `
            <tr>
                <td>${cita.id_cita}</td>
                <td>${cita.id_cliente}</td> <td>${cita.fecha_cita}</td>
                <td>${cita.hora_cita}</td>
                <td><span class="badge-status ${claseEstado}">${cita.estado.toUpperCase()}</span></td>
            </tr>
        `;
  });
}