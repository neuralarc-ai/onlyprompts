import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "@/components/ClientWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OnlyPrompts - AI Prompt Gallery",
  description: "Discover and share the best AI prompts for creative inspiration",
  icons: {
    icon: [
      { url: "/nanologo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/nanologo.jpg", sizes: "16x16", type: "image/jpeg" },
    ],
    shortcut: "/nanologo.jpg",
    apple: "/nanologo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
