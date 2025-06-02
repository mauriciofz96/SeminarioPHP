<?php

namespace App\models;
use PDO;
use PDOException;

class DB {
    private static $connection;

    public static function getConnection() {
        if (!self::$connection) {
            
            $config = require __DIR__ . '/../config/config.php';
            
            $host = $config['db']['host'];
            $dbname = $config['db']['dbname'];
            $user = $config['db']['user'];
            $pass = $config['db']['password'];

            try {
                self::$connection = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
                self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                die(json_encode(['error' => $e->getMessage()]));
            }
        }

        return self::$connection;
    }
}