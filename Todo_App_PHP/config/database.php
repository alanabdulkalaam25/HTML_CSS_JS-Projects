<?php

declare(strict_types=1);

$connection = json_decode($_SERVER['HTTP_X_TODO_CONNECTION'] ?? '', true);

if (!is_array($connection)) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Database connection details are required.'
    ]);
    exit;
}

$host = trim((string) ($connection['host'] ?? ''));
$port = (int) ($connection['port'] ?? 3306);
$dbname = trim((string) ($connection['database'] ?? ''));
$username = (string) ($connection['username'] ?? '');
$password = (string) ($connection['password'] ?? '');
$charset = 'utf8mb4';

if ($host === '' || $dbname === '' || $username === '' || $port < 1 || $port > 65535) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Complete database connection details are required.'
    ]);
    exit;
}

$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    http_response_code(500);

    header('Content-Type: application/json');

    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed.'
    ]);

    exit;
}
