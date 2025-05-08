import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "@/components/ui/sonner";

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
  description:
    "Expert fitness coaching in Saudi Arabia tailored to your goals. Professional personal training, nutrition planning, and motivation to transform your life. Start your fitness journey today.",
};

export default async function RootLayout({ children, params }) {
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
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
