<?php
header('Content-Type: application/json');
session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowCors = false;
if ($origin) {
    $parsed = parse_url($origin);
    $host = $parsed['host'] ?? '';
    if (in_array($host, ['127.0.0.1', 'localhost'])) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        $allowCors = true;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($allowCors) {
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
    }
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

require_once __DIR__ . '/config.php';
$action = $input['action'];

try {
    if ($action === 'login') {
        $email    = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            echo json_encode(['success' => false, 'message' => 'Missing credentials']);
            exit;
        }

        $stmt = $pdo->prepare(
            'SELECT id, firstName, lastName, email, password, role
             FROM users
             WHERE email = :email AND is_active = 1
             LIMIT 1'
        );
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }

        $stored        = $user['password'] ?? '';
        $authenticated = false;

        if ($stored && password_verify($password, $stored)) {
            $authenticated = true;
        } elseif ($stored && hash_equals($stored, $password)) {
            // Legacy plain-text fallback
            $authenticated = true;
        }

        if ($authenticated) {
            session_regenerate_id(true); // prevent session fixation
            $_SESSION['user_id']    = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name']  = $user['firstName'] ?? '';
            $_SESSION['user_role']  = $user['role'];   // ← store role in session

            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'role'    => $user['role'],
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
        }
        exit;

    } elseif ($action === 'signup') {
        $firstName = trim($input['firstName'] ?? '');
        $lastName  = trim($input['lastName']  ?? '');
        $email     = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $password  = $input['password'] ?? '';

        if (!$firstName || !$lastName || !$email || !$password) {
            echo json_encode(['success' => false, 'message' => 'Missing signup fields']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email already registered']);
            exit;
        }

        $hash   = password_hash($password, PASSWORD_DEFAULT);
        $insert = $pdo->prepare(
            'INSERT INTO users (firstName, lastName, email, password, role, created_at)
             VALUES (:fn, :ln, :email, :pw, "patient", NOW())'
        );
        $insert->execute([
            'fn'    => $firstName,
            'ln'    => $lastName,
            'email' => $email,
            'pw'    => $hash,
        ]);

        echo json_encode(['success' => true, 'message' => 'Account created']);
        exit;

    } elseif ($action === 'logout') {
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out']);
        exit;

    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit;
}