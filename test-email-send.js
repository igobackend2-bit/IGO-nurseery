//
import { sendOrderStatusUpdateEmail } from './services/orderEmailService.js';
import fetch from 'node-fetch';

// Mock fetch for the serverless function since we are in node
global.fetch = fetch;

async function testEmail() {
  console.log("Sending test email...");
  try {
    const result = await sendOrderStatusUpdateEmail('igobackend3@gmail.com', 'Test Customer', 'ORD-1234', 'shipped');
    console.log("Email result:", result);
  } catch (err) {
    console.error("Email failed:", err);
  }
}

testEmail();
