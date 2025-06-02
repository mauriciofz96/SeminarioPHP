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

            
            $jwt_secret = $_SERVER['JWT_SECRET'] ?? null;

            if (!$jwt_secret) {
                $response->getBody()->write(json_encode([
                    "error" => "Configuración inválida",
                    "mensaje" => "JWT_SECRET no está definido en \$_SERVER"
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
            }

            
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

    
    public static function obtenerInformacionUsuario($id,$token){
        try {
            
            $jwt_secret = $_SERVER['JWT_SECRET'] ?? null;
            if (!$jwt_secret) {
                throw new \Exception("JWT_SECRET no está configurado.");
            }
            
            $decoded = JWT::decode($token, new Key($jwt_secret, 'HS256'));
            
             if (!isset($decoded->sub) || $decoded->sub != $id) {
                return ['status' => 403, 'mensaje' => 'No tienes permiso para ver este usuario'];
             }
            
            $userInfo = User::obtenerInformacionPorUsuario($id);
    
            
            if ($userInfo) {
                return ['status' => 200, 'data' => $userInfo];
            } else {
                return ['status' => 404, 'mensaje' => 'Usuario no encontrado'];
            }
        } catch (\Exception $e) {
            return ['status' => 401, 'mensaje' => 'Error al procesar el token: ' . $e->getMessage()];
        }
    }
    
    
    public static function actualizarInformacion($id, $data, $token) {
        try {
            
            $jwt_secret = $_SERVER['JWT_SECRET'] ?? null;
            if (!$jwt_secret) {
                throw new \Exception("JWT_SECRET no está configurado.");
            }
            
            $decoded = JWT::decode($token, new Key($jwt_secret, 'HS256'));
            if (!isset($decoded->sub) || $decoded->sub != $id) {
                return ['status' => 403, 'mensaje' => 'No tienes permiso para ver este usuario'];
             }
            $usuario = User::obtenerInformacionPorUsuario($id);
            if(!$usuario){
                return ['status' => 404, 'mensaje' => 'Usuario no encontrado'];
            }
            
            if (!isset($data['nombre'], $data['password'])) {
                return ['status' => 400, 'mensaje' => 'Faltan datos obligatorios'];
            }
            
            $resultado = User::cambiarInfo($id, $data['nombre'], $data['password']);
            if ($resultado === true) {
                return ['status' => 200, 'mensaje' => 'Información actualizada.'];
            } else {
                return ['status' => 400, 'mensaje' => $resultado];
            }
        } catch (\Exception $e) {
            return ['status' => 500, 'mensaje' => 'Error al procesar la solicitud'];
        }
    }
    

}
