// api/send-otp.js — Vercel Serverless Function
// Handles OTP signup and resend for IGO Nursery customer-auth page.
// Uses Supabase Admin SDK to generate the real OTP, then sends it via Resend.
//
// Required Vercel environment variables:
//   RESEND_API_KEY           — from https://resend.com/api-keys
//   FROM_EMAIL               — e.g. "IGO Nursery <noreply@igonursery.com>" (must be a verified Resend domain)
//   SUPABASE_URL             — your Supabase project URL (same as VITE_SUPABASE_URL without VITE_ prefix)
//   SUPABASE_SERVICE_ROLE_KEY — service role key from Supabase dashboard (Settings → API)

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ─── HTML OTP email builder ────────────────────────────────────────────────────
function buildOtpEmailHtml(name, otp) {
  const G  = '#2d7a2d';
  const DG = '#1b5e20';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;}</style>
  </head><body>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
  <tr><td style="background:linear-gradient(135deg,${DG},${G},#4caf50);padding:36px 40px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:2px;">🌿 IGO NURSERY</div>
    <div style="font-size:11px;color:#a5d6a7;letter-spacing:3px;margin-top:4px;">GROW WITH NATURE</div>
    <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:14px 24px;margin-top:20px;display:inline-block;">
      <div style="font-size:20px;font-weight:800;color:#fff;">🔐 Verify Your Account</div>
      <div style="font-size:12px;color:#c8e6c9;margin-top:4px;">One-Time Password</div>
    </div>
  </td></tr>
  <tr><td style="padding:36px 40px;text-align:center;">
    <p style="font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Hello, ${name || 'Valued Customer'}!</p>
    <p style="font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;">Use the OTP below to verify your IGO Nursery account.<br/><strong>Do not share this with anyone.</strong></p>
    <div style="display:inline-block;background:#f0faf0;border:2px dashed ${G};border-radius:16px;padding:24px 52px;margin-bottom:24px;">
      <div style="font-size:11px;color:#aaa;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Your OTP Code</div>
      <div style="font-size:48px;font-weight:900;color:${DG};letter-spacing:12px;">${otp}</div>
      <div style="font-size:13px;color:#e53935;margin-top:10px;font-weight:600;">⏱ Valid for 10 minutes only</div>
    </div>
    <div style="background:#fff8e1;border-left:4px solid #ffc107;border-radius:8px;padding:14px 20px;text-align:left;font-size:13px;color:#5d4037;line-height:1.7;max-width:480px;margin:0 auto;">
      <strong style="display:block;color:#e65100;margin-bottom:4px;">⚠️ Security Notice</strong>
      IGO Nursery will never ask for your OTP via call, chat, or email. If you did not request this, contact us immediately.
    </div>
  </td></tr>
  <tr><td style="background:#f5fbf5;border-top:2px solid #e0f0e0;padding:28px 40px;text-align:center;">
    <div style="font-size:11px;color:#bbb;line-height:1.9;">
      © ${new Date().getFullYear()} IGO Nursery. All rights reserved.<br/>
      🌐 <a href="https://igonursery.com" style="color:${G};text-decoration:none;">igonursery.com</a>
    </div>
  </td></tr>
  </table></td></tr></table>
  </body></html>`;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ─── Validate env vars ────────────────────────────────────────────────────
  const RESEND_API_KEY          = process.env.RESEND_API_KEY;
  const FROM_EMAIL              = process.env.FROM_EMAIL || 'IGO Nursery <onboarding@resend.dev>';
  const SUPABASE_URL            = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!RESEND_API_KEY || RESEND_API_KEY === 're_PASTE_YOUR_KEY_HERE') {
    console.error('[send-otp] ❌ RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Email service not configured. Contact support.' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.error('[send-otp] ❌ Supabase admin credentials not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    return res.status(500).json({ error: 'Auth service not configured. Contact support.' });
  }

  const { action, email, password, name, phone } = req.body || {};

  if (!email) return res.status(400).json({ error: 'email is required' });
  if (action !== 'signup' && action !== 'resend') {
    return res.status(400).json({ error: 'action must be "signup" or "resend"' });
  }

  try {
    // ─── Init Supabase Admin ────────────────────────────────────────────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const resend = new Resend(RESEND_API_KEY);

    let otp;
    let userId;

    if (action === 'signup') {
      if (!password) return res.status(400).json({ error: 'password is required for signup' });

      // Generate signup link (extracts real OTP from Supabase)
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { data: { name: name || '', phone: phone || '' } }
      });

      if (linkErr) {
        // User already exists → generate a fresh OTP instead
        if (linkErr.message?.toLowerCase().includes('already registered') ||
            linkErr.message?.toLowerCase().includes('already been registered')) {
          // Resend signup OTP for existing-but-unconfirmed user
          const { data: resendData, error: resendErr } = await supabase.auth.admin.generateLink({
            type: 'signup',
            email,
          });
          if (resendErr) throw new Error(resendErr.message);
          otp = resendData.properties.email_otp;
          userId = resendData.user?.id;
        } else {
          throw new Error(linkErr.message);
        }
      } else {
        otp = linkData.properties.email_otp;
        userId = linkData.user?.id;

        // Upsert customer profile row
        if (userId) {
          await supabase.from('customers').upsert({
            id: userId,
            email,
            name: name || '',
            phone: phone || ''
          }, { onConflict: 'id' });
        }
      }
    } else {
      // action === 'resend'
      const { data: resendData, error: resendErr } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
      });
      if (resendErr) throw new Error(resendErr.message);
      otp = resendData.properties.email_otp;
    }

    if (!otp) throw new Error('Could not generate OTP. Please try again.');

    // ─── Send via Resend ────────────────────────────────────────────────────
    const html = buildOtpEmailHtml(name || 'Valued Customer', otp);
    const { data: emailData, error: emailErr } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `${otp} is your IGO Nursery verification code`,
      html,
    });

    if (emailErr) throw new Error(emailErr.message);

    console.log(`[send-otp] ✅ OTP email sent to ${email} | action=${action} | resend_id=${emailData?.id}`);
    return res.status(200).json({
      success: true,
      message: action === 'signup'
        ? 'Account created! A 6-digit verification code has been sent to your email.'
        : 'A new verification code has been sent to your email.'
    });

  } catch (err) {
    console.error('[send-otp] ❌ Error:', err.message);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
