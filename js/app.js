/**
 * ARCHIVO: app.js - Rama: Caballero 
 * DESCRIPCIÓN:
 * Este archivo contiene la lógica para manejar los formularios de la aplicación de barbería.
 * Se encarga de capturar los datos ingresados por el usuario, enviarlos al servidor a través de fetch,
 */

// --- 1. BARBEROS ---
const formBarbero = document.getElementById("formBarbero");
if (formBarbero) {
  formBarbero.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      nombre: document.getElementById("nombre").value,
      especialidad: document.getElementById("especialidad").value,
      telefono: document.getElementById("telefono").value,
    };
    enviarDatos(datos, "barberos", formBarbero);
  });
}

// --- 2. CLIENTES (Ajustado email según imagen.png) ---
const formCliente = document.getElementById("formCliente");
if (formCliente) {
  formCliente.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      nombre: document.getElementById("nombre_cliente").value,
      telefono: document.getElementById("telefono_cliente").value,
      email: document.getElementById("email_cliente").value, // Se cambió 'correo' por 'email'
    };
    enviarDatos(datos, "clientes", formCliente);
  });
}

// --- 3. SERVICIOS (Ajustado nombre_servicio según imagen.png) ---
const formServicio = document.getElementById("formServicio");
if (formServicio) {
  formServicio.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      nombre_servicio: document.getElementById("nombre_servicio").value, // Ajustado
      precio: document.getElementById("precio_servicio").value,
    };
    enviarDatos(datos, "servicios", formServicio);
  });
}

// --- 4. CITAS (Ajustado fecha_cita y hora_cita según imagen.png) ---
const formCita = document.getElementById("formCita");
if (formCita) {
  formCita.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      id_cliente: document.getElementById("id_cliente").value,
      id_barbero: document.getElementById("id_barbero").value,
      id_servicio: document.getElementById("id_servicio").value,
      fecha_cita: document.getElementById("fecha").value,
      hora_cita: document.getElementById("hora").value,
    };
    enviarDatos(datos, "citas", formCita);
  });
}

// Carga los clientes registrados para el selector de citas
function cargarClientes() {
  const selectCliente = document.getElementById("id_cliente");
  if (!selectCliente) {
    return;
  }

  const apiUrl = new URL("../api.php", window.location.href);
  fetch(`${apiUrl.href}?tabla=clientes`)
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada al cargar clientes", data);
        return;
      }
      data.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.id_cliente;
        option.textContent = `${cliente.nombre} - ${cliente.telefono} - ${cliente.email}`;
        selectCliente.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error cargando clientes:", error);
    });
}

// Carga los barberos registrados para el selector de citas
function cargarBarberos() {
  const selectBarbero = document.getElementById("id_barbero");
  if (!selectBarbero) {
    return;
  }

  const apiUrl = new URL("../api.php", window.location.href);
  fetch(`${apiUrl.href}?tabla=barberos`)
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada al cargar barberos", data);
        return;
      }
      data.forEach((barbero) => {
        const option = document.createElement("option");
        option.value = barbero.id_barbero;
        option.textContent = `${barbero.nombre} - ${barbero.telefono} - ${barbero.especialidad}`;
        selectBarbero.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error cargando barberos:", error);
    });
}

function cargarServicios() {
  const selectServicio = document.getElementById("id_servicio");
  if (!selectServicio) {
    return;
  }

  const apiUrl = new URL("../api.php", window.location.href);
  fetch(`${apiUrl.href}?tabla=servicios`)
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada al cargar servicios", data);
        return;
      }
      data.forEach((servicio) => {
        const option = document.createElement("option");
        option.value = servicio.id_servicio;
        option.textContent = `${servicio.nombre_servicio} - ${servicio.precio}`;
        selectServicio.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error cargando servicios:", error);
    });
}

cargarClientes();
cargarBarberos();
cargarServicios();

// --- 5. VENTAS (Ajustado total y fecha_pago según imagen.png) ---
const formVenta = document.getElementById("formVenta");
if (formVenta) {
  formVenta.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      id_cita: document.getElementById("id_cita_venta").value, // Relación directa con citas
      metodo_pago: document.getElementById("metodo_pago").value,
      total: document.getElementById("monto_venta").value, // Se cambió 'monto' por 'total'
      fecha_pago: new Date().toISOString().split('T')[0] // Genera YYYY-MM-DD automáticamente
    };
    enviarDatos(datos, "ventas", formVenta);
  });
}

/**
 * FUNCIÓN REUTILIZABLE
 */
function enviarDatos(objetoDatos, tabla, formulario) {
  const apiUrl = new URL("../api.php", window.location.href);
  console.log("Enviando datos a API:", apiUrl.href, objetoDatos);

  fetch(`${apiUrl.href}?tabla=${tabla}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(objetoDatos),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.mensaje) {
        alert("✅ " + data.mensaje);
        formulario.reset();
      } else {
        alert("❌ Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error de conexión con el servidor Laragon.");
    });
}