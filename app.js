// --- LÓGICA PARA REGISTRO DE BARBEROS ---
const formBarbero = document.getElementById("formBarbero");
if (formBarbero) {
  formBarbero.addEventListener("submit", function (e) {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById("nombre").value,
      especialidad: document.getElementById("especialidad").value,
      telefono: document.getElementById("telefono").value,
    };

    enviarDatos(datos, "barberos", formBarbero);
  });
}

// --- LÓGICA PARA REGISTRO DE CLIENTES ---
const formCliente = document.getElementById("formCliente");
if (formCliente) {
  formCliente.addEventListener("submit", function (e) {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById("nombre_cliente").value,
      telefono: document.getElementById("telefono_cliente").value,
      correo: document.getElementById("correo_cliente").value, // Asegúrate que coincida con tu DB
    };

    enviarDatos(datos, "clientes", formCliente);
  });
}

/**
 * Función reutilizable para enviar datos a la API
 * Esto cumple con el requerimiento de "Componentes reutilizables"
 */
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
      alert("No se pudo conectar con el servidor.");
    });
}
