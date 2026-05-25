<?php
// mailer.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Security key to prevent unauthorized access
$secret = 'igo_nursery_secret_key_2026';
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['secret']) || $data['secret'] !== $secret) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$type = $data['type'] ?? '';
$to = $data['to'] ?? '';
$order = $data['order'] ?? null;

if (!$to || !$order) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing data']);
    exit;
}

function getProgressHTML($status) {
    $statuses = ['processing', 'shipped', 'out_for_delivery', 'delivered'];
    $labels = ['Confirmed', 'Shipped', 'Out For Delivery', 'Delivered'];
    
    $currentIndex = array_search($status, $statuses);
    if ($currentIndex === false) $currentIndex = 0;

    $html = '<div style="margin: 40px 0; display: table; width: 100%; table-layout: fixed;">';
    foreach ($labels as $index => $label) {
        $color = $index <= $currentIndex ? '#ff4081' : '#444';
        
        $html .= '<div style="display: table-cell; text-align: center; position: relative;">';
        
        // Progress Line (only between dots)
        if ($index < count($labels) - 1) {
            $lineColor = $index < $currentIndex ? '#ff4081' : '#444';
            $html .= '<div style="position: absolute; top: 7px; left: 50%; width: 100%; height: 2px; background: ' . $lineColor . '; z-index: 1;"></div>';
        }
        
        // Dot
        $html .= '<div style="width: 16px; height: 16px; background: ' . $color . '; border-radius: 50%; margin: 0 auto 10px; position: relative; z-index: 2; box-shadow: 0 0 0 4px #111;"></div>';
        
        // Label
        $html .= '<div style="color: ' . $color . '; font-size: 11px; font-weight: bold; text-transform: uppercase;">' . $label . '</div>';
        
        $html .= '</div>';
    }
    $html .= '</div>';
    return $html;
}

function getOrderItemsHTML($items) {
    $html = '<div style="margin: 30px 0;">';
    $html .= '<h3 style="color: #fff; text-align: center; letter-spacing: 2px; font-weight: normal; margin-bottom: 20px;">YOUR ORDER</h3>';
    
    foreach ($items as $item) {
        $image = isset($item['product']['image']) ? $item['product']['image'] : (isset($item['image']) ? $item['image'] : '');
        $name = isset($item['product']['name']) ? $item['product']['name'] : (isset($item['name']) ? $item['name'] : 'Product');
        $price = isset($item['price']) ? number_format($item['price'], 2) : '0.00';
        $qty = isset($item['quantity']) ? $item['quantity'] : 1;
        $total = number_format((float)$price * (int)$qty, 2);

        $html .= '<div style="display: flex; align-items: center; margin-bottom: 15px; background: #1a1a1a; padding: 15px; border-radius: 8px;">';
        if ($image) {
            // Force absolute URL for images if they are relative
            if (strpos($image, 'http') !== 0) {
                $image = 'https://igonursery.com' . $image;
            }
            $html .= '<img src="' . $image . '" style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px; margin-right: 20px;" />';
        }
        $html .= '<div style="color: #fff; flex-grow: 1;">';
        $html .= '<div style="font-weight: bold; font-size: 15px; margin-bottom: 8px;">' . htmlspecialchars($name) . '</div>';
        $html .= '<div style="color: #aaa; font-size: 13px;">Quantity: ' . $qty . ' &nbsp;|&nbsp; Total: Rs: ' . $total . '</div>';
        $html .= '</div>';
        $html .= '</div>';
    }
    
    $html .= '</div>';
    return $html;
}

$subject = 'Update on your IGO Nursery Order ' . $order['orderNumber'];
$bannerTitle = 'HAPPINESS<br/>COMING YOUR WAY';
if ($type === 'order_confirmation') {
    $subject = 'Order Confirmed: ' . $order['orderNumber'];
    $bannerTitle = 'ORDER<br/>CONFIRMED';
} else if ($type === 'status_update') {
    if ($order['status'] === 'delivered') {
        $bannerTitle = 'YOUR ORDER HAS<br/>BEEN DELIVERED';
    } else if ($order['status'] === 'shipped') {
         $bannerTitle = 'YOUR ORDER IS<br/>SHIPPED';
    }
}

