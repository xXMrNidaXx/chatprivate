import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const FREE_DAILY_LIMIT = 5;

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      // Anonymous user - return default limits
      return NextResponse.json({
        count: 0,
        limit: FREE_DAILY_LIMIT,
        plan: 'free',
        remaining: FREE_DAILY_LIMIT
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .schema('chatprivate')
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    const plan = profile?.plan || 'free';
    const limit = plan === 'pro' ? Infinity : FREE_DAILY_LIMIT;

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .schema('chatprivate')
      .from('usage')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const count = usage?.count || 0;

    return NextResponse.json({
      count,
      limit,
      plan,
      remaining: plan === 'pro' ? 'unlimited' : Math.max(0, limit - count)
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Failed to get usage' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      // Can't track anonymous users in DB
      return NextResponse.json({ success: true, tracked: false });
    }

    const today = new Date().toISOString().split('T')[0];

    // Upsert usage count
    const { error } = await supabase
      .schema('chatprivate')
      .from('usage')
      .upsert(
        { 
          user_id: userId, 
          date: today, 
          count: 1 
        },
        { 
          onConflict: 'user_id,date',
          ignoreDuplicates: false 
        }
      );

    if (error) {
      // If upsert fails, try incrementing
      await supabase
        .schema('chatprivate')
        .from('usage')
        .update({ count: supabase.rpc('increment_usage') })
        .eq('user_id', userId)
        .eq('date', today);
    }

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: true, tracked: false });
  }
}
