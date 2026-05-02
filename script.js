// Función para registrar un barbero desde el Frontend
async function guardarBarbero() {
    const datos = {
        nombre: document.getElementById('nombre').value,
        especialidad: document.getElementById('especialidad').value,
        telefono: document.getElementById('telefono').value
    };

    try {
        // NOTA: La ruta ahora incluye /config/ porque moviste el archivo
        const respuesta = await fetch('config/api.php?tabla=barberos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        alert(resultado.mensaje || resultado.error);
        
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}