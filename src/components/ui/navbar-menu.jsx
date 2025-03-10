"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import LocaleDropdown from "../local-dropdown";

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
            className="absolute bottom-[-4px] left-0 h-[2px] bg-[#7fff00]"
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
          className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4"
        >
          <motion.div
            transition={transition}
            layoutId="active"
            className="bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-[#8eda24]/[0.2] shadow-xl"
          >
            <motion.div layout className="w-max h-full p-4">
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
 

  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative w-full rounded-none border-b border-[#7fff00]/[0.1] bg-gradient-to-r from-black via-black to-[#7fff00]/10 hidden md:flex items-center px-8 py-6"
    >
      <div className="text-[#7fff00] font-bold text-2xl font-inter">STAY FiT</div>
      <div className="flex justify-center space-x-8 mx-auto">{children}</div>
      
      <LocaleDropdown />

      <button className="px-6 py-2 bg-[#7fff00] text-black font-semibold rounded-full hover:bg-[#7fff00]/90 transition-colors">
        {t('register')}
      </button>
    </nav>
  );}

export const CoachItem = ({ title, description, href, src }) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-[#7fff00]">{title}</h4>
        <p className="text-neutral-300 text-sm max-w-[10rem]">{description}</p>
      </div>
    </Link>
  );
};

export const MobileCoachItem = ({ title, description, href, src }) => {
  return (
    <Link href={href} className="flex items-center space-x-3 py-2">
      <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
        <Image
          src={src}
          width={48}
          height={48}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <h4 className="text-base font-bold text-[#7fff00]">{title}</h4>
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

  useEffect(() => {
    // Check if the window size is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileSubmenu = (item) => {
    setMobileSubmenu(mobileSubmenu === item ? null : item);
  };
  const t = useTranslations('HomePage');
 

  return (
    <div className="w-full">
      {/* Desktop Menu */}
      <DesktopMenu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item={t('home')} href="/" isMobile={isMobile} />
        <MenuItem setActive={setActive} active={active} item={t('our coaches')} href="/coaches" isMobile={isMobile}>
          <div className=" grid grid-cols-2 gap-4 p-2 z-10000">
            <CoachItem title="Sarah Ahmed" description="Yoga specialist with 8+ years experience" href="/coaches/sarah" src="/coaches/sarah.jpg" />
            <CoachItem title="Mark Williams" description="Strength & conditioning expert" href="/coaches/mark" src="/coaches/mark.jpg" />
            <CoachItem title="Layla Mahmoud" description="Nutrition and fitness coach" href="/coaches/layla" src="/coaches/layla.jpg" />
            <CoachItem title="Ahmed Hassan" description="Functional training specialist" href="/coaches/ahmed" src="/coaches/ahmed.jpg" />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item={t('services')} href="/services" isMobile={isMobile} />
        <MenuItem setActive={setActive} active={active} item={t('about us')} href="/about" isMobile={isMobile} />
        <MenuItem setActive={setActive} active={active} item={t('contact us')} href="/contact" isMobile={isMobile} />
      </DesktopMenu>

      {/* Mobile Menu */}
      <nav className="relative w-full rounded-none border-b border-[#7fff00]/[0.1] bg-gradient-to-r from-black via-black to-[#7fff00]/10 md:hidden flex items-center px-4 py-4">
        <div className="text-[#7fff00] font-bold text-xl font-inter">STAY FiT</div>
        <div className="ml-auto">
          <button
            className="flex items-center justify-center rounded-md p-2 text-[#7fff00] hover:bg-black/20 focus:outline-none"
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
        className={`fixed inset-y-0 right-0 z-50 w-72 transform bg-gradient-to-r from-black via-black to-[#7fff00]/10 p-6 shadow-lg transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button inside the navigation menu */}
        <button
          className="absolute right-4 top-4 rounded-full p-2 text-[#7fff00] hover:bg-black/20"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close navigation menu"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col space-y-4 pt-16">
          <Link
            href="/"
            className="text-lg font-medium text-white hover:text-[#7fff00]"
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
                href="/coaches"
                className="text-lg font-medium text-white hover:text-[#7fff00]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              >
                {t('our coaches')}
              </Link>
              <button className="text-white p-1">
                {mobileSubmenu === "coaches" ? 
                  <motion.span 
                    initial={{ rotate: 0 }} 
                    animate={{ rotate: 180 }} 
                    transition={{ duration: 0.3 }}
                  >▲</motion.span> : 
                  <motion.span 
                    initial={{ rotate: 180 }} 
                    animate={{ rotate: 0 }} 
                    transition={{ duration: 0.3 }}
                  >▲</motion.span>
                }
              </button>
            </div>
            
            {mobileSubmenu === "coaches" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                transition={{ duration: 0.3 }}
                className="pl-4 space-y-3 overflow-hidden"
              >
                <MobileCoachItem 
                  title="Sarah Ahmed" 
                  description="Yoga specialist" 
                  href="/coaches/sarah" 
                  src="/coaches/sarah.jpg" 
                />
                <MobileCoachItem 
                  title="Mark Williams" 
                  description="Strength & conditioning" 
                  href="/coaches/mark" 
                  src="/coaches/mark.jpg" 
                />
                <MobileCoachItem 
                  title="Layla Mahmoud" 
                  description="Nutrition and fitness" 
                  href="/coaches/layla" 
                  src="/coaches/layla.jpg" 
                />
                <MobileCoachItem 
                  title="Ahmed Hassan" 
                  description="Functional training" 
                  href="/coaches/ahmed" 
                  src="/coaches/ahmed.jpg" 
                />
              </motion.div>
            )}
          </div>
          
          <Link
            href="/services"
            className="text-lg font-medium text-white hover:text-[#7fff00]"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('services')}
          </Link>
          <Link
            href="/about"
            className="text-lg font-medium text-white hover:text-[#7fff00]"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('about us')}
          </Link>
          <Link
            href="/contact"
            className="text-lg font-medium text-white hover:text-[#7fff00]"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('contact us')}
          </Link>
          
          <button className="mt-6 px-6 py-3 bg-[#7fff00] text-black font-semibold rounded-lg hover:bg-[#7fff00]/90 transition-colors">
          {t('register')}
          </button>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
          onClick={() => setIsMenuOpen(false)} 
          aria-hidden="true" 
        />
      )}
    </div>
  );
};

export default Navbar;