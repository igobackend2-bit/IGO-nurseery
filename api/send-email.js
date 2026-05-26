// api/send-email.js — Vercel Serverless Function
// Handles all transactional emails for IGO Nursery using Resend.
// Replaces: server/index.js (localhost-only) and public/mailer.php (PHP, non-executable on Vercel).
//
// Required Vercel environment variables:
//   RESEND_API_KEY   — from https://resend.com/api-keys
//   FROM_EMAIL       — e.g. "IGO Nursery <noreply@igonursery.com>"  (must be a verified Resend domain)
//   ADMIN_EMAIL      — admin notification recipient, e.g. igonursery@gmail.com

import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, html, text } = req.body || {};

  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing required fields: to, subject' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[send-email] RESEND_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.FROM_EMAIL || 'IGO Nursery <onboarding@resend.dev>';

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
    });

    if (error) throw new Error(error.message);

    console.log(`[send-email] ✅ Email sent to ${to} | id: ${data?.id}`);
    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[send-email] ❌ Resend error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
