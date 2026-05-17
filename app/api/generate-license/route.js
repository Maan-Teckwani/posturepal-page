import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

function generateLicenseKey() {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

export async function POST(req) {
  try {
    const { payment_id, email } = await req.json();

    if (!payment_id || !email) {
      return new Response(JSON.stringify({ success: false, error: 'Missing payment_id or email' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: existing } = await supabase
      .from('licenses')
      .select('key')
      .eq('payment_id', payment_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, licenseKey: existing.key }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    }

    const licenseKey = generateLicenseKey();

    const { error: insertError } = await supabase.from('licenses').insert({
      key: licenseKey,
      email,
      payment_id,
      device_count: 0,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return new Response(JSON.stringify({ success: false, error: 'Database insert failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const downloadMac = process.env.DOWNLOAD_URL_MAC || 'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal.dmg';
    const downloadWin = process.env.DOWNLOAD_URL_WIN || 'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal-Setup.exe';

    await resend.emails.send({
      from: 'PosturePal <license@posturepal.io>',
      to: email,
      subject: 'Your PosturePal License Key 🦐',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #f8f5ed; color: #121212;">
          <div style="background: #ffffff; border: 2px solid #000000; box-shadow: 5px 5px 0 rgba(0,0,0,.08); padding: 36px;">
            <h1 style="font-size: 32px; margin-bottom: 8px;">Thanks for buying PosturePal!</h1>
            <p style="margin: 0 0 24px; color: #555555;">Your license key is ready. Use it to activate the desktop app on up to 2 devices.</p>
            <p style="font-weight: 700; margin-bottom: 12px;">Your License Key</p>
            <div style="background: #d4f57a; border: 2px solid #000; padding: 22px 18px; font-size: 24px; letter-spacing: 6px; text-align: center; font-family: monospace; margin-bottom: 32px;">
              ${licenseKey}
            </div>
            <p style="font-weight: 700; margin-bottom: 12px;">Download PosturePal</p>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
              <a href="${downloadMac}" style="display: block; background: #000; color: #fff; text-decoration: none; padding: 14px 20px; text-align: center; font-weight: 700;">Download for Mac</a>
              <a href="${downloadWin}" style="display: block; background: #000; color: #fff; text-decoration: none; padding: 14px 20px; text-align: center; font-weight: 700;">Download for Windows</a>
            </div>
            <p style="font-size: 14px; color: #666666; margin: 0;">Need help? Reply to this email and our support team will assist you.</p>
          </div>
          <p style="font-size: 12px; color: #888888; text-align: center; margin-top: 22px;">PosturePal © 2026</p>
        </div>
      `
    });

    return new Response(JSON.stringify({ success: true, licenseKey }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Generate license error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
