<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

//para manejar solicitudes http
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require_once __DIR__ . '/../controllers/UserController.php';
use App\Controllers\UserController;

require __DIR__ . '/../../vendor/autoload.php';


$app = AppFactory::create(); //crear una instancia de slim para manejar las rutas

// middleware para interceptar las solicitudes y respuestas, y asi validarlas o modificarlas
$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);


//endpoint de prueba hola mundo
$app->get('/', function (Request $request, Response $response, $args) {
    $response->getBody()->write("Hello world!");
    return $response;
});

// endpoint para login
//esto le dice a slim que cuando llega una solicitud POST /login llama al metodo login del usercontroller
$app->post('/login', \App\controllers\UserController::class . ':login');

// Endpoint para registrar un usuario
$app->post('/registro', function (Request $request, Response $response) {
    $data = $request->getParsedBody(); //obtenemos los datos de la peticion
    $resultado = UserController::register($data); //se envian los datos al controloador 

    //respuesta
    $response->getBody()->write(json_encode(['message' => $resultado['mensaje'] ?? $resultado['error']]));
    //retorna la respuesta con el codigo correspondiente
    return $response->withStatus($resultado['status'])->withHeader('Content-Type', 'application/json');
});



$app->run()

?>