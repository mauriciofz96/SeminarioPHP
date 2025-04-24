<?php

namespace App\controllers;

require_once __DIR__ . '/../models/Mazo.php';

use App\models\Mazo;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class MazoController {

    public static function crearMazo(Request $request, Response $response): Response {
        // Obtener los datos del cuerpo de la solicitud
        $datos = $request->getParsedBody();

        // Extraer nombre del mazo e IDs de cartas
        $nombre = $datos['nombre'] ?? null;
        $ids_cartas = $datos['cartas'] ?? [];

        // Obtener usuario_id desde el token (ya extraído por el middleware)
        $usuario = $request->getAttribute('usuario');
        $usuarioId = $usuario->sub;


        // Validar los datos recibidos
        if (!$nombre || !is_array($ids_cartas)) {
            $response->getBody()->write(json_encode(['error' => 'Nombre del mazo y cartas son requeridos.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Validar cantidad de cartas
        if (count($ids_cartas) > 5) {
            $response->getBody()->write(json_encode(['error' => 'El mazo no puede tener más de 5 cartas.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Validar que las cartas sean únicas
        if (count(array_unique($ids_cartas)) !== count($ids_cartas)) {
            $response->getBody()->write(json_encode(['error' => 'Las cartas no deben repetirse.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Validar que las cartas existan en la base de datos
        if (!Mazo::verificarCartasExistentes($ids_cartas)) {
            $response->getBody()->write(json_encode(['error' => 'Una o más cartas no existen.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Validar que el usuario no tenga más de 3 mazos
        $cantidad = Mazo::contarMazosPorUsuario($usuarioId);
        if ($cantidad === false) {
            $response->getBody()->write(json_encode(['error' => 'Error al verificar los mazos del usuario.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        if ($cantidad >= 3) {
            $response->getBody()->write(json_encode(['error' => 'Solo se permiten hasta 3 mazos por usuario.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Crear el mazo
        error_log("Usuario ID usado para crear mazo: " . $usuarioId);
        $resultado = Mazo::crearMazo($usuarioId, $nombre, $ids_cartas);
        if ($resultado) {
            $response->getBody()->write(json_encode($resultado));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } else {
            $response->getBody()->write(json_encode(['error' => 'No se pudo crear el mazo.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    // Borrar mazo
    public function borrarMazo(Request $request, Response $response, array $args): Response {
        $mazoId = $args['id'] ?? null;
    
        if (!$mazoId) {
            $response->getBody()->write(json_encode(['error' => 'ID de mazo requerido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    
        $usuario = $request->getAttribute('usuario');
        $usuarioId = $usuario->sub;
    
        $resultado = Mazo::borrarMazo($mazoId, $usuarioId);
    
        if ($resultado === ['ok' => true]) {
            $response->getBody()->write(json_encode(['mensaje' => 'Mazo borrado exitosamente.']));
            return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        }
    
        if ($resultado['error'] === 'no_encontrado') {
            $response->getBody()->write(json_encode(['error' => 'El mazo no existe o no pertenece al usuario.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
    
        if ($resultado['error'] === 'conflicto') {
            $response->getBody()->write(json_encode(['error' => 'El mazo no puede ser borrado porque ya participó en una partida.']));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }
    
        // Error interno
        $response->getBody()->write(json_encode(['error' => 'Error interno al intentar borrar el mazo.']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
    
    // Obtener mazos de un usuario
    public function obtenerMazos(Request $request, Response $response, array $args): Response {
        $usuarioIdParam = $args['id'] ?? null;
        $usuarioIdToken = $request->getAttribute('usuario_id'); // Lo injecta el AuthMiddleware
    
        if (!$usuarioIdParam) {
            $response->getBody()->write(json_encode(['error' => 'ID de usuario requerido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    
        if ((int)$usuarioIdParam !== (int)$usuarioIdToken) {
            $response->getBody()->write(json_encode(['error' => 'No autorizado para acceder a los mazos de otro usuario.']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    
        $mazos = Mazo::obtenerMazosPorUsuario((int)$usuarioIdParam);
    
        if ($mazos === false) {
            $response->getBody()->write(json_encode(['error' => 'Error al obtener los mazos.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    
        $response->getBody()->write(json_encode($mazos));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    }

    // Cambiar nombre de mazo
    public function cambiarNombreMazo(Request $request, Response $response, array $args): Response {
        $mazoId = $args['mazo'] ?? null;
        $nuevoNombre = $request->getParsedBody()['nombre'] ?? null;
    
        if (!$mazoId || !$nuevoNombre) {
            $response->getBody()->write(json_encode(['error' => 'ID de mazo y nuevo nombre son requeridos.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    
        $usuario = $request->getAttribute('usuario');
        $usuarioId = $usuario->sub;
    
        $resultado = Mazo::cambiarNombreMazo($mazoId, $nuevoNombre, $usuarioId);
    
        if ($resultado === 'unauthorized') {
            $response->getBody()->write(json_encode(['error' => 'No estás autorizado a modificar este mazo.']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    
        if ($resultado === false) {
            $response->getBody()->write(json_encode(['error' => 'Error al cambiar el nombre del mazo.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    
        $response->getBody()->write(json_encode(['mensaje' => 'Nombre del mazo cambiado exitosamente.']));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    }
    
    // 
}