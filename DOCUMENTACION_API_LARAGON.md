# Documentación de la API y la conexión con Laragon

## Resumen del problema

El proyecto usa `api.php` para conectar con MySQL en Laragon y recibir datos desde los formularios en `html/*.html`.

El error principal era:

- `Access denied for user 'root'@'localhost' (using password: YES)`

Esto sucedió porque `api.php` estaba configurado con la contraseña `Admin`, pero en Laragon la cuenta `root` normalmente no tiene contraseña.

## Cambios realizados

### 1. `api.php`

- Actualizado el bloque de conexión MySQL para usar:
  - host: `127.0.0.1`
  - usuario: `root`
  - contraseña: `""` (vacía)
  - base de datos: `barberia_db`
  - puerto: `3307`

- Se mejoró el manejo de peticiones:
  - CORS habilitado y respuesta para `OPTIONS`
  - Validación de tabla con lista blanca
  - Soporte para datos JSON y formularios `application/x-www-form-urlencoded`
  - Escape de valores para evitar errores con comillas u otros caracteres
  - Mensajes de error más claros

### 2. `js/app.js` y `js/script.js`

- Se adaptó la construcción de la URL de `api.php` para que funcione desde páginas dentro de `html/`.
- Ahora el enlace al API se calcula desde la ruta actual usando `new URL("../api.php", window.location.href)`.

## Cómo probar

1. Inicia Laragon.
2. Asegúrate de que el proyecto esté disponible en `http://localhost/Barberialeo/`.
3. Abre una página de formulario, por ejemplo:
   - `http://localhost/Barberialeo/html/barberos.html`
4. Envía un registro.
5. También puedes probar directamente la API en el navegador:
   - `http://localhost/Barberialeo/api.php?tabla=barberos`
   - `http://localhost/Barberialeo/api.php?tabla=clientes`

Si la conexión es correcta, `api.php` devolverá JSON válido (por ejemplo `[]` si no hay registros).

## Posibles ajustes adicionales

- Si tu base de datos no se llama `barberia_db`, cambia `$db` en `api.php`.
- Si Laragon usa otro puerto MySQL, cambia `$port` en `api.php`.
- Si no estás usando `localhost`, ajusta la URL en el navegador.

## Nota final

La solución ya fue verificada y la API responde correctamente al endpoint:

- `http://localhost/Barberialeo/api.php?tabla=barberos`

Si quieres, puedo agregar este resumen a un `README.md` en lugar de un archivo separado.