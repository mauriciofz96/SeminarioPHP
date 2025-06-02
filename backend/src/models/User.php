<?php

namespace App\models;

require_once __DIR__ . '/../models/DB.php';
use PDO; //importa clase para la conexion con la DB
use App\models\DB;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class User {
    // obtener clave secreta desde variables de entorno para manejar los tokens
    private static function getSecretKey() {
        return $_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? getenv('JWT_SECRET') ?: 'clave_por_defecto';
    }

    
    public static function verificarCredenciales($nombre, $usuario, $password) {
        try {
            $db = DB::getConnection();
            $query = "SELECT * FROM usuario WHERE usuario = :usuario";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":usuario", $usuario);
            $stmt->execute();
    
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
            // Verificar que el usuario exista y que la contraseña coincida
            if ($user && $password === $user['password']) {
                return $user;
            }
            return false;
        } catch (\PDOException $e) {
            error_log("Error en verificarCredenciales: " . $e->getMessage());
            return false;
        }
    }

    // validar datos antes de crear un usuario
    public static function validarDatos($usuario, $password) {
        if (!preg_match('/^[a-zA-Z0-9]{6,20}$/', $usuario)) {
            return "El usuario debe tener entre 6 y 20 caracteres alfanuméricos.";
        }

        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
            return "La clave debe tener al menos 8 caracteres, incluir mayusculas, minusculas, numeros y un caracter especial.";
        }

        return null; 
    }

    public static function crearUsuario($nombre, $usuario, $password) {
        try {
            $db = DB::getConnection();
    
            $error = self::validarDatos($usuario, $password);
            if ($error) {
                return $error;
            }
    
            // Verificar si el usuario ya existe
            $stmt = $db->prepare("SELECT id FROM usuario WHERE usuario = :usuario");
            $stmt->execute([':usuario' => $usuario]);
    
            if ($stmt->rowCount() > 0) {
                return "El usuario ya está en uso.";
            }
    
            // Guardar la contraseña en texto plano (no recomendado)
            $stmt = $db->prepare("INSERT INTO usuario (nombre, usuario, password) VALUES (:nombre, :usuario, :password)");
            $exito = $stmt->execute([
                ':nombre' => $nombre,
                ':usuario' => $usuario,
                ':password' => $password
            ]);
    
            return $exito ? true : "Error al crear el usuario.";
        } catch (\PDOException $e) {
            return "Error en crearUsuario: " . $e->getMessage();
        }
    }
    // Obtener información del usuario
    // Obtener información del usuario
    public static function obtenerInformacionPorUsuario($id){
        try{
            $db= DB::getConnection();
            $query="SELECT id, nombre, usuario FROM usuario WHERE id = :id";
            $stmt=$db->prepare($query);
            $stmt->bindParam(':id',$id);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $user ?: null; 
        
        } catch (\PDOException $e){
            error_log("Error al obtener informacion del usuario: " . $e->getMessage());
            return null;
        }
    }
    
    // Actualizar información del usuario
    public static function cambiarInfo($id, $nombre, $password) {
        try {
            $db = DB::getConnection();
        
        $query = "SELECT nombre, password FROM usuario WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return "Usuario no encontrado.";
        }

        
        if ($user['nombre'] === $nombre && $password === $user['password']) {
            return "No se realizaron cambios porque los datos enviados son iguales a los existentes.";
        }

        
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
            return "Contraseña invalida. Debe tener al menos 8 caracteres, incluir mayusculas, minusculas, numeros y un caracter especial.";
        }

        
        $query = "UPDATE usuario SET nombre = :nombre, password = :password WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return true;
        } else {
            return "No se realizaron cambios en la información.";

        }
    } catch (\PDOException $e) {
        error_log("Error en cambiarInfo: " . $e->getMessage());
        return "Error al actualizar la información del usuario.";
    }
}
    public static function guardarToken($usuario, $token, $fechaExpiracion) {
        try {
            $db = DB::getConnection();

            
            $query = "UPDATE usuario SET token = :token, vencimiento_token = :vencimiento WHERE usuario = :usuario";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->bindParam(':vencimiento', $fechaExpiracion);
            $stmt->bindParam(':usuario', $usuario);

            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return true; // Token guardado correctamente
            } else {
                return "No se pudo guardar el token. Verifica que el usuario exista.";
            }
        } catch (\PDOException $e) {
            error_log("Error al guardar el token: " . $e->getMessage());
            return "Error al guardar el token.";
        }
    }
}
