<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cargar autoload y dotenv
require __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;
$dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
$dotenv->load();

// Forzar variables en $_SERVER
foreach ($_ENV as $key => $value) {
    $_SERVER[$key] = $value;
}

// Validar que JWT_SECRET esté presente
if (!isset($_SERVER['JWT_SECRET'])) {
    http_response_code(500);
    echo json_encode([
        "error" => "Configuración inválida",
        "mensaje" => "JWT_SECRET no está definido en \$_SERVER"
    ]);
    exit;
}

$jwtSecret = $_SERVER['JWT_SECRET'];

// Slim y controladores
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require_once __DIR__ . '/../controllers/UserController.php';
use App\Controllers\UserController;
use App\Controllers\MazoController;
use App\middleware\AuthMiddleware;

$app = AppFactory::create();

// Middleware global de Slim
$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

// Endpoint de prueba
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write("Hello world!");
    return $response;
});

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

//Endpoint para obtener la informacion del usuario
$app->get('/usuarios/{usuario}', function (Request $request, Response $response, array $args) {
    $usuario = $args['usuario']; // Este parámetro no es necesario ahora si lo tomamos del token
    $token = $request->getHeader('Authorization')[0] ?? ''; // Obtener el token del encabezado
    $token = str_replace('Bearer ', '',$token); //saco el bearer del token
    $token = trim($token); //saco espacios en blanco
    
    // Llamar a la función de UserController para obtener información del usuario usando el token
    $resultado = UserController::obtenerInformacionUsuario($token);

    // Verificar la respuesta del controlador
    if ($resultado['status'] === 200) {
        $response->getBody()->write(json_encode($resultado['data']));
    } else {
        $response->getBody()->write(json_encode(['error' => $resultado['mensaje']]));
    }

    return $response->withHeader('Content-Type', 'application/json')->withStatus($resultado['status']);
});

// Endpoint para cambiar info de usuario logeado
$app->put('/usuarios/{usuario}', function (Request $request, Response $response, array $args) {
    // Obtener el usuario autenticado desde el middleware
    $usuarioAutenticado = $request->getAttribute('usuario');

    // Obtener el usuario que intenta editar
    $usuario = $args['usuario'];

    // Verificar que el usuario autenticado coincida con el usuario de la URL
    if ($usuarioAutenticado !== $usuario) {
        // Responder con error 403 si no se tiene permiso
        $response->getBody()->write(json_encode(['error' => 'No tienes permiso para editar este usuario']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
    }

    // Obtener los datos del cuerpo de la solicitud
    $data = $request->getParsedBody();

    // Llamar al controlador para actualizar la información
    $resultado = UserController::actualizarInformacion($usuario, $data, $usuarioAutenticado);

    // Verificar la respuesta del controlador y devolver el mensaje adecuado
    if ($resultado['status'] === 200) {
        // Si la actualización es exitosa, devolver el mensaje
        $response->getBody()->write(json_encode(['mensaje' => $resultado['mensaje']]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        // Si hubo un error, devolver el mensaje de error
        $response->getBody()->write(json_encode(['error' => $resultado['mensaje']]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($resultado['status']);
    }
});



// Endpoint para crear mazo (requiere autenticación)
$app->post('/mazos', MazoController::class . ':crearMazo')->add(new AuthMiddleware($jwtSecret));

// Endpoint para borrar mazo si no ha partipado de ninguna partida (requiere autenticación)
$app->delete('/mazos/{id}', MazoController::class . ':borrarMazo')->add(new AuthMiddleware($jwtSecret));

// Endpoint para obtener mazos de un usuario (requiere autenticación)
$app->get('/usuarios/{id}/mazos', MazoController::class . ':obtenerMazos')->add(new AuthMiddleware($jwtSecret));

$app->run();
