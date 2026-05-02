// --- LÓGICA PARA REGISTRO DE CLIENTES ---
// Buscamos el formulario por su ID
const formCliente = document.getElementById("formCliente");

// Verificamos que el formulario exista en la página actual
if (formCliente) {
  formCliente.addEventListener("submit", function (e) {
    e.preventDefault(); // Evitamos que la página se recargue

    // Capturamos los datos usando los IDs que definimos en el HTML de clientes
    const datos = {
      nombre: document.getElementById("nombre_cliente").value,
      telefono: document.getElementById("telefono_cliente").value,
      correo: document.getElementById("correo_cliente").value
    };

    // Enviamos los datos a la tabla 'clientes' usando tu función reutilizable
    enviarDatos(datos, "clientes", formCliente);
  });
}