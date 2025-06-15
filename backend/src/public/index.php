<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);


require __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;
$dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
$dotenv->load();


foreach ($_ENV as $key => $value) {
    $_SERVER[$key] = $value;
}


if (!isset($_SERVER['JWT_SECRET'])) {
    http_response_code(500);
    echo json_encode([
        "error" => "Configuración inválida",
        "mensaje" => "JWT_SECRET no está definido en \$_SERVER"
    ]);
    exit;
}

$jwtSecret = $_SERVER['JWT_SECRET'];


use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require_once __DIR__ . '/../controllers/UserController.php';
use App\Controllers\UserController;
use App\Controllers\MazoController;
use App\Controllers\CartaController;
use App\middleware\AuthMiddleware;

$app = AppFactory::create();


$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

// Endpoint de prueba
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write("Hello world!");
    return $response;
});

// USER

// Endpoint para login
$app->post('/login', \App\controllers\UserController::class . ':login');

// Endpoint para registrar un usuario
$app->post('/registro', function (Request $request, Response $response) {
    $data = $request->getParsedBody();
    $resultado = UserController::register($data);

    $response->getBody()->write(json_encode([
        'message' => $resultado['mensaje'] ?? $resultado['error']
    ]));

    return $response->withStatus($resultado['status'])->withHeader('Content-Type', 'application/json');
});


$app->get('/usuarios/{usuario}', function (Request $request, Response $response, array $args) {
    $id=$args['usuario'];
    $token = $request->getHeader('Authorization')[0] ?? '';
    $token = str_replace('Bearer ', '',$token); 
    $token = trim($token); 

    $resultado = UserController::obtenerInformacionUsuario($id,$token);

    
    if ($resultado['status'] === 200) {
        $response->getBody()->write(json_encode($resultado['data']));
    } else {
        $response->getBody()->write(json_encode(['error' => $resultado['mensaje']]));
    }

    return $response->withHeader('Content-Type', 'application/json')->withStatus($resultado['status']);
});


$app->put('/usuarios/{usuario}', function (Request $request, Response $response, array $args) {
    
    $token= $request->getHeader('Authorization')[0] ?? '';
    $token = str_replace('Bearer ', '',$token);
    $token = trim($token);

    $id = $args['usuario'];

    $data = $request->getParsedBody();

    $resultado = UserController::actualizarInformacion($id, $data, $token);

    
    if ($resultado['status'] === 200) {
        
        $response->getBody()->write(json_encode(['mensaje' => $resultado['mensaje']]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        
        $response->getBody()->write(json_encode(['error' => $resultado['mensaje']]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($resultado['status']);
    }
});

 // JUEGO

$app->get('/usuarios/{usuario}/partidas/{partida}/cartas', CartaController::class . ':listarCartasEnMano')->add(new AuthMiddleware($jwtSecret));


// MAZO


$app->post('/mazos', MazoController::class . ':crearMazo')->add(new AuthMiddleware($jwtSecret));

$app->delete('/mazos/{id}', MazoController::class . ':borrarMazo')->add(new AuthMiddleware($jwtSecret));

$app->get('/usuarios/{id}/mazos', MazoController::class . ':obtenerMazos')->add(new AuthMiddleware($jwtSecret));

$app->put('/mazos/{mazo}', MazoController::class . ':cambiarNombreMazo')->add(new AuthMiddleware($jwtSecret));

$app->get('/cartas', CartaController::class . ':listarCartasPorFiltro');

// ESTADISTICA

$app->get('/estadisticas', \App\controllers\EstadisticaController::class . ':getEstadisticas');
 

//PARTIDA


$app->post('/partidas', \App\controllers\PartidaController::class . ':crearPartida')->add(new AuthMiddleware($jwtSecret));


$app->post('/jugadas', \App\controllers\PartidaController::class . ':realizarJugada')->add(new AuthMiddleware($jwtSecret));

//endpoint adicional para verificar si existe el usuario
$app->get('/verificar-usuario/{usuario}', function (Request $request, Response $response, array $args) {
    $usuario = $args['usuario'];
    $existe = UserController::verificarExistenciaUsuario($usuario);

    $response->getBody()->write(json_encode([
        'disponible' => !$existe,
        'mensaje' => $existe ? 'El usuario ya está en uso.' : 'El usuario está disponible.'
    ]));

    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});


$app->run();
