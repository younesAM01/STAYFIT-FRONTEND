"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"

export default function FitnessCoaching() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('COACHEPAGE');
  const locale = useLocale();
  
  // Determine text alignment and flex direction based on locale
  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';
  const flexDirection = locale === 'ar' ? 'flex-row-reverse' : 'flex-row';

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await fetch('/api/coach');
        if (!response.ok) {
          throw new Error('Failed to fetch coaches');
        }
        const data = await response.json();
        setCoaches(data);
      } catch (error) {
        console.error('Error fetching coaches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d111a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#B4E90E] border-[#161c2a] rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading coaches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-white ${textAlign}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://i.pinimg.com/736x/b9/5e/34/b95e3402e0301cf3f3ab308147d81bcf.jpg"
            alt="Fitness Hero"
            fill
            className="object-cover opacity-40 "
            priority
          />
        </div>
        <div className="container  px-6 mx-4 z-10">
          <div className="max-w-2xl">
            <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${textAlign}`}>
              {t('herotitle1')} <br /><span className="text-[#B4E90E]">{t('herotitle_span')}</span>
            </h1>
            <p className={`text-lg md:text-xl mb-8 text-gray-300 ${textAlign}`}>
              {t('paragraph')}
            </p>
            <div className={`flex ${flexDirection} ${locale === 'ar' ? 'justify-end' : 'justify-start'} gap-4`}>
              <Button className="bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c] px-8 py-6 text-lg font-semibold">
                {t('boutton')}
              </Button>
            </div>  
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="py-16 container mx-auto px-4 text-center">
        <h2 className={`text-3xl md:text-4xl font-bold mb-4`}>
          {locale === 'ar' ? 'قابل' : 'Meet'} <span className="text-[#B4E90E]">{locale === 'ar' ? 'مدربينا المحترفين' : 'Our Expert Coaches'}</span>
        </h2>
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-[#0d111a]">
              <div className="w-16 h-1 bg-gradient-to-r from-[#B4E90E] to-transparent"></div>
            </span>
          </div>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center md:justify-items-normal">
          {coaches.map((coach) => (
            <Card
              key={coach._id}
              className="bg-gray-800 border-none overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
            >
              <div className="relative min-h-80 overflow-hidden">
                <Image
                  src={coach.profilePic || "/placeholder.svg"}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className={`py-4 px-6 ${textAlign}`}>
                <h3 className="text-xl font-bold text-amber-50 mb-1">
                  {coach.firstName} {coach.lastName}
                </h3>
                <p className="text-gray-300 mb-1">
                  {coach.title?.[locale]}
                </p>
                <p className="text-gray-400 mb-2">
                  {coach.available?.[locale] || (locale === 'ar' ? 'متاح للجميع' : 'Available for all')}
                </p>
                <div className={`flex gap-2 mt-4 ${flexDirection}`}>
                  <Link href={`/${locale}/coach/${coach._id}`}>
                    <Button className="flex-1 bg-transparent border border-[#B4E90E] text-[#B4E90E] hover:bg-[#B4E90E] hover:text-[#0d111a]">
                      {locale === 'ar' ? 'عرض الملف' : 'View Profile'}
                    </Button>
                  </Link>
                  <Button className="flex-1 bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c]">
                    {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

