import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import Image from "next/image"
import logo from "@/assets/stayfit11.png"
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('HomePage.Footer');
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-[#0d111a] text-white py-12">
      <div className="container mx-auto px-4">
        {/* Newsletter Subscription */}
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <h3 className="text-xl font-bold mb-4 text-[#B4E90E]">{t('newsletter.title')}</h3>
          <div className="flex flex-col sm:flex-row w-full max-w-sm gap-2">
            <Input type="email" placeholder={t('newsletter.placeholder')} className="bg-[#1a1f2e] border-[#2a2f3e] rounded-3xl text-white" />
            <Button className="bg-[#B4E90E] hover:bg-[#a3d80d] text-[#0d111a] font-bold rounded-3xl">{t('newsletter.button')}</Button>
          </div>
        </div>

        {/* Footer Content - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#1a1f2e]">
          {/* Left Column - Logo and Description */}
          <div className="flex flex-col">
            <Image src={logo} alt="STAY FiT" width={130} height={40} />
            <p className="text-gray-400 mb-4">{t('description')}</p>
            <p className="text-gray-500 text-sm">{t('copyright', { year: currentYear })}</p>
          </div>

          {/* Middle Column - Links */}
          <div className="flex flex-col md:items-center">
            <h4 className="font-bold text-lg mb-4">{t('quickLinks.title')}</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                {t('quickLinks.about')}
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                {t('quickLinks.terms')}
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                {t('quickLinks.services')}
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                {t('quickLinks.trainers')}
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                {t('quickLinks.faq')}
              </Link>
            </nav>
          </div>

          {/* Right Column - Social Media */}
          <div className="flex flex-col md:items-end">
            <h4 className="font-bold text-lg mb-4">{t('connect.title')}</h4>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#B4E90E] transition-colors">
                <Youtube className="h-6 w-6" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
            <div className="mt-6">
              <p className="text-gray-400 text-sm">
                {t('connect.contact')}{" "}
                <a href="mailto:info@fitcoach.com" className="text-[#B4E90E]">
                  {t('connect.email')}
                </a>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {t('connect.phone')}{" "}
                <a href="tel:+1234567890" className="text-[#B4E90E]">
                  {t('connect.phoneNumber')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


{/* <p className="text-gray-400 text-sm">
                
                <a href="mailto:info@fitcoach.com" className="text-[#B4E90E]">
                  {t('connect.email')}
                </a>
                {" "}
                {t('connect.contact')}{" "}
              </p>
              <p className="text-gray-400 text-sm mt-1 text-right">
                 
                <a href="tel:+1234567890" className="text-[#B4E90E]">
                  {t('connect.phoneNumber')}
                </a>
                {" "}
                {t('connect.phone')}
              </p> */}