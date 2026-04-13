<?php
// Returns current logged-in user info (if any)
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['user_id'])) {
    echo json_encode(['logged_in' => false]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, firstName, lastName, email, role FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch();
    if ($user) {
        echo json_encode(['logged_in' => true, 'user' => $user]);
    } else {
        echo json_encode(['logged_in' => false]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['logged_in' => false]);
}
