import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'https://ollama2.revolutionai.io';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Model mapping for Groq fallback
const GROQ_MODEL_MAP: Record<string, string> = {
  'qwen3:8b': 'llama-3.3-70b-versatile',
  'gemma3:1b': 'llama-3.1-8b-instant',
  'gemma3:4b': 'llama-3.1-8b-instant',
};

async function callOllama(prompt: string, model: string) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: model || 'qwen3:8b', prompt, stream: false }),
  });
  
  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
  const data = await response.json();
  return data.response;
}

async function callGroq(messages: Array<{role: string, content: string}>, model: string) {
  if (!GROQ_API_KEY) throw new Error('No Groq API key');
  
  const groqModel = GROQ_MODEL_MAP[model] || 'llama-3.3-70b-versatile';
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages,
      max_tokens: 2048,
    }),
  });
  
  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json();
  return data.choices[0]?.message?.content;
}

export async function POST(request: NextRequest) {
  try {
    const { message, model, history } = await request.json();

    // Build conversation for both formats
    const messages = [
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];
    
    const prompt = messages.map((m: any) => 
      m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`
    ).join('\n') + '\nAssistant:';

    let responseText: string;
    
    // Try Ollama first, fall back to Groq
    try {
      responseText = await callOllama(prompt, model);
    } catch (ollamaError) {
      console.log('Ollama failed, trying Groq fallback...');
      responseText = await callGroq(messages, model);
    }

    return NextResponse.json({
      response: responseText || 'Sorry, I could not generate a response.',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
