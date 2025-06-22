<?php

namespace App\models;

require_once __DIR__ . '/../models/DB.php';

use PDO;
use App\models\DB;

class Mazo {

    
    public static function contarMazosPorUsuario($usuario_id) {
        try {
            $db = DB::getConnection();
            $query = "SELECT COUNT(*) FROM mazo WHERE usuario_id = :usuario_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchColumn(); 
        } catch (\PDOException $e) {
            error_log("Error en contarMazosPorUsuario: " . $e->getMessage());
            return false;
        }
    }

    
    public static function verificarCartasExistentes(array $ids_cartas) {
        try {
            $db = DB::getConnection();

            
            $placeholders = implode(',', array_fill(0, count($ids_cartas), '?')); 
            $query = "SELECT id FROM carta WHERE id IN ($placeholders)"; 
            $stmt = $db->prepare($query);
            $stmt->execute($ids_cartas); 

            
            $cartas_encontradas = $stmt->fetchAll(PDO::FETCH_COLUMN);

            
            return count($cartas_encontradas) === count($ids_cartas);
            
        } catch (\PDOException $e) {
            error_log("Error en verificarCartasExistentes: " . $e->getMessage());
            return false;
        }
    }

    
    public static function crearMazo($usuario_id, $nombre, array $ids_cartas) {
        try {
            $db = DB::getConnection();

            $db->beginTransaction();

            
            $stmt = $db->prepare("INSERT INTO mazo (usuario_id, nombre) VALUES (:usuario_id, :nombre)");
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->bindParam(":nombre", $nombre);
            $stmt->execute();

            
            $mazo_id = $db->lastInsertId();

            
            $stmtCarta = $db->prepare("INSERT INTO mazo_carta (mazo_id, carta_id, estado) VALUES (:mazo_id, :carta_id, 'en_mazo')");
            foreach ($ids_cartas as $carta_id) {
                $stmtCarta->execute([
                    ':mazo_id' => $mazo_id,
                    ':carta_id' => $carta_id
                ]);
            }

            
            $db->commit();

            return [
                'mazo_id' => $mazo_id,
                'nombre' => $nombre
            ];
        } catch (\PDOException $e) {
            
            if (isset($db)) {
                $db->rollBack();
            }
            error_log("Error en crearMazo: " . $e->getMessage());
            return false;
        }
    }


    
    public static function borrarMazo($mazo_id, $usuario_id) {
        try {
            $db = DB::getConnection();
            $db->beginTransaction();

            
            $stmt = $db->prepare("SELECT COUNT(*) FROM mazo WHERE id = :mazo_id AND usuario_id = :usuario_id");
            $stmt->execute([
                ':mazo_id' => $mazo_id,
                ':usuario_id' => $usuario_id
            ]);
            if ($stmt->fetchColumn() == 0) {
                
                $db->rollBack();
                return ['error' => 'no_encontrado'];
            }

            $stmt = $db->prepare("SELECT COUNT(*) FROM partida WHERE mazo_id = :mazo_id");
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
            $stmt->execute();
            $participaciones = $stmt->fetchColumn();

            if ($participaciones > 0) {
                $db->rollBack();
                return ['error' => 'conflicto'];
            }

            
            $stmt = $db->prepare("DELETE FROM mazo_carta WHERE mazo_id = :mazo_id");
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
            $stmt->execute();

            
            $stmt = $db->prepare("DELETE FROM mazo WHERE id = :mazo_id");
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
            $stmt->execute();

            $db->commit();
            return ['ok' => true];
        } catch (\PDOException $e) {
            if (isset($db)) {
                $db->rollBack();
            }
            error_log("Error en borrarMazo: " . $e->getMessage());
            return ['error' => 'error_interno'];
        }
    }

    
    public static function obtenerMazosPorUsuario($usuario_id) {
        try {
            $db = DB::getConnection();
            $query = "SELECT id, nombre FROM mazo WHERE usuario_id = :usuario_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC); 
        } catch (\PDOException $e) {
            error_log("Error en obtenerMazos: " . $e->getMessage());
            return false;
        }
    }

   
    public static function cambiarNombreMazo($mazo_id, $nuevo_nombre, $usuario_id) {
        try {
            $db = DB::getConnection();
    
            $query = "SELECT COUNT(*) FROM mazo WHERE id = :mazo_id AND usuario_id = :usuario_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
    
            if ($stmt->fetchColumn() == 0) {
                return 'unauthorized'; 
            }
    
            $query = "UPDATE mazo SET nombre = :nuevo_nombre WHERE id = :mazo_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":nuevo_nombre", $nuevo_nombre);
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
    
            return $stmt->execute();
    
        } catch (\PDOException $e) {
            error_log("Error en cambiarNombreMazo: " . $e->getMessage());
            return false;
        }
    }

    
    public static function actualizarEstadoCartas($mazo_id){
        try {
            $db= DB::getConnection();
            $estado = 'en_mano';
            $stmt=$db->prepare("UPDATE mazo_carta SET estado = :estado WHERE mazo_id = :mazo_id");
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
            $stmt->bindParam(":estado", $estado);
            $stmt->execute();

            return true;

        }catch (\PDOException $e){
            error_log( "Error en la actualizacion de estado de las cartas: " . $e->getMessage());
            return false;
        }

    }

    
    public static function obtenerCartasPorMazo($mazo_id){
        try {
            $db = DB::getConnection();

            $stmt = $db->prepare("SELECT carta_id FROM mazo_carta WHERE mazo_id = :mazo_id");
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
            $stmt->execute();
            $ids_cartas = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            return $ids_cartas;
        } catch(\PDOException $e) {
             return false;
        }
    }
    
    public static function obtenerCartasConDatos($mazoId) {
    $cartas = self::obtenerCartasPorMazo($mazoId);
    if ($cartas === false) return false;
    $cartasConDatos = [];
    foreach($cartas as $cartaId){
        $datosCarta = Carta::obtenerDatosParaMostrar($cartaId);
        if ($datosCarta === false) return false;
        $datosCarta['id'] = $cartaId;
        $cartasConDatos[$cartaId] = $datosCarta;
    }
    return $cartasConDatos;
}

}
