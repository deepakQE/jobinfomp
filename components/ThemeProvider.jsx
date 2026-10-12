'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children, nonce }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      storageKey="jobinfo-theme"
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  );
}
