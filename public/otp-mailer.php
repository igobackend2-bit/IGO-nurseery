<?php
/**
 * IGO Nursery — OTP Email Sender (Hostinger PHP)
 * Accepts { to, otp, name } and sends the branded OTP email via Resend API.
 * Falls back to PHP mail() if Resend is unavailable.
 *
 * Environment variable (set in Hostinger hPanel → Advanced → PHP Config):
 *   RESEND_API_KEY  — your Resend API key (re_...)
 *   FROM_EMAIL      — verified sender, e.g. "IGO Nursery <noreply@igonursery.com>"
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$to      = trim($data['to'] ?? '');
$otp     = trim($data['otp'] ?? '');
$name    = trim($data['name'] ?? 'Valued Customer');
$subject = $otp ? "$otp is your IGO Nursery verification code" : ($data['subject'] ?? 'IGO Nursery Update');
$htmlIn  = $data['html'] ?? null; // allow pre-built HTML to be passed directly

if (!$to) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required field: to']);
    exit;
}

// ── Read credentials from env (never hardcode!) ──────────────────────────────
$apiKey   = getenv('RESEND_API_KEY') ?: '';
$fromAddr = getenv('FROM_EMAIL')     ?: 'IGO Nursery <noreply@igonursery.com>';

// ── Build OTP email HTML ─────────────────────────────────────────────────────
function buildOtpHtml($name, $otp) {
    $year = date('Y');
    $g = '#2d7a2d'; $dg = '#1b5e20';
    $otpBlock = $otp
        ? "<div style='display:inline-block;background:#f0faf0;border:2px dashed $g;border-radius:16px;padding:24px 52px;margin-bottom:24px;'>
             <div style='font-size:11px;color:#aaa;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;'>Your OTP Code</div>
             <div style='font-size:48px;font-weight:900;color:$dg;letter-spacing:12px;'>$otp</div>
             <div style='font-size:13px;color:#e53935;margin-top:10px;font-weight:600;'>&#9201; Valid for 10 minutes only</div>
           </div>"
        : '';
    return "<!DOCTYPE html><html><head><meta charset='UTF-8'/>
    <meta name='viewport' content='width=device-width,initial-scale=1.0'/>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;}</style>
    </head><body>
    <table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding:24px 16px;'>
    <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);'>
    <tr><td style='background:linear-gradient(135deg,$dg,$g,#4caf50);padding:36px 40px;text-align:center;'>
      <div style='font-size:26px;font-weight:900;color:#fff;letter-spacing:2px;'>&#127807; IGO NURSERY</div>
      <div style='font-size:11px;color:#a5d6a7;letter-spacing:3px;margin-top:4px;'>GROW WITH NATURE</div>
      <div style='background:rgba(255,255,255,0.15);border-radius:12px;padding:14px 24px;margin-top:20px;display:inline-block;'>
        <div style='font-size:20px;font-weight:800;color:#fff;'>&#128274; Verify Your Account</div>
        <div style='font-size:12px;color:#c8e6c9;margin-top:4px;'>One-Time Password</div>
      </div>
    </td></tr>
    <tr><td style='padding:36px 40px;text-align:center;'>
      <p style='font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:8px;'>Hello, " . htmlspecialchars($name) . "!</p>
      <p style='font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;'>Use the OTP below to verify your IGO Nursery account.<br/><strong>Do not share this with anyone.</strong></p>
      $otpBlock
      <div style='background:#fff8e1;border-left:4px solid #ffc107;border-radius:8px;padding:14px 20px;text-align:left;font-size:13px;color:#5d4037;line-height:1.7;max-width:480px;margin:0 auto;'>
        <strong style='display:block;color:#e65100;margin-bottom:4px;'>&#9888;&#65039; Security Notice</strong>
        IGO Nursery will never ask for your OTP via call, chat, or email. If you did not request this, contact us immediately.
      </div>
    </td></tr>
    <tr><td style='background:#f5fbf5;border-top:2px solid #e0f0e0;padding:28px 40px;text-align:center;'>
      <div style='font-size:11px;color:#bbb;line-height:1.9;'>
        &copy; $year IGO Nursery. All rights reserved.<br/>
        &#127760; <a href='https://igonursery.com' style='color:$g;text-decoration:none;'>igonursery.com</a>
      </div>
    </td></tr>
    </table></td></tr></table>
    </body></html>";
}

$html = $htmlIn ?? buildOtpHtml($name, $otp);

// ── Send via Resend API ──────────────────────────────────────────────────────
if ($apiKey && $apiKey !== 're_PASTE_YOUR_KEY_HERE') {
    $payload = json_encode([
        'from'    => $fromAddr,
        'to'      => [$to],
        'subject' => $subject,
        'html'    => $html,
    ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => 'https://api.resend.com/emails',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT        => 15,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        error_log('[IGO OTP] cURL error: ' . $curlErr);
        http_response_code(500);
        echo json_encode(['error' => 'Network error sending email. Please try again.']);
        exit;
    }

    $resendData = json_decode($response, true);

    if ($httpCode >= 200 && $httpCode < 300) {
        error_log('[IGO OTP] ✅ Email sent via Resend to ' . $to . ' | id: ' . ($resendData['id'] ?? 'n/a'));
        echo json_encode(['success' => true, 'method' => 'resend', 'id' => $resendData['id'] ?? null]);
        exit;
    }

    // Resend returned an error — log it and fall through to PHP mail()
    error_log('[IGO OTP] ❌ Resend error ' . $httpCode . ': ' . $response);
}

// ── Fallback: PHP mail() ─────────────────────────────────────────────────────
error_log('[IGO OTP] ⚠️  Falling back to PHP mail() for ' . $to);
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: IGO Nursery <noreply@igonursery.com>\r\n";
$headers .= "Reply-To: support@igonursery.com\r\n";

$sent = mail($to, $subject, $html, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'method' => 'php_mail']);
} else {
    error_log('[IGO OTP] ❌ PHP mail() also failed for ' . $to);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email. Please try again or contact support.']);
}
?>
