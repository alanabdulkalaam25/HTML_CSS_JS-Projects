<?php

declare(strict_types=1);

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {

    /*
    |--------------------------------------------------------------------------
    | GET - Read all todos
    |--------------------------------------------------------------------------
    */

    if ($method === 'GET') {

        $stmt = $pdo->query(
            'SELECT id, title, description, completed, created_at
             FROM todos
             ORDER BY id DESC'
        );

        $todos = $stmt->fetchAll();

        foreach ($todos as &$todo) {
            $todo['id'] = (int) $todo['id'];
            $todo['completed'] = (bool) $todo['completed'];
        }

        echo json_encode([
            'success' => true,
            'todos' => $todos
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST - Create a todo
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($data)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data.'
            ]);

            exit;
        }

        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');

        if ($title === '') {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Title is required.'
            ]);

            exit;
        }

        if (mb_strlen($title) > 255) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Title must be 255 characters or less.'
            ]);

            exit;
        }

        $stmt = $pdo->prepare(
            'INSERT INTO todos (title, description)
             VALUES (:title, :description)'
        );

        $stmt->execute([
            ':title' => $title,
            ':description' => $description
        ]);

        $id = (int) $pdo->lastInsertId();

        $stmt = $pdo->prepare(
            'SELECT id, title, description, completed, created_at
             FROM todos
             WHERE id = :id'
        );

        $stmt->execute([
            ':id' => $id
        ]);

        $todo = $stmt->fetch();

        $todo['id'] = (int) $todo['id'];
        $todo['completed'] = (bool) $todo['completed'];

        http_response_code(201);

        echo json_encode([
            'success' => true,
            'todo' => $todo
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PUT - Update a todo
    |--------------------------------------------------------------------------
    */

    if ($method === 'PUT') {

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($data)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data.'
            ]);

            exit;
        }

        $id = filter_var(
            $data['id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if (!$id || $id < 1) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid todo ID.'
            ]);

            exit;
        }

        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');

        if ($title === '') {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Title is required.'
            ]);

            exit;
        }

        if (mb_strlen($title) > 255) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Title must be 255 characters or less.'
            ]);

            exit;
        }

        $stmt = $pdo->prepare(
            'UPDATE todos
             SET title = :title,
                 description = :description
             WHERE id = :id'
        );

        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':id' => $id
        ]);

        if ($stmt->rowCount() === 0) {

            $check = $pdo->prepare(
                'SELECT id FROM todos WHERE id = :id'
            );

            $check->execute([
                ':id' => $id
            ]);

            if (!$check->fetch()) {
                http_response_code(404);

                echo json_encode([
                    'success' => false,
                    'message' => 'Todo not found.'
                ]);

                exit;
            }
        }

        $stmt = $pdo->prepare(
            'SELECT id, title, description, completed, created_at
             FROM todos
             WHERE id = :id'
        );

        $stmt->execute([
            ':id' => $id
        ]);

        $todo = $stmt->fetch();

        $todo['id'] = (int) $todo['id'];
        $todo['completed'] = (bool) $todo['completed'];

        echo json_encode([
            'success' => true,
            'todo' => $todo
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PATCH - Toggle completed status
    |--------------------------------------------------------------------------
    */

    if ($method === 'PATCH') {

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($data)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data.'
            ]);

            exit;
        }

        $id = filter_var(
            $data['id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if (!$id || $id < 1) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid todo ID.'
            ]);

            exit;
        }

        $completed = !empty($data['completed']) ? 1 : 0;

        $stmt = $pdo->prepare(
            'UPDATE todos
             SET completed = :completed
             WHERE id = :id'
        );

        $stmt->execute([
            ':completed' => $completed,
            ':id' => $id
        ]);

        if ($stmt->rowCount() === 0) {

            $check = $pdo->prepare(
                'SELECT id FROM todos WHERE id = :id'
            );

            $check->execute([
                ':id' => $id
            ]);

            if (!$check->fetch()) {
                http_response_code(404);

                echo json_encode([
                    'success' => false,
                    'message' => 'Todo not found.'
                ]);

                exit;
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Todo updated.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE - Delete a todo
    |--------------------------------------------------------------------------
    */

    if ($method === 'DELETE') {

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($data)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data.'
            ]);

            exit;
        }

        if (($data['clear_completed'] ?? false) === true) {

            $stmt = $pdo->prepare(
                'DELETE FROM todos
                 WHERE completed = :completed'
            );

            $stmt->execute([
                ':completed' => 1
            ]);

            echo json_encode([
                'success' => true,
                'deleted' => $stmt->rowCount()
            ]);

            exit;
        }

        $id = filter_var(
            $data['id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if (!$id || $id < 1) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid todo ID.'
            ]);

            exit;
        }

        $stmt = $pdo->prepare(
            'DELETE FROM todos
             WHERE id = :id'
        );

        $stmt->execute([
            ':id' => $id
        ]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Todo not found.'
            ]);

            exit;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Todo deleted.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Unsupported method
    |--------------------------------------------------------------------------
    */

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);
} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Database operation failed.'
    ]);
} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred.'
    ]);
}
