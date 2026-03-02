import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'https://ollama2.revolutionai.io';

export async function POST(request: NextRequest) {
  try {
    const { message, model, history } = await request.json();

    // Build conversation context
    let prompt = '';
    if (history && history.length > 0) {
      prompt = history.map((m: any) => 
        m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`
      ).join('\n') + '\n';
    }
    prompt += `User: ${message}\nAssistant:`;

    // Call Ollama (no logging of message content!)
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'qwen3:8b',
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();

    // Return only the response (privacy-first: we don't log/store the message)
    return NextResponse.json({
      response: data.response || 'Sorry, I could not generate a response.',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
