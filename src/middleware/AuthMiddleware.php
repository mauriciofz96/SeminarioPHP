<?php

namespace App\middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Psr7\Response as SlimResponse;

class AuthMiddleware
{
    private $jwtSecret;

    public function __construct($jwtSecret)
    {
        $this->jwtSecret = $jwtSecret;
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $this->unauthorizedResponse("Token no proporcionado.");
        }

        $token = $matches[1];

        try {
            if (!$this->jwtSecret) {
                throw new \RuntimeException("JWT_SECRET no configurado.");
            }
            error_log("CLAVE USADA EN AUTH MIDDLEWARE: " . $this->jwtSecret);
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            error_log("TOKEN DECODED: " . print_r($decoded, true));

            // Validación opcional de expiración (la mayoría de las libs ya la hacen)
            if (isset($decoded->exp) && $decoded->exp < time()) {
                return $this->unauthorizedResponse("El token ha expirado.");
            }

            // Guardamos el usuario decodificado en el request
            $request = $request->withAttribute('usuario', $decoded);

            return $handler->handle($request);

        } catch (\Firebase\JWT\ExpiredException $e) {
            return $this->unauthorizedResponse("El token ha expirado.");
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return $this->unauthorizedResponse("Firma del token inválida.");
        } catch (\Exception $e) {
            return $this->unauthorizedResponse("Error al procesar el token: " . $e->getMessage());
        }
    }

    private function unauthorizedResponse(string $mensaje): Response
    {
        $response = new SlimResponse();
        $response->getBody()->write(json_encode([
            'error' => 'Acceso no autorizado',
            'mensaje' => $mensaje
        ]));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(401);
    }
}
