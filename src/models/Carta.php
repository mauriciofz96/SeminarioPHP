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
                $sql .= " AND a.nombre LIKE :atributo";  
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

    public static function obtenerCartasEnManoPorUsuarioYPartida($usuarioId, $partidaId) {
        try {
            $db = DB::getConnection();
    
            // 1. Buscar el mazo_id de esa partida y usuario
            $stmt = $db->prepare("SELECT mazo_id FROM partida WHERE id = :partidaId AND usuario_id = :usuarioId");
            $stmt->execute([
                ':partidaId' => $partidaId,
                ':usuarioId' => $usuarioId
            ]);
    
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$result) {
                return []; // No se encontró la partida para ese usuario
            }
    
            $mazoId = $result['mazo_id'];
    
            // 2. Buscar cartas en mano de ese mazo
            $stmt = $db->prepare("
                SELECT c.id, c.nombre, c.ataque, c.ataque_nombre, a.nombre AS atributo
                FROM mazo_carta mc
                JOIN carta c ON mc.carta_id = c.id
                JOIN atributo a ON c.atributo_id = a.id
                WHERE mc.mazo_id = :mazoId
                  AND mc.estado = 'en_mano'
            ");
    
            $stmt->execute([':mazoId' => $mazoId]);
    
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        } catch (PDOException $e) {
            error_log("Error en obtenerCartasEnManoPorUsuarioYPartida: " . $e->getMessage());
            return [];
        }
    }
    
    
    
    
}