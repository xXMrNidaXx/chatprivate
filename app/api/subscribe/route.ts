import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Fallback: just log it if no Supabase
      console.log('New subscriber:', email);
      return NextResponse.json({ success: true, message: 'Subscribed!' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into subscribers table
    const { error } = await supabase
      .schema('chatprivate')
      .from('subscribers')
      .upsert({ email, created_at: new Date().toISOString() }, { onConflict: 'email' });

    if (error) {
      console.error('Subscribe error:', error);
      // Don't fail - just log
    }

    return NextResponse.json({ success: true, message: 'Subscribed!' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
