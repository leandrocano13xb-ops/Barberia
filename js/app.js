/**
 * ARCHIVO: app.js - Rama: Caballero (Evolucionado con Login/Registro)
 * DESCRIPCIÓN:
 * Manejo de formularios de la aplicación de barbería. Captura datos,
 * gestiona selectores dinámicos y procesa la autenticación con api.php.
 */

// --- 0. AUTENTICACIÓN (NUEVO: Login y Registro) ---

// Manejo del formulario de Login
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const loginInput = document.getElementById("login_input").value; // Puede ser username o email
    const passwordInput = document.getElementById("password_input").value;

    const apiUrl = new URL("../api.php", window.location.href);

    fetch(`${apiUrl.href}?accion=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: loginInput, password: passwordInput })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mensaje) {
          alert("✅ " + data.mensaje);
          // Guardamos los datos del usuario en el navegador por si los necesitan en otras vistas
          localStorage.setItem("usuario_sesion", JSON.stringify(data.usuario));
          // Redireccionar al menú o citas tras el éxito
          window.location.href = "citas.html";
        } else {
          alert("❌ Error: " + data.error);
        }
      })
      .catch((err) => {
        console.error("Error en login:", err);
        alert("Error de conexión al intentar iniciar sesión.");
      });
  });
}

// Manejo del formulario de Registro
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      username: document.getElementById("reg_username").value,
      email: document.getElementById("reg_email").value,
      password: document.getElementById("reg_password").value,
      nombre: document.getElementById("reg_nombre").value,
      telefono: document.getElementById("reg_telefono").value,
      rol: document.getElementById("reg_rol") ? document.getElementById("reg_rol").value : "cliente"
    };

    const apiUrl = new URL("../api.php", window.location.href);

    fetch(`${apiUrl.href}?accion=registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mensaje) {
          alert("✅ " + data.mensaje);
          formRegistro.reset();
          // Opcional: Redirigir al usuario para que inicie sesión
        } else {
          alert("❌ Error: " + data.error);
        }
      })
      .catch((err) => {
        console.error("Error en registro:", err);
        alert("Error de conexión al intentar registrar el usuario.");
      });
  });
}


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
      email: document.getElementById("email_cliente").value,
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
      nombre_servicio: document.getElementById("nombre_servicio").value,
      precio: document.getElementById("precio_servicio").value,
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
      id_servicio: document.getElementById("id_servicio").value,
      fecha_cita: document.getElementById("fecha").value,
      hora_cita: document.getElementById("hora").value,
      estado: document.getElementById("estado").value,
    };
    enviarDatos(datos, "citas", formCita);
  });
}

// Carga los clientes registrados para el selector de citas
function cargarClientes() {
  const selectCliente = document.getElementById("id_cliente");
  if (!selectCliente) return;

  const apiUrl = new URL("../api.php", window.location.href);
  fetch(`${apiUrl.href}?tabla=clientes`)
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada al cargar clientes", data);
        return;
      }
      selectCliente.innerHTML = '<option value="" disabled selected>Seleccione un cliente</option>';
      data.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.id_cliente;
        option.textContent = `${cliente.nombre} - ${cliente.telefono || ''} - ${cliente.email || ''}`;
        selectCliente.appendChild(option);
      });
    })
    .catch((error) => console.error("Error cargando clientes:", error));
}

// Carga los barberos registrados para el selector de citas
function cargarBarberos() {
  const selectBarbero = document.getElementById("id_barbero");
  if (!selectBarbero) return;

  const apiUrl = new URL("../api.php", window.location.href);
  fetch(`${apiUrl.href}?tabla=barberos`)
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada al cargar barberos", data);
        return;
      }
      selectBarbero.innerHTML = '<option value="" disabled selected>Seleccione un barbero</option>';
      data.forEach((barbero) => {
        const option = document.createElement("option");
        option.value = barbero.id_barbero;
        option.textContent = `${barbero.nombre} - ${barbero.especialidad}`;
        selectBarbero.appendChild(option);
      });
    })
    .catch((error) => console.error("Error cargando barberos:", error));
}

function cargarServicios() {
  const selectServicio = document.getElementById("id_servicio");
  if (!selectServicio) return;

  const apiUrl = new URL("../api.php", window.location.href);
  fetch(`${apiUrl.href}?tabla=servicios`)
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada al cargar servicios", data);
        return;
      }
      selectServicio.innerHTML = '<option value="" disabled selected>Seleccione un servicio</option>';
      data.forEach((servicio) => {
        const option = document.createElement("option");
        option.value = servicio.id_servicio;
        option.textContent = `${servicio.nombre_servicio} - $${servicio.precio}`;
        selectServicio.appendChild(option);
      });
    })
    .catch((error) => console.error("Error cargando servicios:", error));
}

// Carga las citas registradas para el selector de ventas
function cargarCitas() {
  const selectCita = document.getElementById("id_cita_venta");
  if (!selectCita) return;

  const apiUrl = new URL("../api.php", window.location.href);
  fetch(`${apiUrl.href}?tabla=citas`)
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada al cargar citas", data);
        return;
      }
      selectCita.innerHTML = '<option value="" disabled selected>Seleccione una cita</option>';
      data.forEach((cita) => {
        const option = document.createElement("option");
        option.value = cita.id_cita;
        option.textContent = `Cita #${cita.id_cita} - ${cita.fecha_cita} ${cita.hora_cita || ''} (${cita.estado || 'pendiente'})`;
        selectCita.appendChild(option);
      });
    })
    .catch((error) => console.error("Error cargando citas:", error));
}

// Invocar cargas dinámicas de selectores
cargarClientes();
cargarBarberos();
cargarServicios();
cargarCitas();

// --- 5. VENTAS ---
const formVenta = document.getElementById("formVenta");
if (formVenta) {
  formVenta.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      id_cita: document.getElementById("id_cita_venta").value,
      metodo_pago: document.getElementById("metodo_pago").value,
      total: document.getElementById("monto_venta").value,
      fecha_pago: new Date().toISOString().split('T')[0]
    };
    enviarDatos(datos, "ventas", formVenta);
  });
}

/**
 * FUNCIÓN REUTILIZABLE CRUD POST
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