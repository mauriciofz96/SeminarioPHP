<?php
namespace App\models;

require_once __DIR__ . '/../models/DB.php';

use PDO;

use App\models\DB;
use PDOException;

class Partida {
    public static function crearPartida($usuario_id, $mazo_id){
        try{
            $db = DB::getConnection();

            // --- NUEVO: Verificar si ya hay una partida en curso
            $stmt = $db->prepare("SELECT COUNT(*) FROM partida WHERE estado = 'en_curso'");
            $stmt->execute();
            if ($stmt->fetchColumn() > 0) {
                return ['error' => 'Ya hay una partida en curso.'];
            }

            $db->beginTransaction();

            $estado = 'en_curso';
            $fecha = date('Y-m-d H:i:s');
            $stmt = $db->prepare("INSERT INTO partida (usuario_id, fecha, mazo_id, estado) VALUES(:usuario_id,:fecha,:mazo_id,:estado)");
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->bindParam(":fecha", $fecha);
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
            $stmt->bindParam(":estado", $estado);

            if(!$stmt->execute()){
                error_log("Error al insertar la partida en la base de datos.");
                $db->rollBack();
                return false;
            }
    
            $partida_id = $db->lastInsertId();

            // Actualizar cartas del mazo del usuario y del servidor a 'en_mano'
            $db->prepare("UPDATE mazo_carta SET estado = 'en_mano' WHERE mazo_id = :mazo_id")
                ->execute([':mazo_id' => $mazo_id]);
            $db->prepare("UPDATE mazo_carta SET estado = 'en_mano' WHERE mazo_id = 1")
                ->execute();

            $db->commit();
            return ['partida_id' => $partida_id];

        } catch (\PDOException $e) {
            error_log('Error al crear la partida: '. $e->getMessage());
            return false;
        }
    }
// modificacion de crearPartida de Partida.php


