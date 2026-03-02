import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatPrivate - The AI Chat That Forgets',
  description: 'Free AI chat with zero server storage. Your conversations stay in your browser. We literally can\'t read your messages.',
  keywords: ['AI chat', 'privacy', 'ChatGPT alternative', 'private AI', 'no tracking', 'anonymous chat'],
  authors: [{ name: 'RevolutionAI' }],
  openGraph: {
    title: 'ChatPrivate - The AI Chat That Forgets',
    description: 'Free AI chat with zero server storage. Your messages stay in YOUR browser.',
    url: 'https://chat.revolutionai.io',
    siteName: 'ChatPrivate',
    type: 'website',
    images: [
      {
        url: 'https://chat.revolutionai.io/og',
        width: 1200,
        height: 630,
        alt: 'ChatPrivate - Privacy-First AI Chat',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatPrivate - The AI Chat That Forgets',
    description: 'Free AI chat with zero server storage. Your messages stay in YOUR browser.',
    images: ['https://chat.revolutionai.io/og'],
    creator: '@MyBossisAI',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://chat.revolutionai.io',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ChatPrivate',
  applicationCategory: 'CommunicationApplication',
  operatingSystem: 'Web',
  description: 'Privacy-first AI chat with zero server storage. Your conversations stay in your browser.',
  url: 'https://chat.revolutionai.io',
  author: {
    '@type': 'Organization',
    name: 'RevolutionAI',
    url: 'https://revolutionai.io',
  },
  offers: {
    '@type': 'Offer',
    price: '12.00',
    priceCurrency: 'USD',
    priceValidUntil: '2027-12-31',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#7c3aed" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
