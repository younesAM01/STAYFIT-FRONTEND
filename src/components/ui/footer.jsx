import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InstagramIcon, MessageCircle } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/stayfit11.png";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Footer() {
  const t = useTranslations("HomePage.Footer");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on the home page
  const isHomePage = pathname === `/${locale}` || pathname === "/";

  const currentYear = new Date().getFullYear();

  // Function to scroll to contact section with navigation handling
  const scrollToContact = () => {
    if (isHomePage) {
      // If already on home page, just scroll
      const contactSection = document.getElementById("contact-section");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If not on home page, navigate to home page with a query parameter
      router.push(`/${locale}?scrollTo=contact`);
    }
  };

  // Effect to handle scrolling after navigation
  useEffect(() => {
    // Check if we should scroll to contact section after navigation
    if (isHomePage && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const scrollTarget = urlParams.get("scrollTo");

      if (scrollTarget === "contact") {
        // Remove the query parameter from URL without triggering a page reload
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Scroll to contact section after a short delay to ensure the page is fully loaded
        setTimeout(() => {
          const contactSection = document.getElementById("contact-section");
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 500);
      }
    }
  }, [pathname, isHomePage]);

  return (
    <footer className="w-full bg-[#0d111a] text-white py-12">
      <div className="container mx-auto px-4">
        {/* Newsletter Subscription */}
        {/* <div className="flex flex-col items-center justify-center mb-12 text-center">
          <h3 className="text-xl font-bold mb-4 text-[#B4E90E]">
            {t("newsletter.title")}
          </h3>
          <div className="flex flex-col sm:flex-row w-full max-w-sm gap-2">
            <Input
              type="email"
              placeholder={t("newsletter.placeholder")}
              className="bg-[#1a1f2e] border-[#2a2f3e] rounded-3xl text-white"
            />
            <Button className="bg-[#B4E90E] hover:bg-[#a3d80d] text-[#0d111a] font-bold rounded-3xl">
              {t("newsletter.button")}
            </Button>
          </div>
        </div> */}

        {/* Footer Content - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#1a1f2e]">
          {/* Left Column - Logo and Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Image src={logo} alt="STAY FiT" width={130} height={40} />
            <p className="text-gray-400 mb-4">{t("description")}</p>
            <p className="text-gray-500 text-sm">
              {t("copyright", { year: currentYear })}
            </p>
          </div>

          {/* Middle Column - Links */}
          <div className="flex flex-col items-center">
            <h4 className="font-bold text-lg mb-4">{t("quickLinks.title")}</h4>
            <nav className="flex flex-col space-y-2 items-center md:items-center">
              <Link
                href="#"
                className="text-gray-400 hover:text-[#B4E90E] transition-colors"
              >
                {t("quickLinks.about")}
              </Link>
              <button
                onClick={() => router.push(`/${locale}/pricing`)}
                className="text-gray-400 hover:text-[#B4E90E] transition-colors text-center md:text-left cursor-pointer"
              >
                {t("quickLinks.pricing")}
              </button>
              <Link
                href="#"
                className="text-gray-400 hover:text-[#B4E90E] transition-colors"
              >
                {t("quickLinks.services")}
              </Link>
              <Link
                href={`/${locale}/coaches`}
                className="text-gray-400 hover:text-[#B4E90E] transition-colors"
              >
                {t("quickLinks.trainers")}
              </Link>
              <Link
                href={`/${locale}/term-conditions`}
                className="text-gray-400 hover:text-[#B4E90E] transition-colors"
              >
                {t("quickLinks.terms")}
              </Link>
            </nav>
          </div>

          {/* Right Column - Social Media */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="font-bold text-lg mb-4">{t("connect.title")}</h4>
            <div className="flex space-x-4">
              <Link
                href="https://www.instagram.com/stayfit.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#B4E90E] transition-colors"
              >
                <InstagramIcon className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://wa.me/966599542748"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#B4E90E] transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">WhatsApp</span>
              </Link>
              <Link
                href="https://www.tiktok.com/@stayfit.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#B4E90E] transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span className="sr-only">TikTok</span>
              </Link>
            </div>
            <div className="mt-6 text-center md:text-left">
              <div className="text-gray-400 text-sm">
                {locale === "ar" ? (
                  <div className="text-center md:text-right">
                    <a
                      href="mailto:info@fitcoach.com"
                      className="text-[#B4E90E]"
                    >
                      {t("connect.email")}
                    </a>{" "}
                    {t("connect.contact")}
                  </div>
                ) : (
                  <div>
                    {t("connect.contact")}{" "}
                    <a
                      href="mailto:info@stayfit.sa"
                      className="text-[#B4E90E]"
                    >
                      {t("connect.email")}
                    </a>
                  </div>
                )}
              </div>
              <div className="text-gray-400 text-sm mt-1 text-center md:text-left">
                {locale === "ar" ? (
                  <div className="text-center md:text-right">
                    <a href="tel:+966599542748" className="text-[#B4E90E]">
                      {t("connect.phoneNumber")}
                    </a>{" "}
                    {t("connect.phone")}
                  </div>
                ) : (
                  <>
                    {t("connect.phone")}{" "}
                    <a href="tel:+966599542748" className="text-[#B4E90E]">
                      {t("connect.phoneNumber")}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
