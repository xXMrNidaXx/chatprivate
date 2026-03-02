import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const FREE_DAILY_LIMIT = 5;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        count: 0,
        limit: FREE_DAILY_LIMIT,
        plan: 'free',
        remaining: FREE_DAILY_LIMIT
      });
    }

    const supabase = getSupabase();

    // Get user profile from chatprivate schema
    const { data: profile } = await supabase
      .from('chatprivate.profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    const plan = profile?.plan || 'free';
    const limit = plan === 'pro' ? 999999 : FREE_DAILY_LIMIT;

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('chatprivate.usage')
      .select('message_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const count = usage?.message_count || 0;

    return NextResponse.json({
      count,
      limit,
      plan,
      remaining: plan === 'pro' ? 'unlimited' : Math.max(0, limit - count)
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json({
      count: 0,
      limit: FREE_DAILY_LIMIT,
      plan: 'free',
      remaining: FREE_DAILY_LIMIT
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ success: true, tracked: false });
    }

    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    // Try to insert new usage record
    const { error: insertError } = await supabase
      .from('chatprivate.usage')
      .insert({ 
        user_id: userId, 
        date: today, 
        message_count: 1 
      });

    if (insertError) {
      // Record exists, increment the count
      const { data: current } = await supabase
        .from('chatprivate.usage')
        .select('message_count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      await supabase
        .from('chatprivate.usage')
        .update({ message_count: (current?.message_count || 0) + 1 })
        .eq('user_id', userId)
        .eq('date', today);
    }

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: true, tracked: false });
  }
}
