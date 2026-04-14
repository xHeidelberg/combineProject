<?php
// debug endpoint: /api/check_user.php?email=someone@example.com
// if papa deploy ni sir isama sa .gitignore (check_user.php)

header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$email = $_GET['email'] ?? null;
if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Email required']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, firstName, lastName, email, created_at FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();
    if ($user) {
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
