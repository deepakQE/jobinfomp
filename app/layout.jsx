import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://jobinfomp.netlify.app'),
  title: 'Jobinfo MP - Latest Government Job Updates',
  description: 'Government job notifications, admit cards, results, and answer keys from official sources.',
  alternates: { canonical: '/' },
  verification: { google: '6XdbSFySiQCE3JxXZJ9WtM15G3Vl7Ej6XrMJ9Rlge8M' },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${notoSansDevanagari.variable}`}>
      <body>
        <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
