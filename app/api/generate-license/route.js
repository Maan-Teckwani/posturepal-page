import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function generateLicenseKey() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

export async function POST(req) {
  try {
    const { payment_id, email } = await req.json();
    if (!payment_id || !email) {
      return new Response(JSON.stringify({ error: 'Missing payment_id or email' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({ error: 'Database insert failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: true, licenseKey }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Generate license error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
