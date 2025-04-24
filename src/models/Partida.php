<?php
namespace App\models;

use PDO;

class Partida {
    public static function jugadaServidor(): int {
        try {
            $db = DB::getConnection();

            // Consulta para obtener una carta válida del mazo del servidor
            $query = "
                SELECT c.id 
                FROM carta c
                INNER JOIN mazo_carta mc ON c.id = mc.carta_id
                INNER JOIN mazo m ON mc.mazo_id = m.id
                WHERE m.propietario = 'servidor' 
                AND c.id NOT IN (
                    SELECT carta_id 
                    FROM jugada 
                    WHERE partida_id = :partida_id
                )
                LIMIT 1
            ";

            $stmt = $db->prepare($query);

            // Suponiendo que el ID de la partida está disponible en el contexto
            $partidaId = self::getPartidaActual(); 
            $stmt->bindParam(':partida_id', $partidaId, PDO::PARAM_INT);

            $stmt->execute();
            $carta = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($carta) {
                $cartaId = (int) $carta['id'];

                // Actualizar el estado de la carta a "descartado" en la tabla mazo_carta
                $updateQuery = "
                    UPDATE mazo_carta 
                    SET estado = 'descartado' 
                    WHERE carta_id = :carta_id
                ";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->bindParam(':carta_id', $cartaId, PDO::PARAM_INT);
                $updateStmt->execute();

                return $cartaId;
            } else {
                throw new \Exception("No hay cartas válidas disponibles para jugar.");
            }
        } catch (\PDOException $e) {
            error_log("Error en jugadaServidor: " . $e->getMessage());
            throw new \Exception("Error al obtener la jugada del servidor.");
        }
    }


    private static function getPartidaActual(): int {
        // Obtener el ID de la partida desde los parámetros de la solicitud
        if (isset($_GET['partida_id'])) {
            return (int) $_GET['partida_id'];
        }
    
        throw new \Exception("No se proporcionó el ID de la partida.");
    }
}