$statusStr = $order['status'];
$customerName = htmlspecialchars($order['customerName'] ?? 'Customer');
$orderNumber = htmlspecialchars($order['orderNumber'] ?? '');
$deliveryEstimate = isset($order['estimatedDelivery']) ? date('D, d M', strtotime($order['estimatedDelivery'])) : '3-4 working days';

// Generate Email HTML
$message = '
<html>
<head>
  <style>
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #111; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111; padding: 30px 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .banner { background: linear-gradient(135deg, #ff4081, #ff79b0); padding: 40px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
    .banner h1 { margin: 0; color: #fff; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
    .content { text-align: center; font-size: 16px; line-height: 1.6; color: #ddd; }
    .highlight { background: #ffebee; padding: 2px 6px; border-radius: 4px; color: #c2185b; font-weight: bold; }
    .totals { border-top: 1px solid #333; border-bottom: 1px solid #333; margin-top: 30px; padding: 20px 0; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; color: #ccc; }
    .grand-total { display: flex; justify-content: space-between; margin-top: 15px; font-size: 20px; font-weight: bold; color: #fff; }
    .btn { display: inline-block; background-color: #ff4081; color: #fff; padding: 15px 40px; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 30px; letter-spacing: 1px; font-size: 16px; }
    .scam-alert { background-color: #3e1616; color: #ffcdd2; padding: 20px; border-radius: 8px; margin-top: 40px; font-size: 14px; text-align: left; border-left: 4px solid #f44336; }
    .scam-alert h4 { margin: 0 0 15px 0; color: #ffeb3b; font-size: 16px; }
    .scam-alert ul { margin: 0; padding-left: 20px; }
    .scam-alert li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="color: #fff; margin:0; letter-spacing: 2px; font-weight: 300;">IGO NURSERY</h2>
    </div>
    
    <div class="banner">
      <h1>' . $bannerTitle . '</h1>
    </div>
    
    <div class="content">
      <p>Hi ' . $customerName . ',</p>
      <p>Your package with order ID <span class="highlight">' . $orderNumber . '</span> is ' . ($statusStr == 'processing' ? 'confirmed' : 'being processed') . ' and will reach your doorstep by <strong>' . $deliveryEstimate . '</strong>.</p>
      
      ' . getProgressHTML($statusStr) . '
      
      ' . getOrderItemsHTML($order['items'] ?? []) . '
      
      <div class="totals">
        <div class="total-row"><span>Subtotal (Including Taxes)</span><span>Rs: ' . number_format($order['subtotal'] ?? 0, 2) . '</span></div>
        <div class="total-row"><span>Delivery Charge</span><span>Rs: ' . number_format($order['deliveryCharge'] ?? 0, 2) . '</span></div>
        <div class="grand-total"><span>Grand total</span><span>Rs: ' . number_format($order['total'] ?? 0, 2) . '</span></div>
      </div>
      
      <a href="https://igonursery.com/account/profile" class="btn">TRACK YOUR ORDER ></a>
    </div>
    
    <div class="scam-alert">
      <h4>⚠️ Scam Alert: Beware of Fraudulent Activities! ⚠️</h4>
      <p>Scammers may try to reach you pretending to be from IGO Nursery team. Please know this is not us!</p>
      <p>Here is what you should know:</p>
      <ul>
        <li>We will never call you with offers or free gifts.</li>
        <li>We will never ask you for payments through links.</li>
      </ul>
      <p style="margin-top: 15px; font-weight: bold;">Keep Shopping Smart!<br/>Team IGO Nursery</p>
    </div>
  </div>
</body>
</html>
';

$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: IGO Nursery <orders@igonursery.com>" . "\r\n";
$headers .= "Reply-To: support@igonursery.com" . "\r\n";

$success = mail($to, $subject, $message, $headers);

echo json_encode(['success' => $success]);
?>
