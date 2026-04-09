import type { Metadata } from 'next';
import { OptionsDataProvider } from '@/context/OptionsDataContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'GEX Dashboard B3',
  description: 'Gamma Exposure Analytics — Opções B3/Bovespa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <OptionsDataProvider>{children}</OptionsDataProvider>
      </body>
    </html>
  );
}
