'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

const MODELS = [
  { id: 'qwen3:8b', name: 'Qwen 8B', description: 'Fast & capable' },
  { id: 'gemma3:4b', name: 'Gemma 4B', description: 'Quick responses' },
  { id: 'qwen3-coder:30b', name: 'Qwen Coder 30B', description: 'Best for code' },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('qwen3:8b');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ count: 0, limit: 5 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load messages from localStorage
    const saved = localStorage.getItem('chatprivate_messages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Save messages to localStorage (privacy-first!)
    localStorage.setItem('chatprivate_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (usage.count >= usage.limit) {
      alert('Daily limit reached! Upgrade to Pro for unlimited.');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          model,
          history: messages.slice(-10) // Last 10 for context
        }),
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">🔒 ChatPrivate</h1>
            <p className="text-purple-300 text-sm">Your messages stay in YOUR browser</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-800">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
          <span className="text-green-400">🔒</span>
          <span className="text-green-300 text-sm">
            Messages stored locally only. We never see your conversations.
          </span>
        </div>

        {/* Chat Messages */}
        <div className="bg-white/5 backdrop-blur rounded-xl p-4 h-[60vh] overflow-y-auto mb-4 border border-white/10">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-4xl mb-4">💬</p>
              <p>Start a conversation with any AI model</p>
              <p className="text-sm mt-2">Your messages never leave your browser</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[80%] p-3 rounded-xl ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-gray-100'
              }`}>
                {msg.model && (
                  <span className="text-xs text-purple-300 block mb-1">{msg.model}</span>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-gray-400 animate-pulse">Thinking...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
          <div>
            {usage.count}/{usage.limit} messages today
            {usage.count >= usage.limit && (
              <a href="https://buy.stripe.com/bJe4gs2hP8O86Pi1l6eQM02" 
                 className="ml-2 text-purple-400 hover:underline">
                Upgrade to Pro →
              </a>
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
