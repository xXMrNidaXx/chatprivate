import { NextRequest, NextResponse } from 'next/server';

// Simple event tracking - logs to console and can be extended to analytics service
export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();
    
    const timestamp = new Date().toISOString();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Log event (can be piped to analytics later)
    console.log(JSON.stringify({
      timestamp,
      event,
      data,
      ip: ip.split(',')[0], // First IP if multiple
      userAgent: userAgent.substring(0, 100),
    }));

    return NextResponse.json({ tracked: true });
  } catch (error) {
    return NextResponse.json({ tracked: false });
  }
}
