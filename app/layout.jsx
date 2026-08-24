import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Jobinfo MP - Latest Govt Job Notifications',
  description: 'Latest MP Police, MPESB, MPPSC, Railway, and SSC job notifications, admit cards, and results.',
  keywords: [
    'MP government jobs',
    'MP latest jobs',
    'MP admit card',
    'MP result',
    'MP answer key',
    'MP recruitment 2026',
    'Sarkari result MP',
  ],
  verification: {
    google: '3SHWAfPdpGoxmz6I0RADAixxHUEUBAO172yeGoaEHp4',
    
  },
};

export default function RootLayout({ children }) {
  const googleTagId = 'G-PTPYQDG5ME';
  const clarityId = process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_ID;

  return (
    <html lang="en">
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleTagId}');`}
        </Script>
      </head>
      <body className="bg-white text-gray-900 antialiased">
        {clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`}
          </Script>
        )}
        {children}
      </body>
    </html>
  );
}
