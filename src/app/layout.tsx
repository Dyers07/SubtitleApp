import type { Metadata } from 'next';
import { Inter, Montserrat, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

/* –– Fonts --------------------------------------------------------- */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
  display: 'swap',
});
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: 'Video Subtitle Editor',
  description: 'Ajoutez et personnalisez des sous-titres sur vos vidéos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${montserrat.variable} ${poppins.variable}`}
    >
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
