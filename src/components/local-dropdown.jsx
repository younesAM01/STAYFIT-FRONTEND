"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Globe } from "lucide-react";

export default function LocaleDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLocaleChange = (nextLocale) => {
    setIsDropdownOpen(false);

    // Extract current locale from pathname
    const currentLocale = pathname.split("/")[1];

    // Check if the current locale is in the list of locales
    if (routing.locales.includes(currentLocale)) {
      // Replace the locale in the pathname
      const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
      router.replace(newPath);
    } else {
      // If no locale is found, just prepend the new one
      router.replace(`/${nextLocale}${pathname}`);
    }
  };

  return (
    <div className="relative mx-2">
      <button
        className="flex items-center p-2 bg-transparent text-[#B4E90E] hover:text-[#c2fe02]/80"
        onClick={toggleDropdown}
      >
        <Globe className="w-5 h-5" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-26 bg-[#B4E90E] rounded-md shadow-lg z-10">
          {routing.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className="block w-full text-left px-4 py-2 text-[#0d111a] hover:bg-[#9bcf0e]"
            >
              {locale === 'en' ? 'ENGLISH' : locale === 'ar' ? 'العربية' : locale.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
