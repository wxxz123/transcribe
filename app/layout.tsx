import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transcribe Upload',
  description: 'Audio transcription with Soniox',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh bg-white text-gray-900">
        <main className="mx-auto max-w-screen-md p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}

