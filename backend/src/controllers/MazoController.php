<?php

namespace App\controllers;

require_once __DIR__ . '/../models/Mazo.php';

use App\models\Carta;
use App\models\Mazo;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class MazoController {

    public static function crearMazo(Request $request, Response $response): Response {
       
        $datos = $request->getParsedBody();

        $nombre = $datos['nombre'] ?? null;
        $ids_cartas = $datos['cartas'] ?? [];

        $usuario = $request->getAttribute('usuario');
        $usuarioId = $usuario->sub;


        if (!$nombre || !is_array($ids_cartas)) {
            $response->getBody()->write(json_encode(['error' => 'Nombre del mazo y cartas son requeridos.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }


        if (count($ids_cartas) > 5) {
            $response->getBody()->write(json_encode(['error' => 'El mazo no puede tener más de 5 cartas.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if (count(array_unique($ids_cartas)) !== count($ids_cartas)) {
            $response->getBody()->write(json_encode(['error' => 'Las cartas no deben repetirse.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        
        if (!Mazo::verificarCartasExistentes($ids_cartas)) {
            $response->getBody()->write(json_encode(['error' => 'Una o más cartas no existen.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        
        $cantidad = Mazo::contarMazosPorUsuario($usuarioId);
        if ($cantidad === false) {
            $response->getBody()->write(json_encode(['error' => 'Error al verificar los mazos del usuario.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        if ($cantidad >= 3) {
            $response->getBody()->write(json_encode(['error' => 'Solo se permiten hasta 3 mazos por usuario.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        
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
    
        
        $response->getBody()->write(json_encode(['error' => 'Error interno al intentar borrar el mazo.']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
    
    
    public function obtenerMazos(Request $request, Response $response, array $args): Response {
        $usuarioIdParam = $args['id'] ?? null;
        $usuarioIdToken = $request->getAttribute('usuario_id'); 
    
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

    // NUEVO: obtener cartas por mazo($mazoId): devuelve las cartas con nombre, ataque, ataque_nombre y atributo
    public function listarCartasEnMazo(Request $request,Response $response): Response {
        $mazoId = $request->getAttribute('mazo');

        if (!$mazoId) {
            $response->getBody()->write(json_encode(['error' => 'ID de mazo requerido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $cartas = Mazo::obtenerCartasPorMazo($mazoId);

        if ($cartas === false) {
            $response->getBody()->write(json_encode(['error' => 'Error al obtener las cartas del mazo.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $cartasConDatos = [];
        foreach($cartas as $cartaId){
            $datosCarta = Carta::obtenerDatosParaMostrar($cartaId);
            if ($datosCarta === false) {
                $response->getBody()->write(json_encode(['error' => 'Error al obtener los datos de la carta.']));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }
            $datosCarta['id'] = $cartaId;
            $cartasConDatos[$cartaId] = $datosCarta;
        }

        $response->getBody()->write(json_encode($cartasConDatos));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    }
    
    // 
}
