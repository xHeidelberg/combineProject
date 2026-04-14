<?php
header('Content-Type: application/json');
session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    $parsed = parse_url($origin);
    $host = $parsed['host'] ?? '';
    if (in_array($host, ['127.0.0.1', 'localhost'])) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    }
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['logged_in' => false]);
    exit;
}

require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->prepare(
        'SELECT id, firstName, lastName, email, role FROM users WHERE id = :id AND is_active = 1 LIMIT 1'
    );
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // Session
        session_destroy();
        echo json_encode(['logged_in' => false]);
        exit;
    }

    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id'        => $user['id'],
            'firstName' => $user['firstName'],
            'lastName'  => $user['lastName'],
            'email'     => $user['email'],
            'role'      => $user['role'],   // admin | pharmacist | staff | patient
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['logged_in' => false, 'error' => 'Server error']);
}