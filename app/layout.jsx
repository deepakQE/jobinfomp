import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Jobinfo MP - Latest Govt Job Notifications',
  description: 'Latest MP Police, MPESB, MPPSC, Railway, and SSC job notifications, admit cards, and results.',
  verification: {
    google: '6XdbSFySiQCE3JxXZJ9WtM15G3Vl7Ej6XrMJ9Rlge8M',
    
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body className="bg-bg text-primary antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
