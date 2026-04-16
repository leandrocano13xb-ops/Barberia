<?php
header("Content-Type: application/json");

$host = "127.0.0.1";
$user = "root";
$pass = "Admin";
$db   = "barberia_db"; 
$port = 3306; 

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    echo json_encode(["error" => "Conexión fallida: " . $conn->connect_error]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// Obtenemos los parámetros de la URL
$tabla = $_GET['tabla'] ?? 'clientes';
$id = $_GET['id'] ?? null;

// Mapeo automático del nombre de la columna ID según la tabla
$id_columna = [
    "clientes" => "id_cliente",
    "barberos" => "id_barbero",
    "servicios" => "id_servicio",
    "citas" => "id_cita",
    "ventas" => "id_venta"
];

$col_id = $id_columna[$tabla] ?? "id";

switch($metodo) {
    case 'GET':
        $sql = "SELECT * FROM $tabla";
        if ($id) $sql .= " WHERE $col_id = $id";
        $result = $conn->query($sql);
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $columnas = implode(", ", array_keys($data));
        $valores = "'" . implode("', '", array_values($data)) . "'";
        
        $sql = "INSERT INTO $tabla ($columnas) VALUES ($valores)";
        if ($conn->query($sql)) {
            echo json_encode(["mensaje" => "Registro en '$tabla' creado con éxito"]);
        } else {
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if ($id && !empty($data)) {
            $sets = [];
            foreach ($data as $key => $value) { $sets[] = "$key = '$value'"; }
            $sql_parts = implode(", ", $sets);

            $conn->query("SET FOREIGN_KEY_CHECKS = 0"); // Evita el error de bloqueo
            $sql = "UPDATE $tabla SET $sql_parts WHERE $col_id = $id";
            $res = $conn->query($sql);
            $conn->query("SET FOREIGN_KEY_CHECKS = 1");

            echo $res ? json_encode(["mensaje" => "Actualizado con éxito"]) : json_encode(["error" => $conn->error]);
        }
        break;

    case 'DELETE':
        if ($id) {
            $conn->query("SET FOREIGN_KEY_CHECKS = 0"); // Permite borrar aunque tenga citas
            $sql = "DELETE FROM $tabla WHERE $col_id = $id";
            $res = $conn->query($sql);
            $conn->query("SET FOREIGN_KEY_CHECKS = 1");

            echo $res ? json_encode(["mensaje" => "Eliminado de '$tabla' con éxito"]) : json_encode(["error" => $conn->error]);
        } else {
            echo json_encode(["error" => "Falta el ID"]);
        }
        break;
}
$conn->close();
?>