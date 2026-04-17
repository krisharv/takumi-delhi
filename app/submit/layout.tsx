import type { Metadata } from 'next';
import { Syne, JetBrains_Mono } from 'next/font/google';
import '../globals.css';

const syne = Syne({ subsets: ['latin'], weight: ['400','600','700','800'], variable: '--font-syne', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Register & Submit — Takumi Delhi',
  description: 'Register your team and submit your project for Takumi Delhi Hackathon.',
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
