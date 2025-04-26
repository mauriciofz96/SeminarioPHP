<?php

namespace App\controllers;

require_once __DIR__ . '/../models/Mazo.php';

use App\models\Carta;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CartaController {
    public function listarCartasPorFiltro(Request $request, Response $response, $args): Response {
        $params = $request->getQueryParams();
        $atributo = $params['atributo'] ?? null;
        $nombre = $params['nombre'] ?? null;

        // Validación opcional: ambos vacíos podría considerarse Bad Request
        if ($atributo === null && $nombre === null) {
            $response->getBody()->write(json_encode(['error' => 'Faltan parámetros de búsqueda']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $cartas = Carta::buscarCartas($atributo, $nombre);

        if (empty($cartas)) {
            //404 si no se encontraron recursos
            $response->getBody()->write(json_encode(['error' => 'No se encontraron cartas']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($cartas));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    }

    public function listarCartasEnMano(Request $request, Response $response, $args): Response {
        $usuarioPath = $args['usuario'];   // Usuario que viene en la URL
        $partida = $args['partida'];        // Partida que viene en la URL
    
        $usuarioLogueado = $request->getAttribute('usuario_id'); // Usuario que está logueado (del token)
    
        // Verificar que el usuario logueado sea el mismo que el del path
        if ($usuarioLogueado != $usuarioPath) {
            $response->getBody()->write(json_encode(['error' => 'No autorizado']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    
        // Validar que sean números válidos
        if (!is_numeric($usuarioPath) || !is_numeric($partida)) {
            $response->getBody()->write(json_encode(['error' => 'Parámetros inválidos']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    
        try {
            $cartas = Carta::obtenerCartasEnManoPorUsuarioYPartida($usuarioPath, $partida);
    
            if (empty($cartas)) {
                $response->getBody()->write(json_encode(['error' => 'No se encontraron cartas en mano']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
    
            $response->getBody()->write(json_encode($cartas));
            return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Error interno del servidor']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
    
    
    
    
}
