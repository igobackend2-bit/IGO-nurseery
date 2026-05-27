//
async function testMailerPhp() {
  console.log("Sending POST to https://igonursery.com/mailer.php...");
  try {
    const res = await fetch('https://igonursery.com/mailer.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: 'igo_nursery_secret_key_2026',
        type: 'status_update',
        to: 'igobackend3@gmail.com',
        order: {
          orderNumber: 'TEST-123',
          status: 'shipped',
          customerName: 'Test Customer',
          estimatedDelivery: '2026-05-30'
        }
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
testMailerPhp();
