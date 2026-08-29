import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'] });
const cormorant = Cormorant_Garamond({ variable: '--font-cormorant', subsets: ['latin'], weight: ['500', '600', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: 'Graduación de Adela | Arquitectura',
  description: 'Acompaña a Adela Sánchez Dueñas a celebrar su graduación en Arquitectura.',
  openGraph: {
    title: 'Graduación de Adela Sánchez Dueñas',
    description: 'Celebremos juntos su graduación en Arquitectura.',
    images: ['/adela-arquitectura.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Graduación de Adela Sánchez Dueñas',
    description: 'Celebremos juntos su graduación en Arquitectura.',
    images: ['/adela-arquitectura.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${manrope.variable} ${cormorant.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
