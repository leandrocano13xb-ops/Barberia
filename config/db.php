<?php
require_once 'config/db.php';
header("Content-Type: application/json");

$metodo = $_SERVER['REQUEST_METHOD'];
$tabla = $_GET['tabla'] ?? 'clientes';
$id = isset($_GET['id']) ? intval($_GET['id']) : null; // Seguridad: Forzar entero

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
        if (!$data) { echo json_encode(["error" => "No hay datos"]); break; }
        
        $columnas = implode(", ", array_keys($data));
        // Escapar valores para evitar errores con comillas
        $valores = "'" . implode("', '", array_map([$conn, 'real_escape_string'], array_values($data))) . "'";
        
        $sql = "INSERT INTO $tabla ($columnas) VALUES ($valores)";
        echo $conn->query($sql) ? json_encode(["mensaje" => "Creado en $tabla"]) : json_encode(["error" => $conn->error]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if ($id && !empty($data)) {
            $sets = [];
            foreach ($data as $key => $value) { 
                $val = $conn->real_escape_string($value);
                $sets[] = "$key = '$val'"; 
            }
            $sql_parts = implode(", ", $sets);
            $conn->query("SET FOREIGN_KEY_CHECKS = 0");
            $sql = "UPDATE $tabla SET $sql_parts WHERE $col_id = $id";
            $res = $conn->query($sql);
            $conn->query("SET FOREIGN_KEY_CHECKS = 1");
            echo $res ? json_encode(["mensaje" => "Actualizado"]) : json_encode(["error" => $conn->error]);
        }
        break;

    case 'DELETE':
        if ($id) {
            $conn->query("SET FOREIGN_KEY_CHECKS = 0"); 
            $sql = "DELETE FROM $tabla WHERE $col_id = $id";
            $res = $conn->query($sql);
            $conn->query("SET FOREIGN_KEY_CHECKS = 1");
            echo $res ? json_encode(["mensaje" => "Eliminado"]) : json_encode(["error" => $conn->error]);
        }
        break;
}
$conn->close();
?>