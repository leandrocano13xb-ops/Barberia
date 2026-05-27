<?php
// 1. Configuración de errores y cabeceras
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 2. Parámetros de conexión
$host = "127.0.0.1";
$user = "root";
$pass = "admin";
$db = "barberia_db";
$port = 3306;

$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "error" => "Conexión fallida",
        "detalle" => $conn->connect_error,
        "ayuda" => "Verifica que Laragon esté encendido y el puerto sea el correcto"
    ]);
    exit;
}
$conn->set_charset("utf8");

// Funciones de utilidad auxiliares
function parseRequestData()
{
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (is_array($data) && count($data) > 0) {
        return $data;
    }
    return $_POST ?: [];
}

function escapeValue($conn, $value)
{
    if (is_null($value)) {
        return 'NULL';
    }
    return "'" . $conn->real_escape_string($value) . "'";
}

// 3. Captura de variables y flujos de Autenticación
$metodo = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? null; // Captura si es login o registro personalizado

// ==========================================
// INTERCEPTOR PARA ACCIONES DE AUTENTICACIÓN
// ==========================================
if ($accion !== null) {
    if ($metodo !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Las operaciones de autenticación requieren método POST"]);
        $conn->close();
        exit;
    }

    $data = parseRequestData();

    // FLUJO 1: REGISTRO DE USUARIOS NUEVOS
    if ($accion === 'registro') {
        $username = $data['username'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $rol = $data['rol'] ?? 'cliente'; // Rol por defecto

        if (!$username || !$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Datos de registro incompletos. Se requiere: username, email y password."]);
            $conn->close();
            exit;
        }

        // Cifrado de contraseña por seguridad con algoritmo nativo de PHP
        $password_hash = password_hash($password, PASSWORD_BCRYPT);

        // Validar si el usuario o email ya existen
        $checkUser = $conn->query("SELECT id_usuario FROM usuarios WHERE username = '" . $conn->real_escape_string($username) . "' OR email = '" . $conn->real_escape_string($email) . "'");
        if ($checkUser && $checkUser->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["error" => "El nombre de usuario o el correo electrónico ya se encuentran registrados."]);
            $conn->close();
            exit;
        }

        // Inserción en tabla usuarios
        $sqlUser = "INSERT INTO usuarios (username, email, password_hash, rol) VALUES (
            '" . $conn->real_escape_string($username) . "', 
            '" . $conn->real_escape_string($email) . "', 
            '$password_hash', 
            '" . $conn->real_escape_string($rol) . "'
        )";

        if ($conn->query($sqlUser)) {
            $nuevo_id_usuario = $conn->insert_id;

            // Lógica Extra: Si el rol es cliente, creamos en paralelo su perfil en la tabla clientes
            if ($rol === 'cliente') {
                $nombre_real = $data['nombre'] ?? $username;
                $telefono = $data['telefono'] ?? '';
                $conn->query("INSERT INTO clientes (id_usuario, nombre, telefono, email) VALUES ($nuevo_id_usuario, '" . $conn->real_escape_string($nombre_real) . "', '" . $conn->real_escape_string($telefono) . "', '" . $conn->real_escape_string($email) . "')");
            }

            echo json_encode([
                "mensaje" => "Usuario registrado con éxito",
                "id_usuario" => $nuevo_id_usuario,
                "rol" => $rol
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al registrar el usuario", "detalle" => $conn->error]);
        }
        $conn->close();
        exit;
    }

    // FLUJO 2: INICIO DE SESIÓN (LOGIN)
    if ($accion === 'login') {
        $login_input = $data['login'] ?? null; // Puede ser el username o el email
        $password = $data['password'] ?? null;

        if (!$login_input || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Se requiere campo login (username/email) y password."]);
            $conn->close();
            exit;
        }

        $sql = "SELECT * FROM usuarios WHERE username = '" . $conn->real_escape_string($login_input) . "' OR email = '" . $conn->real_escape_string($login_input) . "'";
        $result = $conn->query($sql);

        if ($result && $result->num_rows === 1) {
            $user_row = $result->fetch_assoc();

            // Verificación matemática y segura de la contraseña hash
            if (password_verify($password, $user_row['password_hash'])) {
                // Removemos el hash por seguridad antes de responder al cliente JavaScript
                unset($user_row['password_hash']);

                echo json_encode([
                    "mensaje" => "Inicio de sesión correcto",
                    "usuario" => $user_row
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Contraseña incorrecta."]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["error" => "El usuario o correo electrónico no existe."]);
        }
        $conn->close();
        exit;
    }
}

// ==========================================
// CONTROLADOR GENÉRICO (CRUD DE TABLAS)
// ==========================================
$tabla = $_GET['tabla'] ?? 'clientes';
$id = $_GET['id'] ?? null;

$tablas_validas = [
    "usuarios" => "id_usuario",
    "clientes" => "id_cliente",
    "barberos" => "id_barbero",
    "servicios" => "id_servicio",
    "citas" => "id_cita",
    "ventas" => "id_venta"
];

if (!array_key_exists($tabla, $tablas_validas)) {
    http_response_code(400);
    echo json_encode(["error" => "Tabla inválida", "tabla" => $tabla]);
    $conn->close();
    exit;
}

$col_id = $tablas_validas[$tabla];

switch ($metodo) {
    case 'GET':
        $sql = "SELECT * FROM `$tabla`";
        if ($id !== null) {
            $sql .= " WHERE `$col_id` = '" . $conn->real_escape_string($id) . "'";
        }
        $result = $conn->query($sql);
        if ($result) {
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error, "sql" => $sql]);
        }
        break;

    case 'POST':
        $data = parseRequestData();
        if (empty($data)) {
            http_response_code(400);
            echo json_encode(["error" => "No hay datos para insertar", "ejemplo" => "{\"nombre\":\"Juan\",\"telefono\":\"123456789\"}"]);
            break;
        }
        $columnas = [];
        $valores = [];
        foreach ($data as $key => $value) {
            $columnas[] = "`" . $conn->real_escape_string($key) . "`";
            $valores[] = escapeValue($conn, $value);
        }
        $sql = "INSERT INTO `$tabla` (" . implode(", ", $columnas) . ") VALUES (" . implode(", ", $valores) . ")";

        $conn->query("SET FOREIGN_KEY_CHECKS = 0");
        if ($conn->query($sql)) {
            echo json_encode(["mensaje" => "Registro exitoso en $tabla", "nuevo_id" => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error de MySQL", "detalle" => $conn->error, "sql" => $sql]);
        }
        $conn->query("SET FOREIGN_KEY_CHECKS = 1");
        break;

    case 'PUT':
        if ($id === null) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el parámetro id en la URL"]);
            break;
        }
        $data = parseRequestData();
        if (empty($data)) {
            http_response_code(400);
            echo json_encode(["error" => "No hay datos para actualizar"]);
            break;
        }
        $sets = [];
        foreach ($data as $key => $value) {
            $sets[] = "`" . $conn->real_escape_string($key) . "` = " . escapeValue($conn, $value);
        }
        $sql = "UPDATE `$tabla` SET " . implode(", ", $sets) . " WHERE `$col_id` = '" . $conn->real_escape_string($id) . "'";

        $conn->query("SET FOREIGN_KEY_CHECKS = 0");
        if ($conn->query($sql)) {
            echo json_encode(["mensaje" => "Actualizado con éxito", "filas_afectadas" => $conn->affected_rows]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error de MySQL", "detalle" => $conn->error, "sql" => $sql]);
        }
        $conn->query("SET FOREIGN_KEY_CHECKS = 1");
        break;

    case 'DELETE':
        if ($id === null) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el parámetro id en la URL"]);
            break;
        }
        $sql = "DELETE FROM `$tabla` WHERE `$col_id` = '" . $conn->real_escape_string($id) . "'";
        $conn->query("SET FOREIGN_KEY_CHECKS = 0");
        if ($conn->query($sql)) {
            echo json_encode(["mensaje" => "Eliminado con éxito", "filas_afectadas" => $conn->affected_rows]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error de MySQL", "detalle" => $conn->error, "sql" => $sql]);
        }
        $conn->query("SET FOREIGN_KEY_CHECKS = 1");
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no soportado", "metodo" => $metodo]);
        break;
}

$conn->close();