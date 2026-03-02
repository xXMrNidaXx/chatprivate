export default function Terms() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-purple-400 hover:text-purple-300 mb-8 block">← Back to ChatPrivate</a>
        
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert">
          <p className="text-gray-300 mb-6">
            <strong className="text-white">Last updated:</strong> March 2026
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Service Description</h2>
          <p className="text-gray-300 mb-6">
            ChatPrivate provides AI chat services with a focus on privacy. We don't store your conversations — they remain in your browser's local storage.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Acceptable Use</h2>
          <p className="text-gray-300 mb-6">You agree not to use ChatPrivate for:</p>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li>• Illegal activities</li>
            <li>• Generating harmful or abusive content</li>
            <li>• Attempting to circumvent usage limits</li>
            <li>• Automated/bot access without permission</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Subscriptions</h2>
          <p className="text-gray-300 mb-6">
            Pro subscriptions are billed monthly through Stripe. You can cancel anytime. Refunds are handled on a case-by-case basis.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Limitations</h2>
          <p className="text-gray-300 mb-6">
            AI responses may not always be accurate. ChatPrivate is provided "as is" without warranties. We're not liable for decisions made based on AI outputs.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Changes</h2>
          <p className="text-gray-300 mb-6">
            We may update these terms. Continued use after changes means you accept the new terms.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contact</h2>
          <p className="text-gray-300 mb-6">
            Questions? Email <a href="mailto:legal@revolutionai.io" className="text-purple-400 hover:underline">legal@revolutionai.io</a>
          </p>
        </div>
      </div>
    </main>
  );
}
