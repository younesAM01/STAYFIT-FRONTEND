"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, X, LogOut } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import LocaleDropdown from "../local-dropdown";
import logo from "@/assets/stayfit11.png";
import { useAuth } from "@/context/authContext"; // Import the useAuth hook

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({ setActive, active, item, href, children, isMobile }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <div onMouseEnter={() => !isMobile && setActive(item)} className="relative z-10 ">
      <Link href={href} className="cursor-pointer text-[#ffffff] relative">
        {item}
        {isActive && !isMobile && (
          <motion.div
            className="absolute bottom-[-4px] left-0 h-[2px] bg-main"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
      {active === item && children && !isMobile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
          className="absolute top-[calc(100%_+_0.25rem)] left-1/2 transform -translate-x-1/2 pt-2"
        >
          <motion.div
            transition={transition}
            layoutId="active"
            className="bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-[#8eda24]/[0.2] shadow-xl"
          >
            <motion.div layout className="w-max h-full p-2">
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export const DesktopMenu = ({ setActive, children }) => {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="hidden lg:flex fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] items-center px-8 py-2 bg-gradient-to-r from-[#0d111a] via-[#0d111a] to-[#b4e90e]/10 border border-[#b4e90e]/[0.1] rounded-full shadow-lg backdrop-blur-md z-50"
    >
      <Image src={logo} alt="STAY FiT" width={130} height={40} />
      <div className="flex justify-center space-x-8 mx-auto">{children}</div>
      <LocaleDropdown />
      
      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <span className="text-white text-sm hidden md:block">{user?.email}</span>
          <button onClick={signOut} className="flex items-center gap-1 text-[#b4e90e]">
            <LogOut size={16} />
            <span>{t('logout')}</span>
          </button>
        </div>
      ) : (
        <Link href={`/${locale}/auth/login`}>
          <button className="px-6 py-1 bg-[#b4e90e] text-[#0d111a] font-semibold rounded-full hover:bg-customGreen/90 transition-colors">
            {t('register')}
          </button>
        </Link>
      )}
    </nav>
  );
}

export const CoachItem = ({ title, description, href, src }) => {
  const locale = useLocale();
  const localizedHref = `/${locale}${href}`;

  return (
    <Link href={localizedHref} className="flex space-x-2">
      <img 
        src={src}                  
        className="shrink-0 rounded-md shadow-2xl h-[90px] object-cover"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-[#b4e90e]">{title}</h4>
        <p className="text-neutral-300 text-sm max-w-[10rem]">{description}</p>
      </div>
    </Link>
  );
};

export const MobileCoachItem = ({ title, description, href, src }) => {
  const locale = useLocale();
  const localizedHref = `/${locale}${href}`;

  return (
    <Link href={localizedHref} className="flex items-center space-x-3 py-2">
      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
        <Image
          src={src}
          width={48}
          height={48}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <h4 className="text-base font-bold text-[#b4e90e]">{title}</h4>
        <p className="text-xs text-neutral-300">{description}</p>
      </div>
    </Link>
  );
};

const Navbar = () => {
  const [active, setActive] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const t = useTranslations('HomePage');
  const locale = useLocale();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleMobileSubmenu = (item) => setMobileSubmenu(mobileSubmenu === item ? null : item);

  return (
    <div className="w-full">
      {/* Desktop Menu */}
      <DesktopMenu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item={t('home')} href={`/${locale}`} isMobile={isMobile} />
        <MenuItem setActive={setActive} active={active} item={t('our coaches')} href={`/${locale}/coaches`} isMobile={isMobile}>
          <div className="grid grid-cols-2 gap-4 p-2 z-10000">
            <CoachItem title="Ahmed Sobhi" description="Yoga specialist with 8+ years experience" href="/coaches/sarah" src="https://i.pinimg.com/474x/a2/fb/13/a2fb13560cae8b99da7ab04497737746.jpg" />
            <CoachItem title="Anass Beniss" description="Strength & conditioning expert" href="/coaches/mark" src="https://i.pinimg.com/474x/88/d1/1a/88d11a3428462b2e143d8c4a28af7a60.jpg" />
            <CoachItem title="Layla Mahmoud" description="Nutrition and fitness coach" href="/coaches/layla" src="https://i.pinimg.com/736x/79/3a/b1/793ab11603c2f931ae82bad4f5e3219c.jpg" />
            <CoachItem title="Ahmed Hassan" description="Functional training specialist" href="/coaches/ahmed" src="https://i.pinimg.com/474x/f0/f4/88/f0f4889240793a25e5b7c4fa2fbfb37b.jpg" />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item={t('services')} href={`/${locale}/services`} isMobile={isMobile} />
        <MenuItem setActive={setActive} active={active} item={t('about us')} href={`/${locale}/aboutus`} isMobile={isMobile} />
        <MenuItem setActive={setActive} active={active} item={t('contact us')} href="/contact" isMobile={isMobile} />
      </DesktopMenu>

      {/* Mobile Menu */}
      <nav className="relative w-full rounded-none border-b border-[#b4e90e]/[0.1] bg-gradient-to-r from-black via-black to-[#b4e90e]/20 lg:hidden flex items-center px-4 py-1">
        <Image src={logo} alt="STAY FiT" width={130} height={40} className="text-[#b4e90e] font-bold text-2xl font-inter" />
        <div className="ml-auto flex">
          <LocaleDropdown />
          <button
            className="flex items-center justify-center rounded-md p-2 text-[#b4e90e] hover:bg-black/20 focus:outline-none"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 transform bg-gradient-to-r from-black via-black to-[#b4e90e]/10 p-6 shadow-lg transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute right-4 top-4 rounded-full p-2 text-[#b4e90e] hover:bg-black/20"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close navigation menu"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col space-y-4 pt-16">
          <Link
            href={`/${locale}`}
            className="text-lg font-medium text-white hover:text-[#b4e90e]"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('home')}
          </Link>
          {/* Mobile Our Coaches with submenu */}
          <div className="space-y-2">
            <div 
              className="flex justify-between items-center"
              onClick={() => toggleMobileSubmenu("coaches")}
            >
              <Link
                href={`/${locale}/coaches`}
                className="text-lg font-medium text-white hover:text-[#b4e90e]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              >
                {t('our coaches')}
              </Link>
              <button className="text-[#b4e90e] p-1">
                {mobileSubmenu === "coaches" ? 
                  <motion.span 
                    animate={{ rotate: 180 }} 
                    transition={{ type: "spring", stiffness: 100 }} 
                    className="text-2xl" 
                  >⌄</motion.span>
                  : 
                  <motion.span 
                    animate={{ rotate: 0 }} 
                    transition={{ type: "spring", stiffness: 100 }} 
                    className="text-2xl"
                  >⌃</motion.span>
                }
              </button>
            </div>
            <div className={`${mobileSubmenu === "coaches" ? "block" : "hidden"}`}>
              <MobileCoachItem title="Ahmed Sobhi" description="Yoga specialist" href="/coaches/sarah" src="https://i.pinimg.com/474x/a2/fb/13/a2fb13560cae8b99da7ab04497737746.jpg" />
              <MobileCoachItem title="Anass Beniss" description="Strength & conditioning expert" href="/coaches/mark" src="https://i.pinimg.com/474x/88/d1/1a/88d11a3428462b2e143d8c4a28af7a60.jpg" />
            </div>
          </div>

          <Link href={`/${locale}/services`} className="text-lg font-medium text-white hover:text-[#b4e90e]" onClick={() => setIsMenuOpen(false)}>
            {t('services')}
          </Link>
          <Link href={`/${locale}/aboutus`} className="text-lg font-medium text-white hover:text-[#b4e90e]" onClick={() => setIsMenuOpen(false)}>
            {t('about us')}
          </Link>
          <Link href="/contact" className="text-lg font-medium text-white hover:text-[#b4e90e]" onClick={() => setIsMenuOpen(false)}>
            {t('contact us')}
          </Link>
          
          {/* Mobile Auth Buttons */}
          <div className="pt-4 border-t border-[#b4e90e]/20">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#B4E90E]"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                {user?.email && (
                  <div className="text-white text-sm mb-2 text-center">
                    {user.email}
                  </div>
                )}
                <button 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }} 
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-[#b4e90e] text-[#b4e90e] rounded-full"
                >
                  <LogOut size={16} />
                  <span>{t('logout')}</span>
                </button>
              </>
            ) : (
              <Link 
                href={`/${locale}/auth/login`} 
                className="block w-full py-2 px-4 bg-[#b4e90e] text-[#0d111a] font-semibold rounded-full text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('register')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;