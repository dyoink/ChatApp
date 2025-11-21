import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeScript } from '@/components/ThemeScript';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatApp - Real-time Chat Application",
  description: "A modern real-time chat application built with Next.js 15, featuring neon-themed UI and WebSocket communication.",
  keywords: ["chat", "real-time", "messaging", "nextjs", "websocket"],
  authors: [{ name: "ChatApp Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "ChatApp - Real-time Chat Application",
    description: "A modern real-time chat application with neon-themed UI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatApp - Real-time Chat Application",
    description: "A modern real-time chat application with neon-themed UI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <footer className="w-full py-6 mt-8 text-center">
            <div className="text-base md:text-lg font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]">
              Developed by Nguyễn Vũ Hiệp &bull; Phone: <a href="tel:0789388656" className="underline hover:text-blue-400 transition-colors">0789388656</a>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
