import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lecture Pod — AI-Powered Lecture Recording & Learning Ecosystem',
  description:
    'Capture classroom lectures offline with your Raspberry Pi 4 device. Automatically sync over Wi-Fi, and transform audio into structured AI notes, flashcards, quizzes, and revision sheets.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#FAFAFA]`}>
        {children}
      </body>
    </html>
  );
}