    //JUGADA SERVIDOR
    public static function jugadaServidor(): int {
        try {
            $db = DB::getConnection();

            // Consulta para obtener una carta válida del mazo del servidor
            $query = "SELECT carta_id FROM  mazo_carta WHERE mazo_id = 1 AND carta_id NOT IN (SELECT carta_id_b FROM jugada WHERE partida_id = :partida_id) LIMIT 1";

            $stmt = $db->prepare($query);

            // Suponiendo que el ID de la partida está disponible en el contexto
            $partidaId = self::getPartidaActual(); 
            $stmt->bindParam(':partida_id', $partidaId, PDO::PARAM_INT);

            $stmt->execute();
            $cartaId = $stmt->fetchColumn();


            if ($cartaId) {

                // Actualizar el estado de la carta a "descartado" en la tabla mazo_carta
                $updateQuery = "UPDATE mazo_carta 
                    SET estado = 'descartado' 
                    WHERE carta_id = :carta_id AND mazo_id = 1 
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
        //Leer el cuerpo de la solicitud
        // y decodificar el JSON en un array asociativo
        $input = file_get_contents('php://input');
        $datos = json_decode($input, true);
        // Verificar si el id de la partida está presente
        if (isset($datos['partida_id'])) {
            return (int) $datos['partida_id'];
        }
    
        throw new \Exception("No se proporcionó el ID de la partida.");
    }


     //Obtengo el mazo del user que se encuentra asignado a la partida correspondiente
    public static function obtenerMazoEnJuego($partida_id,$usuario_id){
        try{
          $db=DB::getConnection();
          $query="SELECT mazo_id FROM partida WHERE id = :partida_id AND usuario_id = :usuario_id";
          $stmt=$db->prepare($query);
          $stmt->bindParam(":partida_id",$partida_id);
          $stmt->bindParam(":usuario_id",$usuario_id);
          $stmt->execute();
          $resultado=$stmt->fetchColumn();

          return $resultado;

        }catch(PDOException $e){
          error_log('Error al obtener el mazo en juego: '. $e->getMessage());
          return false;
        }
     }

    //CREAR JUGADA
    public static function crearJugada($carta_id_a,$carta_id_b,$partida_id){
       try{
        $db = DB::getConnection();

        //crear registro jugada
        $query="INSERT INTO jugada(partida_id, carta_id_a, carta_id_b) VALUES(:partida_id, :carta_id_a, :carta_id_b)";
        $stmt=$db->prepare($query);
        $stmt->bindParam(":partida_id",$partida_id);
        $stmt->bindParam(":carta_id_a",$carta_id_a);
        $stmt->bindParam(":carta_id_b",$carta_id_b);

        if(!$stmt->execute()){
            error_log('No se pudo crear la jugada');
            return false;
        }

        //obtengo el id de la jugada creada
        $jugada_id=$db->lastInsertId();
        
        return $jugada_id;


       }catch(PDOException $e){
        error_log('Error al crear la jugada'. $e->getMessage());
        return false;
       }

    }

    //Calculo el ganador, y segun el atributo que tenga ventaja, se le suma el 30% al ataque que corresponda
    private static function calcularGanadorJugada($carta_a,$carta_b){
        
        $atributo_a=$carta_a['atributo'] ?? null;
        $ataque_a=$carta_a['ataque'] ?? null;


        $atributo_b=$carta_b['atributo'] ?? null;
        $ataque_b=$carta_b['ataque'] ?? null;

        $atributo_ventaja=Carta::atributoConVentaja($atributo_a,$atributo_b);


        if($atributo_ventaja == $atributo_a){
            $porcentaje=(30*100)/$ataque_a;
            $ataque_a=$ataque_a+$porcentaje;
        }else if($atributo_ventaja == $atributo_b){
            $porcentaje=(30*100) / $ataque_b;
            $ataque_b=$ataque_b+$porcentaje;
        }

        if($ataque_a>$ataque_b){
            $el_usuario="gano";
        }
        else if ($ataque_a<$ataque_b){
            $el_usuario="perdio";
        }
        else $el_usuario="empato";


        $resultado=[
            'fuerza_a' => $ataque_a,
            'fuerza_b' => $ataque_b,
            'el_usuario' => $el_usuario,
        ];
        return $resultado;
    }


    //Ejecuto la jugada
    public static function ejecutarJugada($carta_a,$carta_b,$mazo_id,$jugada_id){

        try{
        $resultado=self::calcularGanadorJugada($carta_a,$carta_b);

        $db=DB::getConnection();
        $db->beginTransaction();

        //actualizar el registro de jugada
        $query="UPDATE jugada SET el_usuario = :el_usuario WHERE id = :id";
        $stmt=$db->prepare($query);
        $stmt->bindParam(":el_usuario",$resultado['el_usuario']);
        $stmt->bindParam(":id",$jugada_id, PDO::PARAM_INT);
        
        if(!$stmt->execute()){
            $db->rollBack();
            return ['error' => 'no pudo actualizarse la jugada'];
        }

        //actualizar el estado de la carta_a
        $query="UPDATE mazo_carta SET estado = 'descartado' WHERE carta_id = :carta_id AND mazo_id = :mazo_id";
        $stmt=$db->prepare($query);
        $stmt->bindParam(":carta_id",$carta_a['id']);
        $stmt->bindParam(":mazo_id",$mazo_id, PDO::PARAM_INT);
        $stmt->execute();

        $db->commit();
        return $resultado;

    }catch(PDOException $e){
        error_log('Error en ejecutarJugada'. $e->getMessage());
        return false;
    }
    }

    //Calculo cantidad de jugadas para la partida
    public static function cantidadJugadas($partida_id){
        try{
            $db=DB::getConnection();
            $query="SELECT COUNT(*) FROM jugada WHERE partida_id = :partida_id";
            $stmt=$db->prepare($query);
            $stmt->bindParam("partida_id",$partida_id);
            $stmt->execute();
            return $stmt->fetchColumn();                
            }catch(PDOException $e){
                error_log('Error al obtener la cantidad de jugadas de la partida.'. $e->getMessage());
                return false;
        }

    }

    
    private static function calcularGanadorPartida($resultado){
        $conteo=array_count_values($resultado); //cuento la cantidad de veces que aparecen los resultados: gano, perdio, empato
        $el_usuario=array_search(max($conteo),$conteo); //busco el resultado que aparece mas veces
        return $el_usuario;
    }


    //Finalizo la partida
    public static function cerrarPartida($partida_id,$usuario){
        try{

            $db=DB::getConnection();
            $query="SELECT el_usuario FROM jugada WHERE partida_id = :partida_id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(":partida_id",$partida_id);
            $stmt->execute();

            $resultado=$stmt->fetchAll(PDO::FETCH_COLUMN, 0);
            $resultado_partida=self::calcularGanadorPartida($resultado);
            

            $query="UPDATE partida SET estado = :estado, el_usuario = :el_usuario WHERE id = :id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(":id",$partida_id);
            $stmt->bindParam(":el_usuario",$resultado_partida);
            $estado='finalizada';
            $stmt->bindParam(":estado",$estado);
            
            if(!$stmt->execute()){
                error_log('No se pudo finalizar la partida');
                return false;
            }
            if($resultado_partida == "empato") $ganador="Empate";
            else if($resultado_partida == "gano") $ganador=$usuario;
            else if($resultado_partida == "perdio") $ganador="Servidor";
            return $ganador;

        }catch(PDOException $e){
            error_log('Error en cerrarPartida'. $e->getMessage());
            return false;
        }
    }

}