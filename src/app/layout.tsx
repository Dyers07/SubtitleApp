// src/app/layout.tsx - Layout corrigé avec Portal et styles
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dyers Captions - Sous-titrage automatique IA',
  description: 'Créez des sous-titres professionnels pour vos vidéos avec l\'IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} theme-transition antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {/* ✅ Contenu principal */}
            <div id="app-root">
              {children}
            </div>
            
            {/* ✅ Portal pour les modals */}
            <div id="portal-root"></div>
            
            {/* ✅ Notifications */}
            <Toaster
              position="top-right"
              richColors
              closeButton
              theme="system"
              expand={true}
              toastOptions={{
                classNames: {
                  toast: 'theme-transition',
                  title: 'theme-transition',
                  description: 'theme-transition',
                  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200',
                  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}