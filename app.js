/**
 * ARCHIVO: app.js - Rama: leandro
 * DESCRIPCIÓN: Lógica centralizada con módulo de Ventas incorporado.
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

// --- 2. CLIENTES ---
const formCliente = document.getElementById("formCliente");
if (formCliente) {
  formCliente.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      nombre: document.getElementById("nombre_cliente").value,
      telefono: document.getElementById("telefono_cliente").value,
      correo: document.getElementById("correo_cliente").value,
    };
    enviarDatos(datos, "clientes", formCliente);
  });
}

// --- 3. SERVICIOS ---
const formServicio = document.getElementById("formServicio");
if (formServicio) {
  formServicio.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      nombre: document.getElementById("nombre_servicio").value,
      precio: document.getElementById("precio_servicio").value,
      duracion: document.getElementById("duracion_servicio").value,
    };
    enviarDatos(datos, "servicios", formServicio);
  });
}

// --- 4. CITAS ---
const formCita = document.getElementById("formCita");
if (formCita) {
  formCita.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      id_cliente: document.getElementById("id_cliente").value,
      id_barbero: document.getElementById("id_barbero").value,
      fecha: document.getElementById("fecha").value,
      hora: document.getElementById("hora").value,
    };
    enviarDatos(datos, "citas", formCita);
  });
}

// --- 5. VENTAS (NUEVO MÓDULO) ---
const formVenta = document.getElementById("formVenta");
if (formVenta) {
  formVenta.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      id_cliente: document.getElementById("id_cliente_venta").value,
      id_servicio: document.getElementById("id_servicio_venta").value,
      monto: document.getElementById("monto_venta").value,
      metodo_pago: document.getElementById("metodo_pago").value,
    };
    enviarDatos(datos, "ventas", formVenta);
  });
}

// FUNCIÓN REUTILIZABLE
function enviarDatos(objetoDatos, tabla, formulario) {
  fetch(`api.php?tabla=${tabla}`, {
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
      alert("Error de conexión con el servidor.");
    });
}
