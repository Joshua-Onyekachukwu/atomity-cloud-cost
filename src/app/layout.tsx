import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title:       'Atomity — Cloud Cost Intelligence',
  description: 'Drill-down Kubernetes cost explorer across clusters, namespaces, and pods.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}