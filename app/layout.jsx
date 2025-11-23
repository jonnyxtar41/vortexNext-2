import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5631795975075125"
            crossOrigin="anonymous"
        />
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}