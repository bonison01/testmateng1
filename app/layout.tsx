import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MapProvider } from "@/components/context/MapContext";

import { DarkModeProvider } from "@/components/DarkModeContext";
import DarkModeWrapper from "@/components/DarkModeWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mateng",
  description: "Explore with Mateng",
  icons: {
    icon: "/favi.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <DarkModeProvider>
            <DarkModeWrapper>
              <div className="w-[100vw] custom-bg relative">
                <div className="lines">
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                </div>
                <div className="bg-overlay"></div>
                <MapProvider>{children}</MapProvider>
              </div>
            </DarkModeWrapper>
          </DarkModeProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
