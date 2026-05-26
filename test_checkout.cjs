const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  try {
    await page.goto('http://localhost:5173/store');
    await page.waitForSelector('button:has-text("Add to Cart")');
    const buttons = await page.$$('button:has-text("Add to Cart")');
    if (buttons.length > 0) { await buttons[0].click(); }
    await page.goto('http://localhost:5173/checkout');
    await page.waitForSelector('input[name="firstName"]');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="state"]', 'TS');
    await page.fill('input[name="zipCode"]', '12345');
    await page.click('text=UPI (Google Pay, PhonePe, Paytm)');
    await page.click('button:has-text("Place Order")');
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error('TEST SCRIPT ERROR:', e);
  } finally {
    await browser.close();
  }
})();
