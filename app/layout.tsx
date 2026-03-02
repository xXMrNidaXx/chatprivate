import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatPrivate - Privacy-First AI Chat',
  description: 'Chat with GPT-4, Claude, Gemini & more. We never store your conversations.',
  openGraph: {
    title: 'ChatPrivate - Privacy-First AI Chat',
    description: 'Chat with any AI model. Your messages stay in YOUR browser.',
    url: 'https://chat.revolutionai.io',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
