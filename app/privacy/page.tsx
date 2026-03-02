export default function Privacy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-purple-400 hover:text-purple-300 mb-8 block">← Back to ChatPrivate</a>
        
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert">
          <p className="text-gray-300 mb-6">
            <strong className="text-white">Last updated:</strong> March 2026
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">The Short Version</h2>
          <p className="text-gray-300 mb-6">
            <strong className="text-green-400">We don't store your conversations.</strong> Period. Your messages are processed in real-time and never saved to our servers. They exist only in your browser's local storage, which you control.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">What We Collect</h2>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li>• <strong className="text-white">Account info</strong> (if you sign in): Email address for authentication</li>
            <li>• <strong className="text-white">Usage counts</strong>: Number of messages per day (not the content)</li>
            <li>• <strong className="text-white">Payment info</strong>: Handled securely by Stripe (we never see your card)</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">What We DON'T Collect</h2>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li>• ❌ Your conversation content</li>
            <li>• ❌ Your chat history</li>
            <li>• ❌ Your prompts or AI responses</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">How It Works</h2>
          <p className="text-gray-300 mb-6">
            When you send a message, it goes directly to our AI provider, gets processed, and the response is sent back to you. We act as a pass-through — your messages flow through but are never stored.
          </p>
          <p className="text-gray-300 mb-6">
            Your chat history is saved in your browser's <code className="bg-white/10 px-2 py-1 rounded">localStorage</code>. This means:
          </p>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li>• Only you can see it</li>
            <li>• Clear your browser data = chats gone</li>
            <li>• Export anytime with our Export button</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contact</h2>
          <p className="text-gray-300 mb-6">
            Questions? Email us at <a href="mailto:privacy@revolutionai.io" className="text-purple-400 hover:underline">privacy@revolutionai.io</a>
          </p>
        </div>
      </div>
    </main>
  );
}
