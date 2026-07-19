import './globals.css';

export const metadata = {
  title: 'Jobinfo MP - Latest Govt Job Notifications',
  description: 'Latest MP Police, MPESB, MPPSC, Railway, and SSC job notifications, admit cards, and results.',
  verification: {
    google: '6XdbSFySiQCE3JxXZJ9WtM15G3Vl7Ej6XrMJ9Rlge8M',
    
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}