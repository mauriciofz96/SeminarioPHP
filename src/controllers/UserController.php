<?php

namespace App\controllers;

require_once __DIR__ . '/../models/User.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class UserController {
    public function login(Request $request, Response $response, array $args) {
        $data = $request->getParsedBody();
        
        $nombre = $data['nombre'] ?? '';
        $usuario = $data['usuario'] ?? '';
        $password = $data['password'] ?? '';

        $user = User::verificarCredenciales($nombre, $usuario, $password);

        if ($user) {
            $expiracion = time() + 3600;

            $payload = [
                "sub" => $user['id'],
                "nombre" => $user['nombre'],
                "usuario" => $user['usuario'],
                "exp" => $expiracion
            ];

            // Usar sólo $_SERVER y validar
            $jwt_secret = $_SERVER['JWT_SECRET'] ?? null;

            if (!$jwt_secret) {
                $response->getBody()->write(json_encode([
                    "error" => "Configuración inválida",
                    "mensaje" => "JWT_SECRET no está definido en \$_SERVER"
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
            }

            // chequear clave secreta
            error_log("CLAVE USADA PARA FIRMAR TOKEN (desde login): " . $jwt_secret);
            error_log("Longitud: " . strlen($jwt_secret));


            $token = JWT::encode($payload, $jwt_secret, 'HS256');

            User::guardarToken($usuario, $token, date('Y-m-d H:i:s', $expiracion));

            $response->getBody()->write(json_encode(["token" => $token]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } else {
            $response->getBody()->write(json_encode(["error" => "Credenciales incorrectas"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
    }

    public static function register($data) {
        error_log(print_r($data, true));

        if (!isset($data['nombre'], $data['usuario'], $data['password'])) {
            return ['error' => 'Faltan datos obligatorios', 'status' => 400];
        }

        $resultado = User::crearUsuario($data['nombre'], $data['usuario'], $data['password']);

        if ($resultado === true) {
            return ['mensaje' => 'Usuario creado correctamente', 'status' => 200];
        }

        return ['error' => $resultado, 'status' => ($resultado === 'El usuario ya está en uso.') ? 409 : 400];
    }

    //funcion para mostrar informacion del usuario logeado
    public static function obtenerInformacionUsuario($token){
        try {
            // Obtener la clave secreta
            $jwt_secret = $_SERVER['JWT_SECRET'] ?? null;
    
            if (!$jwt_secret) {
                throw new \Exception("JWT_SECRET no está configurado.");
            }
    
            // Decodificar el token
            $decoded = JWT::decode($token, new Key($jwt_secret, 'HS256'));
    
            // Verificar si el token tiene la propiedad 'usuario'
            if (!isset($decoded->usuario)) {
                return ['status' => 401, 'mensaje' => 'Token no válido o usuario no encontrado en el token.'];
            }
    
            $usuario = $decoded->usuario;
    
            // Obtener la información del usuario con el nombre de usuario
            $userInfo = User::obtenerInformacionPorUsuario($usuario);
    
            // Verificar si se obtuvo la información del usuario
            if ($userInfo) {
                return ['status' => 200, 'data' => $userInfo];
            } else {
                return ['status' => 404, 'mensaje' => 'Usuario no encontrado'];
            }
        } catch (\Exception $e) {
            return ['status' => 401, 'mensaje' => 'Error al procesar el token: ' . $e->getMessage()];
        }
    }
    
    


}
