import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "./StoreProvider";
import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes'

import ClientProvider from "./ClientProvider";
import { NotificationsProvider } from "@/context/notifications-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medicare+",
  description: "Medicare+ Portal",
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
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <StoreProvider>
              <NotificationsProvider>
                <ClientProvider>{children}</ClientProvider>
                <Toaster />
              </NotificationsProvider>
            </StoreProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}