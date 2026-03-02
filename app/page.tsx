'use client';

import { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import type { User } from '@supabase/supabase-js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

const MODELS = [
  { id: 'qwen3:8b', name: '⚡ Fast', description: 'Quick responses' },
  { id: 'gemma3:4b', name: '💡 Balanced', description: 'Good all-rounder' },
  { id: 'qwen3-coder:30b', name: '🧑‍💻 Coder', description: 'Best for code' },
];

const SAMPLE_PROMPTS = [
  "Explain quantum computing like I'm 5",
  "Write a Python script to rename files",
  "What are the pros and cons of remote work?",
  "Help me write a professional email",
];

export default function Home() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('qwen3:8b');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ count: 0, limit: 10 });
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const saved = localStorage.getItem('chatprivate_messages');
    if (saved) {
      setMessages(JSON.parse(saved));
      setShowChat(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatprivate_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;
    if (!user && usage.count >= usage.limit) {
      setShowAuth(true);
      return;
    }

    setShowChat(true);
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, model, history: messages.slice(-10) }),
      });
      const data = await res.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response || 'Error generating response',
        model: MODELS.find(m => m.id === model)?.name
      };
      setMessages(prev => [...prev, assistantMessage]);
      setUsage(prev => ({ ...prev, count: prev.count + 1 }));
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatprivate_messages');
    setShowChat(false);
  };

  const exportChat = () => {
    const md = messages.map(m => `**${m.role}:** ${m.content}`).join('\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-export.md';
    a.click();
  };

  // Auth modal
  if (showAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button 
            onClick={() => setShowAuth(false)}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back
          </button>
          <div className="bg-white/10 backdrop-blur rounded-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Get Unlimited Access
            </h2>
            <p className="text-gray-400 text-center mb-6 text-sm">
              Sign in to unlock unlimited messages
            </p>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#8b5cf6',
                      brandAccent: '#7c3aed',
                    },
                  },
                },
              }}
              providers={[]}
              redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
              theme="dark"
            />
          </div>
        </div>
      </main>
    );
  }

  // Landing page
  if (!showChat && messages.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-white font-bold text-xl">🔒 ChatPrivate</span>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-green-400 text-sm">✓ Pro</span>
              <button onClick={signOut} className="text-gray-400 hover:text-white text-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Sign In →
            </button>
          )}
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-block bg-green-500/20 border border-green-500/50 rounded-full px-4 py-1 mb-6">
            <span className="text-green-400 text-sm font-medium">🔒 100% Private — Nothing Stored</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Free AI Chat<br/><span className="text-purple-400">No Account Needed</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Chat with powerful AI models instantly. <strong className="text-white">No sign-up, no tracking, no data collection.</strong> Your conversations never leave your browser.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={() => setShowChat(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-purple-600/30"
            >
              🚀 Start Chatting Free
            </button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm mb-16">
            <span className="flex items-center gap-1">🔓 No account required</span>
            <span className="flex items-center gap-1">🚫 No data stored</span>
            <span className="flex items-center gap-1">📤 Export anytime</span>
            <span className="flex items-center gap-1">💨 10 free msgs/day</span>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-bold text-white mb-2">1. Just Start Typing</h3>
              <p className="text-gray-400 text-sm">No sign-up, no email, no waiting. Ask anything.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-bold text-white mb-2">2. Stays in Your Browser</h3>
              <p className="text-gray-400 text-sm">Messages stored locally. We literally cannot see them.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">📤</div>
              <h3 className="text-lg font-bold text-white mb-2">3. Export or Delete</h3>
              <p className="text-gray-400 text-sm">Download your chat or clear it anytime. You're in control.</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Free</h3>
              <p className="text-4xl font-bold text-white mb-4">$0</p>
              <ul className="text-gray-300 space-y-2 mb-6 text-left">
                <li>✓ 10 messages/day</li>
                <li>✓ All AI models</li>
                <li>✓ Local storage</li>
                <li>✓ Export chats</li>
              </ul>
              <button onClick={() => setShowChat(true)} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold">
                Start Free
              </button>
            </div>
            <div className="bg-purple-600/20 border border-purple-500/50 rounded-xl p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">UNLIMITED</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-4xl font-bold text-white mb-4">$12<span className="text-lg text-gray-400">/mo</span></p>
              <ul className="text-gray-300 space-y-2 mb-6 text-left">
                <li>✓ <strong className="text-white">Unlimited</strong> messages</li>
                <li>✓ All AI models</li>
                <li>✓ Priority responses</li>
                <li>✓ Support the project</li>
              </ul>
              <button onClick={() => setShowAuth(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold">
                Get Pro
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8 text-gray-500 text-sm">
          <p>Built by <a href="https://revolutionai.io" className="text-purple-400 hover:underline">RevolutionAI</a></p>
          <p className="mt-2">
            <a href="https://twitter.com/MyBossisAI" className="hover:text-purple-400">@MyBossisAI</a>
          </p>
        </div>
      </main>
    );
  }

  // Chat interface
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🔒 ChatPrivate</h1>
            <p className="text-purple-300 text-xs">Your messages stay in YOUR browser</p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="text-green-400 text-sm">✓ Pro</span>
            ) : (
              <button onClick={() => setShowAuth(true)} className="text-purple-400 hover:text-purple-300 text-sm">
                Upgrade
              </button>
            )}
            <button onClick={clearChat} className="text-gray-400 hover:text-white text-sm">← Home</button>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 text-sm">
              {MODELS.map(m => (<option key={m.id} value={m.id} className="bg-slate-800">{m.name}</option>))}
            </select>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-xl p-4 h-[65vh] overflow-y-auto mb-4 border border-white/10">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-16">
              <p className="text-5xl mb-4">💬</p>
              <p className="text-lg mb-6">What would you like to know?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {SAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:text-white transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-100'}`}>
                {msg.model && <span className="text-xs text-purple-300 block mb-1">{msg.model}</span>}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask anything..." className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-500" />
          <button onClick={() => sendMessage()} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50">Send</button>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
          <div>
            {user ? (
              <span className="text-green-400">✓ Unlimited messages</span>
            ) : (
              <>
                {usage.count}/{usage.limit} messages today
                {usage.count >= usage.limit && (
                  <button onClick={() => setShowAuth(true)} className="ml-2 text-purple-400 hover:underline">Get unlimited →</button>
                )}
              </>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={exportChat} className="hover:text-white">Export</button>
            <button onClick={clearChat} className="hover:text-white">Clear</button>
          </div>
        </div>
      </div>
    </main>
  );
}
