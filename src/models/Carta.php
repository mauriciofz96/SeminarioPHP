<?php

namespace App\models;

require_once __DIR__ . '/../models/DB.php';

use PDO;
use App\models\DB;

class Carta{

    public static function buscarCartas(?string $atributo, ?string $nombre): array {
        try {
            $db = DB::getConnection();
    
            $sql = "SELECT c.id, c.nombre, c.ataque, c.ataque_nombre, a.nombre AS atributo
                    FROM carta c
                    JOIN atributo a ON c.atributo_id = a.id
                    WHERE 1=1";
    
            $params = [];
    
            if ($atributo !== null && $atributo !== '') {
                $sql .= " AND a.nombre LIKE :atributo";  // Cambié a 'a.nombre' en lugar de 'c.atributo_id'
                $params[':atributo'] = '%' . $atributo . '%';  // Esto permite buscar por nombre parcialmente también
            }
    
            if ($nombre !== null && $nombre !== '') {
                $sql .= " AND c.nombre LIKE :nombre";
                $params[':nombre'] = '%' . $nombre . '%';
            }
    
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
    
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        } catch (PDOException $e) {
            error_log("Error en buscarCartas: " . $e->getMessage());
            return [];
        }
    }
    
    
}