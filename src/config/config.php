<?php

use Dotenv\Dotenv;

require_once __DIR__ . '/../../vendor/autoload.php';

// Cargar variables de entorno desde el archivo .env
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Forzar que todas las variables estén en $_SERVER y disponibles con getenv()
foreach ($_ENV as $key => $value) {
    $_SERVER[$key] = $value;
    putenv("$key=$value");
}

// Devolver configuración usando $_SERVER como fuente principal
return [
    'db' => [
        'host' => $_SERVER['DB_HOST'] ?? 'localhost',
        'dbname' => $_SERVER['DB_NAME'] ?? 'seminariophp',
        'user' => $_SERVER['DB_USER'] ?? 'root',
        'password' => $_SERVER['DB_PASSWORD'] ?? ''
    ],
    'jwt_secret' => $_SERVER['JWT_SECRET'] ?? 'clave_por_defecto'
];
