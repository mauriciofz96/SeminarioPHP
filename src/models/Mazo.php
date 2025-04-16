<?php

namespace App\models;

require_once __DIR__ . '/../models/DB.php';

use PDO;
use App\models\DB;

class Mazo {

    // Verifica cuántos mazos tiene un usuario
    public static function contarMazosPorUsuario($usuario_id) {
        try {
            $db = DB::getConnection();
            $query = "SELECT COUNT(*) FROM mazo WHERE usuario_id = :usuario_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchColumn(); // devuelve el número total de mazos
        } catch (\PDOException $e) {
            error_log("Error en contarMazosPorUsuario: " . $e->getMessage());
            return false;
        }
    }

    // Verifica si todos los IDs de carta existen en la base de datos
    // recibe un array con las id de las cartas 
    public static function verificarCartasExistentes(array $ids_cartas) {
        try {
            $db = DB::getConnection();

            // Creamos una lista con los signos de pregunta (?, ?, ?, ?, ?) según la cantidad de cartas
            $placeholders = implode(',', array_fill(0, count($ids_cartas), '?')); //pasa la lista a cadena de texto
            $query = "SELECT id FROM carta WHERE id IN ($placeholders)"; 
            $stmt = $db->prepare($query);
            $stmt->execute($ids_cartas); //prepara la consulta y la ejecuta 

            // Obtenemos los IDs que efectivamente existen en una sola columna
            $cartas_encontradas = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Comparamos cuántos IDs válidos hay
            return count($cartas_encontradas) === count($ids_cartas);
            // si son todas iguales true, si alguna no coincide devuelve false 
        } catch (\PDOException $e) {
            error_log("Error en verificarCartasExistentes: " . $e->getMessage());
            return false;
        }
    }

    // Crea un nuevo mazo con las cartas proporcionadas
    public static function crearMazo($usuario_id, $nombre, array $ids_cartas) {
        try {
            $db = DB::getConnection();

            // Iniciar transacción, los cambios no se aplican hasta el commit, o se cancele rollback
            $db->beginTransaction();

            // Insertar el mazo
            $stmt = $db->prepare("INSERT INTO mazo (usuario_id, nombre) VALUES (:usuario_id, :nombre)");
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->bindParam(":nombre", $nombre);
            $stmt->execute();

            // Obtener el ID del mazo recién creado (insertado)
            $mazo_id = $db->lastInsertId();

            // Insertar las cartas en la tabla mazo_carta con estado 'en_mazo'
            $stmtCarta = $db->prepare("INSERT INTO mazo_carta (mazo_id, carta_id, estado) VALUES (:mazo_id, :carta_id, 'en_mazo')");
            foreach ($ids_cartas as $carta_id) {
                $stmtCarta->execute([
                    ':mazo_id' => $mazo_id,
                    ':carta_id' => $carta_id
                ]);
            }

            // Confirmar la transacción
            $db->commit();

            // Devolver info del mazo creado
            return [
                'mazo_id' => $mazo_id,
                'nombre' => $nombre
            ];
        } catch (\PDOException $e) {
            // Revertir cambios si hubo un error
            if (isset($db)) {
                $db->rollBack();
            }
            error_log("Error en crearMazo: " . $e->getMessage());
            return false;
        }
    }

    // Borra un mazo si no ha participado en ninguna partida
    // Borra un mazo si no ha participado en ninguna partida y pertenece al usuario
public static function borrarMazo($mazo_id, $usuario_id) {
    try {
        $db = DB::getConnection();
        $db->beginTransaction();

        // Verificar que el mazo exista y que le pertenezca al usuario
        $stmt = $db->prepare("SELECT COUNT(*) FROM mazo WHERE id = :mazo_id AND usuario_id = :usuario_id");
        $stmt->execute([
            ':mazo_id' => $mazo_id,
            ':usuario_id' => $usuario_id
        ]);
        if ($stmt->fetchColumn() == 0) {
            // No existe o no pertenece al usuario
            $db->rollBack();
            return ['error' => 'no_encontrado'];
        }

        // Verificar si el mazo participó en alguna partida
        $stmt = $db->prepare("SELECT COUNT(*) FROM partida WHERE mazo_id = :mazo_id");
        $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
        $stmt->execute();
        $participaciones = $stmt->fetchColumn();

        if ($participaciones > 0) {
            $db->rollBack();
            return ['error' => 'conflicto'];
        }

        // Borrar primero las cartas asociadas (por si hay restricción de FK)
        $stmt = $db->prepare("DELETE FROM mazo_carta WHERE mazo_id = :mazo_id");
        $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
        $stmt->execute();

        // Borrar el mazo
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

    // Obtiene los mazos de un usuario (solo nombre e id)
    public static function obtenerMazosPorUsuario($usuario_id) {
        try {
            $db = DB::getConnection();
            $query = "SELECT id, nombre FROM mazo WHERE usuario_id = :usuario_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC); // devuelve todos los mazos del usuario con solo id y nombre
        } catch (\PDOException $e) {
            error_log("Error en obtenerMazos: " . $e->getMessage());
            return false;
        }
    }

    // Cambia el nombre de un mazo
    public static function cambiarNombreMazo($mazo_id, $nuevo_nombre, $usuario_id) {
        try {
            $db = DB::getConnection();
    
            // Primero validar si el mazo pertenece al usuario
            $query = "SELECT COUNT(*) FROM mazo WHERE id = :mazo_id AND usuario_id = :usuario_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":mazo_id", $mazo_id, PDO::PARAM_INT);
            $stmt->bindParam(":usuario_id", $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
    
            if ($stmt->fetchColumn() == 0) {
                return 'unauthorized'; // no le pertenece
            }
    
            // Ahora actualizamos
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
    

}
