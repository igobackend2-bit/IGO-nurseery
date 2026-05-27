<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);

// If the request comes from the new fallback payload:
$to = $data['to'] ?? '';
$subject = $data['subject'] ?? 'IGO Nursery Update';
$html = $data['html'] ?? '';

// Fallback for old payloads (just in case)
if (!$to && isset($data['order'])) {
    $to = $data['to'];
    $html = "You have an update for your order #" . $data['order']['orderNumber'] . ". Please check your account.";
}

if (!$to || !$html) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing data']);
    exit;
}

$apiKey = 're_i2DUrcN5_G3tMQoE3VUDt1nzgec8E3vqS';

if ($apiKey === '' || $apiKey === '%%RESEND_API_KEY%%') {
    // Fallback to basic PHP mail() if Resend is not configured
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: IGO Nursery <orders@igonursery.com>" . "\r\n";
    $headers .= "Reply-To: support@igonursery.com" . "\r\n";
    $success = mail($to, $subject, $html, $headers);
    echo json_encode(['success' => $success, 'method' => 'php_mail']);
    exit;
}

// Send via Resend API using cURL for guaranteed delivery
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'from' => 'IGO Nursery <orders@igonursery.com>',
    'to' => [$to],
    'subject' => $subject,
    'html' => $html
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode >= 200 && $httpcode < 300) {
    echo json_encode(['success' => true, 'method' => 'resend_api', 'resend_response' => json_decode($response)]);
} else {
    // If Resend fails (e.g. domain not verified), fallback to PHP mail()
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: IGO Nursery <orders@igonursery.com>" . "\r\n";
    $success = mail($to, $subject, $html, $headers);
    echo json_encode(['success' => $success, 'method' => 'fallback_php_mail', 'resend_error' => json_decode($response)]);
}
?>
