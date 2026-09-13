<?php

declare(strict_types=1);

header('Content-Type: application/json');

function respond(bool $success, string $message, int $status = 200): never
{
    http_response_code($status);
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    respond(false, 'Invalid JSON data.', 400);
}

$host = trim((string) ($data['host'] ?? ''));
$port = (int) ($data['port'] ?? 3306);
$database = trim((string) ($data['database'] ?? ''));
$username = (string) ($data['username'] ?? '');
$password = (string) ($data['password'] ?? '');

if ($host === '' || $database === '' || $username === '' || $port < 1 || $port > 65535) {
    respond(false, 'Complete database connection details are required.', 400);
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $database)) {
    respond(false, 'Database name may contain only letters, numbers, and underscores.', 400);
}

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $serverPdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $username, $password, $options);
    $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4", $username, $password, $options);
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS todos (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            completed TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    respond(true, 'Database connection verified and todo table is ready.');
} catch (PDOException $e) {
    respond(false, 'Could not connect or create the database. Check the server details and permissions.', 500);
}