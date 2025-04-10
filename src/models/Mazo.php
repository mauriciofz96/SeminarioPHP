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
}
