<?php

use Dotenv\Dotenv;

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();


foreach ($_ENV as $key => $value) {
    $_SERVER[$key] = $value;
    putenv("$key=$value");
}

return [
    'db' => [
        'host' => $_SERVER['DB_HOST'] ?? 'localhost',
        'dbname' => $_SERVER['DB_NAME'] ?? 'seminariophp',
        'user' => $_SERVER['DB_USER'] ?? 'root',
        'password' => $_SERVER['DB_PASSWORD'] ?? ''
    ],
    'jwt_secret' => $_SERVER['JWT_SECRET'] ?? 'clave_por_defecto'
];
