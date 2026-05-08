/**
 * ARCHIVO: app.js - Rama: Caballero
 * DESCRIPCIÓN: Implementación de fetch con async/await y rutas relativas.
 */
const formBarbero = document.getElementById("formBarbero");
if (formBarbero) {
  formBarbero.addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = {
      nombre: document.getElementById("nombre").value,
      especialidad: document.getElementById("especialidad").value,
      telefono: document.getElementById("telefono").value,
    };
    // Llamamos a la función genérica
    await enviarDatos(datos, "barberos", formBarbero);
  });
}
// --- FUNCIÓN GENÉRICA CON ASYNC/AWAIT ---
async function enviarDatos(objetoDatos, tabla, formulario) {
  try {
    const apiUrl = new URL("../api.php", window.location.href);
    console.log("Enviando datos a API:", apiUrl.href, objetoDatos);

    const respuesta = await fetch(`${apiUrl.href}?tabla=${tabla}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objetoDatos),
    });
    const resultado = await respuesta.json();
    if (resultado.mensaje) {
      alert("✅ " + resultado.mensaje);
      formulario.reset();
    } else {
      alert("❌ Error: " + resultado.error);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con el servidor Laragon.");
  }
}