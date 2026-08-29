import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'] });
const cormorant = Cormorant_Garamond({ variable: '--font-cormorant', subsets: ['latin'], weight: ['500', '600', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: 'Graduación de Roberto | Confirma tu asistencia',
  description: 'Acompáñame a celebrar mi graduación y confirma aquí tu asistencia.',
  openGraph: {
    title: 'Graduación de Roberto',
    description: 'Confirma tu asistencia y acompáñame a celebrar.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Graduación de Roberto',
    description: 'Confirma tu asistencia y acompáñame a celebrar.',
    images: ['/og.png'],
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
