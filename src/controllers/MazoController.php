<?php

namespace App\controllers;

require_once __DIR__ . '/../models/Mazo.php';

use App\models\Mazo;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class MazoController {

    public function crearMazo(Request $request, Response $response): Response {
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
}
