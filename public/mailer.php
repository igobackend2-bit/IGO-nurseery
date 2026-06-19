<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);

$to      = $data['to'] ?? '';
$subject = $data['subject'] ?? 'IGO Nursery Update';
$html    = $data['html'] ?? '';

if (!$to || !$html) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing data']);
    exit;
}

// ── Read API key from environment (NEVER hardcode credentials) ────────────────
// Set RESEND_API_KEY in Hostinger hPanel → Advanced → PHP Configuration
$apiKey   = getenv('RESEND_API_KEY') ?: '';
$fromAddr = getenv('FROM_EMAIL') ?: 'IGO Nursery <noreply@igonursery.com>';

if ($apiKey === '' || $apiKey === 're_PASTE_YOUR_KEY_HERE') {
    error_log('[IGO mailer.php] WARNING: RESEND_API_KEY not set, falling back to PHP mail()');
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: IGO Nursery <orders@igonursery.com>\r\n";
    $headers .= "Reply-To: support@igonursery.com\r\n";
    $success = mail($to, $subject, $html, $headers);
    echo json_encode(['success' => $success, 'method' => 'php_mail']);
    exit;
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => 'https://api.resend.com/emails',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode([
        'from'    => $fromAddr,
        'to'      => [$to],
        'subject' => $subject,
        'html'    => $html,
    ]),
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT => 15,
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode >= 200 && $httpcode < 300) {
    error_log('[IGO mailer.php] ✅ Email sent via Resend to ' . $to);
    echo json_encode(['success' => true, 'method' => 'resend_api', 'resend_response' => json_decode($response)]);
} else {
    error_log('[IGO mailer.php] ❌ Resend error ' . $httpcode . ': ' . $response);
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: IGO Nursery <orders@igonursery.com>\r\n";
    $success = mail($to, $subject, $html, $headers);
    echo json_encode(['success' => $success, 'method' => 'fallback_php_mail', 'resend_error' => json_decode($response)]);
}
?>
