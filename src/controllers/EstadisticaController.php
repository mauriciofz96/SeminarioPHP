<?php

namespace App\controllers;
require_once __DIR__ . '/../models/Estadistica.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\models\Estadistica;

class EstadisticaController {
    public function getEstadisticas(Request $request, Response $response, $args) {
        try {
            $resultado = Estadistica::obtenerEstadisticas();
    
            $response->getBody()->write(json_encode($resultado['data']));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($resultado['status']);
        } catch (\Exception $e) {
            // Manejo de la excepción
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(500);
        }
    }
    
}
