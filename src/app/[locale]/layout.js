import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from "@/context/authContext";
import LayoutWrapper from "@/components/layoutwraper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "STAY FiT",
  description: "Lift. Leap. Conquer. Repeat.",
};

export default async function RootLayout({
  children,
  params
}) {
  const { locale } = await params;

  // Check if the locale is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Fetch the messages for the current locale
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased subtle-brand-background `}
      >
        <AuthProvider>
        <NextIntlClientProvider messages={messages}>
          
          
        <LayoutWrapper>{children}</LayoutWrapper>
         
          
        </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}