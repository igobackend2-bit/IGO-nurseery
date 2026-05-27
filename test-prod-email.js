//
async function testProdEmail() {
  console.log("Sending POST to https://igonursery.com/api/send-email...");
  try {
    const res = await fetch('https://igonursery.com/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'igobackend3@gmail.com',
        subject: 'Test Email from API',
        html: '<h1>Hello!</h1><p>This is a test email.</p>'
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
testProdEmail();
