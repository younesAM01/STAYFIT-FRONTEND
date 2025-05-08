"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "../i18n/routing";
import { Globe } from "lucide-react";

export default function LocaleDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Add click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLocaleChange = (nextLocale) => {
    setIsDropdownOpen(false);

    // Extract current locale from pathname
    const currentLocale = pathname.split("/")[1];

    // Check if the current locale is in the list of locales
    if (routing.locales.includes(currentLocale)) {
      // Replace the locale in the pathname and navigate
      const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
      router.push(newPath);
    } else {
      // If no locale is found, just prepend the new one
      router.push(`/${nextLocale}${pathname}`);
    }
  };

  return (
    <div className="relative mx-2 cursor-pointer" ref={dropdownRef}>
      <button
        className="flex items-center p-2 bg-transparent text-[#B4E90E] cursor-pointer hover:text-[#c2fe02]/80"
        onClick={toggleDropdown}
        onTouchEnd={(e) => {
          e.preventDefault();
          toggleDropdown();
        }}
      >
        <Globe className="w-5 h-5" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-26 bg-[#B4E90E] rounded-md shadow-lg z-50">
          {routing.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleLocaleChange(locale);
              }}
              className="block w-full text-left px-4 py-2 text-[#0d111a] hover:bg-[#9bcf0e] active:bg-[#9bcf0e]"
            >
              {locale === "en"
                ? "ENGLISH"
                : locale === "ar"
                  ? "العربية"
                  : locale.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
