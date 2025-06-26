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

        $cartas = Carta::buscarCartas($atributo, $nombre);

        if (empty($cartas)) {
            $response->getBody()->write(json_encode(['error' => 'No se encontraron cartas']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($cartas));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    }



    public function listarCartasEnMano(Request $request, Response $response, $args): Response {
        $usuarioPath = $args['usuario'];   
        $partida = $args['partida'];        
    
        $usuarioLogueado = $request->getAttribute('usuario_id'); 
    
        //Modificado ESTE if, para poder obtener las cartas del servidor tambien 
        if ($usuarioLogueado != $usuarioPath && $usuarioPath != 1) {
          $response->getBody()->write(json_encode(['error' => 'No autorizado']));
         return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    
        
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
    
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Error interno del servidor']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }    
    
    

    
}
