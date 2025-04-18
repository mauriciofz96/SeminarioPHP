<?php

namespace App\models;

require_once __DIR__ . '/../models/DB.php';

use PDO;
use App\models\DB;

class Estadistica {
    public static function obtenerEstadisticas() {
        try {
            $db = DB::getConnection();
    
            $query = "
            SELECT u.usuario AS usuario,
                SUM(CASE WHEN p.el_usuario = 'gano' THEN 1 ELSE 0 END) AS ganadas,
                SUM(CASE WHEN p.el_usuario = 'empato' THEN 1 ELSE 0 END) AS empatadas,
                SUM(CASE WHEN p.el_usuario = 'perdio' THEN 1 ELSE 0 END) AS perdidas
            FROM partida p
            JOIN usuario u ON p.usuario_id = u.id
            GROUP BY u.id
            ";

    
            $stmt = $db->prepare($query);
            $stmt->execute();
    
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            if (!$resultados || count($resultados) === 0) {
                // No se encontraron estadísticas
                return ['status' => 404, 'data' => ['error' => 'No se encontraron estadísticas']];
            }
    
            return ['status' => 200, 'data' => $resultados];
    
        } catch (PDOException $e) {
            // Lanza solo excepciones relacionadas con la base de datos
            throw new \Exception("Error en la consulta: " . $e->getMessage());
        }
    }
    
}