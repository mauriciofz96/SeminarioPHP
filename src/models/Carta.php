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

    //Obtengo los datos de una carta (se debe validar que esté en el mazo)
    public static function obtenerDatos($carta_id,$mazo_id){
        try{
            $db=DB::getConnection();
            $query="SELECT id, ataque, atributo_id FROM carta WHERE id = :carta_id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(":carta_id",$carta_id);
            $stmt->execute();
            $resultado=$stmt->fetch(PDO::FETCH_ASSOC);

            if(!$resultado){
                error_log('Error en la obtencion de la carta');
                return false;
            }
            
            //obtengo el estado de la carta
            $query="SELECT estado FROM mazo_carta WHERE mazo_id = :mazo_id AND carta_id = :carta_id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(":carta_id",$carta_id);
            $stmt->bindParam(":mazo_id",$mazo_id);  
            $stmt->execute();
            $estado=$stmt->fetchColumn();
            if(!$estado){
                error_log('Error en la obtencion del estado de la carta');
                return false;
            }
            //agrego el estado al resultado
            $resultado['estado']=$estado;
            return $resultado;
            

        }catch(PDOException $e){
            error_log('Error en obtenerDatosCarta'. $e->getMessage());
            return false;
        }
    }

    //Devuelvo el atributo que tiene ventaja sobre el otro (sino devuelve null)
    public static function atributoConVentaja($atributo_a, $atributo_b){
        try{
            //obtengo los atributos a los que les gana el atributo_a
            $db=DB::getConnection();
            $query="SELECT atributo_id2 FROM gana_a WHERE atributo_id = :atributo_id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(":atributo_id",$atributo_a);
            $stmt->execute();

            $gana_a=$stmt->fetchAll(PDO::FETCH_ASSOC);

            //obtengo los atributos a los que les gana el atributo_b
            $db=DB::getConnection();
            $query="SELECT atributo_id2 FROM gana_a WHERE atributo_id = :atributo_id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(":atributo_id",$atributo_b);
            $stmt->execute();

            $gana_b=$stmt->fetchAll(PDO::FETCH_ASSOC);


            //si el atributo_a gana al atributo_b, devuelve el atributo_a
            //si el atributo_b gana al atributo_a, devuelve el atributo_b
            //si ninguno gana, devuelve null;
            $gana_a=array_column($gana_a, 'atributo_id2');
            $gana_b=array_column($gana_b, 'atributo_id2');
            if(in_array($atributo_b,$gana_a)) return $atributo_a;
            else if(in_array($atributo_a,$gana_b)) return $atributo_b;
            else return null;

        }catch(PDOException $e){
            error_log('Error en obtenerDatosCarta');
            return false;
        }
    }
    
    
    
    
}
