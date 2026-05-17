import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const key = typeof body?.key === 'string' ? body.key.toUpperCase().trim() : null;

    if (!key || key.length < 19) {
      return Response.json({ valid: false, message: 'Invalid license key format.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('licenses')
      .select('key, device_count')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ valid: false, message: 'License check failed. Try again.' }, { status: 500 });
    }

    if (!data) {
      return Response.json({ valid: false, message: 'License key not found.' });
    }

    if (data.device_count >= 2) {
      return Response.json({ valid: false, message: 'License already activated on 2 devices. Contact support@posturepal.io to reset.' });
    }

    const { error: updateError } = await supabase
      .from('licenses')
      .update({ device_count: data.device_count + 1 })
      .eq('key', key);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return Response.json({ valid: false, message: 'Activation failed. Try again.' }, { status: 500 });
    }

    return Response.json({ valid: true, message: 'License activated.' });
  } catch (err) {
    console.error('validate-license error:', err);
    return Response.json({ valid: false, message: 'Server error. Try again.' }, { status: 500 });
  }
}
