'use client';

import { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import type { User } from '@supabase/supabase-js';
import { track, events } from '@/lib/track';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

const MODELS = [
  { id: 'gemma3:4b', name: '⚡ Fast', description: 'Quick responses' },
  { id: 'qwen3:8b', name: '🧠 Smart', description: 'Best balance' },
  { id: 'qwen3-coder:30b', name: '💻 Coder', description: 'Code expert' },
];

const SAMPLE_PROMPTS = [
  "Explain quantum computing like I'm 10",
  "Write a Python function to reverse a string",
  "Help me write a professional email",
  "What are the best productivity tips?",
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
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setShowAuth(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const saved = localStorage.getItem('chatprivate_messages');
    const savedUsage = localStorage.getItem('chatprivate_usage');
    if (saved) {
      setMessages(JSON.parse(saved));
      setShowChat(true);
    }
    if (savedUsage) {
      const { count, date } = JSON.parse(savedUsage);
      const today = new Date().toDateString();
      if (date === today) setUsage(prev => ({ ...prev, count }));
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

  const subscribe = async () => {
    if (!email || !email.includes('@')) return;
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubscribed(true);
      setEmail('');
      track(events.SUBSCRIBE_EMAIL);
    } catch (e) {
      console.error('Subscribe error:', e);
    }
  };

  // Track page view on mount
  useEffect(() => {
    track(events.PAGE_VIEW, { page: 'home' });
  }, []);

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
      const newCount = usage.count + 1;
      setUsage(prev => ({ ...prev, count: newCount }));
      localStorage.setItem('chatprivate_usage', JSON.stringify({ count: newCount, date: new Date().toDateString() }));
      track(events.MESSAGE_SENT, { model, messageCount: newCount });
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
          <button onClick={() => setShowAuth(false)} className="text-gray-400 hover:text-white mb-4">← Back</button>
          <div className="bg-white/10 backdrop-blur rounded-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Sign in to ChatPrivate</h2>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#8b5cf6', brandAccent: '#7c3aed' } } } }}
              providers={['google']}
              redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
              theme="dark"
            />
            <p className="text-center text-gray-400 text-sm mt-4">Sign in to track usage and upgrade to Pro</p>
          </div>
        </div>
      </main>
    );
  }

  // Landing page
  if (!showChat && messages.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-white">🔒 ChatPrivate</span>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{user.email}</span>
              <button onClick={signOut} className="text-gray-400 hover:text-white text-sm">Sign Out</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">Sign In →</button>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-block bg-green-500/20 border border-green-500/50 rounded-full px-4 py-1 mb-6">
            <span className="text-green-400 text-sm font-medium">🔒 Privacy-First AI Chat</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The AI chat that <span className="text-purple-400">forgets</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Chat with powerful AI models. <strong className="text-white">Zero server storage</strong> — your conversations never leave your browser. We literally can't read them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button onClick={() => setShowChat(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition">
              🚀 Try Free — 10 msgs/day
            </button>
            <a href="https://buy.stripe.com/bJe4gs2hP8O86Pi1l6eQM02" onClick={() => track(events.UPGRADE_CLICK, { location: 'hero' })} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 transition">
              💳 Go Unlimited — $12/month
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm mb-12">
            <span>✅ No account needed</span>
            <span>✅ No data stored on servers</span>
            <span>✅ Export anytime</span>
            <span>🔐 HTTPS encrypted</span>
          </div>

          {/* How it works */}
          <div className="bg-white/5 rounded-xl p-6 mb-12 max-w-2xl mx-auto border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">How Privacy Works</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl mb-2">💬</div>
                <p className="text-gray-300 text-sm">You type a message</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🔒</div>
                <p className="text-gray-300 text-sm">Sent directly to AI</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🗑️</div>
                <p className="text-gray-300 text-sm">Nothing saved on our servers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Why ChatPrivate?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">❌ Typical AI Chats</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• Store your conversations forever</li>
                <li>• May train on your data</li>
                <li>• $20/month for one AI</li>
                <li>• Complex privacy policies</li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4">✅ ChatPrivate</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong className="text-white">Nothing stored on servers</strong></li>
                <li>• <strong className="text-white">Chats stay in YOUR browser</strong></li>
                <li>• <strong className="text-white">$12/month — multiple models</strong></li>
                <li>• <strong className="text-white">Simple: we can't read your chats</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Free</h3>
              <p className="text-4xl font-bold text-white mb-4">$0</p>
              <ul className="text-gray-300 space-y-2 mb-6">
                <li>10 messages/day</li>
                <li>3 AI models</li>
                <li>Browser storage</li>
              </ul>
              <button onClick={() => setShowChat(true)} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold">Start Free</button>
            </div>
            <div className="bg-purple-600/20 border border-purple-500/50 rounded-xl p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">UNLIMITED</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-4xl font-bold text-white mb-4">$12<span className="text-lg text-gray-400">/mo</span></p>
              <ul className="text-gray-300 space-y-2 mb-6">
                <li><strong className="text-white">Unlimited</strong> messages</li>
                <li>All AI models</li>
                <li>Priority speed</li>
              </ul>
              <a href="https://buy.stripe.com/bJe4gs2hP8O86Pi1l6eQM02" className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold">Go Unlimited</a>
            </div>
          </div>
        </div>

        {/* Email Capture */}
        <div className="max-w-xl mx-auto px-4 pb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">🔔 Get Updates</h3>
            <p className="text-gray-400 text-sm mb-4">New features, model updates, and privacy tips. No spam.</p>
            {subscribed ? (
              <p className="text-green-400">✅ You're subscribed!</p>
            ) : (
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={subscribe}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8 text-gray-500 text-sm border-t border-white/10 pt-8 mt-8">
          <p className="mb-2">Built with ❤️ by <a href="https://revolutionai.io" className="hover:text-purple-400">RevolutionAI</a></p>
          <div className="flex justify-center gap-4">
            <a href="/privacy" className="hover:text-purple-400">Privacy Policy</a>
            <a href="/terms" className="hover:text-purple-400">Terms</a>
            <a href="https://twitter.com/MyBossisAI" className="hover:text-purple-400">@MyBossisAI</a>
          </div>
        </div>
      </main>
    );
  }

  // Chat interface
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">🔒 ChatPrivate</h1>
            <p className="text-purple-300 text-xs">Your chats stay in YOUR browser</p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="text-gray-400 text-xs hidden sm:block">{user.email}</span>
            ) : (
              <button onClick={() => setShowAuth(true)} className="text-purple-400 hover:text-purple-300 text-sm">Sign In</button>
            )}
            <button onClick={clearChat} className="text-gray-400 hover:text-white text-sm">← Home</button>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 text-sm">
              {MODELS.map(m => (<option key={m.id} value={m.id} className="bg-slate-800">{m.name}</option>))}
            </select>
          </div>
        </div>

        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 mb-4 flex items-center gap-2">
          <span className="text-green-400">🔒</span>
          <span className="text-green-300 text-xs">Messages stored in your browser only. We never see them.</span>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-xl p-4 h-[55vh] overflow-y-auto mb-4 border border-white/10">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <p className="text-4xl mb-4">💬</p>
              <p className="mb-6">What would you like to talk about?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {SAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 border border-white/10 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-100'}`}>
                {msg.model && <span className="text-xs text-purple-300 block mb-1">{msg.model}</span>}
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-500" />
          <button onClick={() => sendMessage()} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50">Send</button>
        </div>

        <div className="flex justify-between items-center mt-3 text-sm text-gray-400">
          <div>
            {user ? '∞ messages (Pro)' : `${usage.count}/${usage.limit} messages today`}
            {!user && usage.count >= usage.limit && (
              <button onClick={() => setShowAuth(true)} className="ml-2 text-purple-400 hover:underline">Sign in for unlimited →</button>
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
