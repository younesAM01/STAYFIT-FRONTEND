"use client";
import { useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

const HeroSection = () => {
  const t = useTranslations('Hero');
  const locale = useLocale();

  useEffect(() => {
    const videoElement = document.getElementById("hero-video");
    let playAttempts = 0;
    const maxAttempts = 3;

    const attemptPlay = async () => {
      try {
        if (videoElement) {
          videoElement.loop = true;
          await videoElement.play();
        }
      } catch (error) {
        console.log('Video playback error:', error);
        if (playAttempts < maxAttempts) {
          playAttempts++;
          // Wait a bit before retrying
          setTimeout(attemptPlay, 1000);
        }
      }
    };

    // Initial play attempt
    attemptPlay();

    // Add event listener for visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden overflow-x-hidden">
      {/* Video Background */}
      <video
        id="hero-video"
        src="https://res.cloudinary.com/dkjx65vc7/video/upload/v1745094824/homevid_n5g9hc.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover z-[-100]"
      />

      {/* Overlay Content */}
      <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white px-4 ${locale === 'ar' ? 'font-arabic' : ''}`}>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
          {t('title')}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-center max-w-2xl">
          {t('description')}
        </p>
        <Link
          href={`/${locale}/pricing`}
          className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#B4E90E] px-4 py-1 text-md font-medium text-black backdrop-blur-3xl">
            {t('button')}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;