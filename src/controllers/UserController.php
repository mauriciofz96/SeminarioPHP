<?php

namespace App\controllers;

require_once __DIR__ . '/../models/User.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\models\User;
//generacion y validacion de tokens
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class UserController {
    //funciones para login
    public function login(Request $request, Response $response, array $args) {
        $data = $request->getParsedBody(); //obtiene los datos de la solicitud en json
        
        $nombre = $data['nombre'] ?? ''; //si no esta presente en $data le asigna ''
        $usuario = $data['usuario'] ?? '';
        $password = $data['password'] ?? '';
    
        //metodo de la clase User para chequear si las credenciales son correctas
        $user = User::verificarCredenciales($nombre, $usuario, $password);
    
        if ($user) { //si son correctas
            $expiracion = time() + 3600; // Token válido por 1 hora
    
            $payload = [
                "sub" => $user['id'],  
                "nombre" => $user['nombre'],
                "usuario" => $user['usuario'],
                "exp" => $expiracion
            ];

            // cbtener la clave secreta desde config.php
            $config = require __DIR__ . '/../config/config.php';
            $jwt_secret = $config['jwt_secret'];
    
            $token = JWT::encode($payload, $jwt_secret, 'HS256'); //codifica el token con hs256
    
            User::guardarToken($usuario, $token, date('Y-m-d H:i:s', $expiracion));
            
            //si no hay problemas retorna el token en formato json con codigo 200 OK
            $response->getBody()->write(json_encode(["token" => $token]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } else { 
            $response->getBody()->write(json_encode(["error" => "Credenciales incorrectas"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
    }

    //funciones para registro

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
}
