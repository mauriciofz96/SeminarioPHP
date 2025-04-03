<?php

return [
    'db' => [
        'host' => $_ENV['DB_HOST'] ?? 'localhost',
        'dbname' => $_ENV['DB_NAME'] ?? 'seminariophp',
        'user' => $_ENV['DB_USER'] ?? 'root',
        'password' => $_ENV['DB_PASSWORD'] ?? ''
    ],
    'jwt_secret' => $_ENV['JWT_SECRET'] ?? 'clave_por_defecto'
];
