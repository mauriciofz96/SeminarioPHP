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

            if (!empty($atributo)) {
                // Acá filtramos por id del atributo
                $sql .= " AND a.id = :atributo";
                $params[':atributo'] = $atributo;
            }

            if (!empty($nombre)) {
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
            
            $resultado['estado']=$estado;
            return $resultado;
            

        }catch(PDOException $e){
            error_log('Error en obtenerDatosCarta'. $e->getMessage());
            return false;
        }
    }

    
    public static function atributoConVentaja($atributo_a, $atributo_b){
        try{
            
            $db=DB::getConnection();
            $query="SELECT atributo_id2 FROM gana_a WHERE atributo_id = :atributo_id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(":atributo_id",$atributo_a);
            $stmt->execute();

            $gana_a=$stmt->fetchAll(PDO::FETCH_ASSOC);

            
            $db=DB::getConnection();
            $query="SELECT atributo_id2 FROM gana_a WHERE atributo_id = :atributo_id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(":atributo_id",$atributo_b);
            $stmt->execute();

            $gana_b=$stmt->fetchAll(PDO::FETCH_ASSOC);


            
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

  //NUEVO: obtener datos para mostrar. Devuelve los datos de la carta necesarios para el Ver Mazo
    public static function obtenerDatosParaMostrar($carta_id){
        try {
            $db = DB::getConnection();
            $query = "SELECT nombre, ataque, ataque_nombre, atributo_id FROM carta WHERE id = :carta_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":carta_id", $carta_id, PDO::PARAM_INT);
            $stmt->execute();

            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$resultado) {
                error_log('Error en la obtencion de los datos de la carta');
                return false;
            }

            $query="SELECT nombre FROM atributo WHERE id = :atributo_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":atributo_id", $resultado['atributo_id'], PDO::PARAM_INT);
            $stmt->execute();

            $atributo = $stmt->fetchColumn();
            if (!$atributo) {
                error_log('Error en la obtencion del atributo de la carta');
                return false;
            }
            $resultado['atributo'] = $atributo;
            unset($resultado['atributo_id']); // Eliminamos el atributo_id para que no se muestre en el resultado final
            return $resultado;

        }catch(\PDOException $e){
            error_log('Error en obtenerDatosParaMostrar:'. $e->getMessage());
            return false;
        }
    }
}
