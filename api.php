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
$db   = "barberia_db";
$port = 3306;

$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "error" => "Conexión fallida",
        "detalle" => $conn->connect_error,
        "ayuda" => "Verifica que Laragon esté encendido y el puerto sea 3307"
    ]);
    exit;
}
$conn->set_charset("utf8");

// 3. Captura de variables y validación
$metodo = $_SERVER['REQUEST_METHOD'];
$tabla = $_GET['tabla'] ?? 'clientes';
$id = $_GET['id'] ?? null;

$tablas_validas = [
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

function parseRequestData() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (is_array($data) && count($data) > 0) {
        return $data;
    }
    return $_POST ?: [];
}

function escapeValue($conn, $value) {
    if (is_null($value)) {
        return 'NULL';
    }
    return "'" . $conn->real_escape_string($value) . "'";
}

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