<?php

namespace App\controllers;

use App\models\Mazo;
use App\models\Partida;
use App\models\Carta;

require_once __DIR__ . '\..\models\Partida.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PartidaController{

    public function crearPartida(Request $request, Response $response): Response {

        $data = $request->getParsedBody();
        $mazo_id = $data['mazo_id'] ?? null;

        if (!$mazo_id) {
            $response->getBody()->write(json_encode(['error' => 'Error: el id del mazo es obligatorio.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $usuario_id = $request->getAttribute('usuario_id');
        $mazos_usuario = Mazo::obtenerMazosPorUsuario((int)$usuario_id);

        if ($mazos_usuario === false) {
            $response->getBody()->write(json_encode(['error' => 'El usuario no posee mazos.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        } else {
            $mazos_ids = array_column($mazos_usuario, 'id');
            if (!in_array($mazo_id, $mazos_ids)) {
                $response->getBody()->write(json_encode(['error' => 'El mazo no pertenece al usuario.']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
        }

        $resultado = Partida::crearPartida($usuario_id, $mazo_id);

        if (is_array($resultado) && isset($resultado['error'])) {
            $response->getBody()->write(json_encode(['error' => $resultado['error']]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if ($resultado === false) {
            $response->getBody()->write(json_encode(['error' => 'Error al crear la partida.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $cartas = Mazo::obtenerCartasPorMazo($mazo_id);
        if ($cartas === false) {
            $response->getBody()->write(json_encode(['error' => 'Error al obtener las cartas del mazo.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode([
            'partida_id' => $resultado['partida_id'],
            'cartas' => $cartas
        ]));

        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    }

// modificacion de crearPartida del PartidaController

    public function realizarJugada(Request $request, Response $response){
        

        $datos=$request->getParsedBody();
        $carta_id_a=$datos["carta_id"] ?? null;
        $partida_id = $datos["partida_id"] ?? null;
        $usuario_id = $request->getAttribute('usuario_id');

        if(!$carta_id_a || !$partida_id){
            $response->getBody()->write(json_encode(['error'=> 'Error: el id de la carta y el id de la partida son obligatorios.']));
            return $response->withStatus(400)->withHeader('Content-Type','application/json');
        }

        $mazo_id = Partida::obtenerMazoEnJuego($partida_id,$usuario_id);
        if(!$mazo_id){
            $response->getBody()->write(json_encode(['error'=> 'No se encontro un mazo']));
            return $response->withStatus(404)->withHeader('Content-Type','application/json');
        }
        
        
        $cartas=Mazo::obtenerCartasPorMazo($mazo_id);
        if(!in_array($carta_id_a,$cartas)){
            $response->getBody()->write(json_encode(['error'=> 'La carta recibida no se corresponde con ninguna del mazo.']));
            return $response->withStatus(404)->withHeader('Content-Type','application/json');
        }
        
        $carta_a=Carta::obtenerDatos($carta_id_a,$mazo_id);

        
        $estado_carta_a=$carta_a["estado"] ?? null;
        if(!$carta_a || ($estado_carta_a !== "en_mano")){
            error_log("Estado de la carta_a: $estado_carta_a");
            $response->getBody()->write(json_encode(['error'=>'Carta no disponible']));
            return $response->withStatus(400)->withHeader('Content-Type','application/json');
        }

        

        $carta_id_b=Partida::jugadaServidor();
        $carta_b=Carta::obtenerDatos($carta_id_b,1); 
        if(!$carta_b){
            $response->getBody()->write(json_encode(['error'=>'No se pudo obtener la carta del servidor']));
            return $response->withStatus(400)->withHeader('Content-Type','application/json');
        }

        
        $jugada_id=Partida::crearJugada($carta_id_a,$carta_id_b,$partida_id);

        if($jugada_id === false){
            $response->getBody()->write(json_encode(['error'=>'La jugada no pudo ser creada']));
            return $response->withStatus(400)->withHeader('Content-Type','application/json');
        }
       
        $datos_jugada=Partida::ejecutarJugada($carta_a,$carta_b,$mazo_id,$jugada_id);

        $respuesta = [
            'carta jugada por el servidor' => $carta_b,
            'fuerza carta a' => $datos_jugada['fuerza_a'],
            'fuerza carta b'=> $datos_jugada['fuerza_b']
        ];

        
        $cantidad_jugadas=Partida::cantidadJugadas($partida_id);
        if($cantidad_jugadas===5){
            
            $usuario=$request->getAttribute('usuario');
            
            $ganador=Partida::cerrarPartida($partida_id,$usuario);
            
            $respuesta['El ganador es:'] = $ganador;
        }
        
        $response->getBody()->write(json_encode($respuesta));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');


    }
}
?>
