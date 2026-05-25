import { handler } from '../server/index.js';

export default async function (req, res) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    await handler(req, res);
  } catch (err) {
    console.error('API BRIDGE ERROR:', err);
    if (!res.writableEnded) {
      res.status(500).json({ 
        success: false, 
        message: `API Bridge Error: ${err.message}` 
      });
    }
  }
}
