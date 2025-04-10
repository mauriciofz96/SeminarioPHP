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

// Endpoint para crear mazo (requiere autenticación)
$app->post('/mazos', MazoController::class . ':crearMazo')->add(new AuthMiddleware($jwtSecret));
error_log("CLAVE CARGADA DESDE .env: " . $jwtSecret);

$app->run();
