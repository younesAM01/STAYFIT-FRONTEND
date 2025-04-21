'use client';
import { motion } from 'framer-motion';
import React, { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const AboutUs = () => {
  const vid = "https://res.cloudinary.com/dkjx65vc7/video/upload/v1745094824/homevid_n5g9hc.mp4";
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Determine text alignment based on locale and mobile view
  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';
  const mobileTextAlign = 'text-center'; // Center text on mobile

  return (
    <motion.div 
      className={`text-white ${textAlign} ${mobileTextAlign} lg:${textAlign}`}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-12">
        <div className={`flex flex-col lg:flex-row items-center`}>
          {/* Content Section */}
          <motion.div 
            className="w-full lg:w-1/2 mb-8 lg:mb-0"
            initial={{ x: locale === 'ar' ? 50 : -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, type: 'spring', stiffness: 50 }}
          >
            <div className={`text-[#B4E90E] text-lg md:text-2xl font-medium mb-2 ${textAlign}`}>
              {t('abouttitle1')}
            </div>
            <h2 className={`text-lg md:text-xl font-bold mb-6 ${textAlign}`}>
              {t('abouttitle2')}
            </h2>
            <p className={`text-gray-400 mb-8 ${textAlign}`}>
              {t('about')}
            </p>
            <motion.a 
              href="#"
              className={`mx-auto max-w-[230px] block bg-[#B4E90E] hover:bg-[#9bcf0e] text-[#0d111a] font-bold py-3 px-8 rounded-xl transition duration-300 ${textAlign}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('aboutbtn')}
            </motion.a>
          </motion.div>

          {/* Video Section */}
          <motion.div 
            className="w-full lg:w-[800px] lg:mx-6"
            initial={{ x: locale === 'ar' ? -50 : 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, type: 'spring', stiffness: 50 }}
          >
            <div className="relative rounded-lg overflow-hidden">
              <motion.video 
                ref={videoRef}
                className="w-full h-[400px] object-cover rounded-lg"
                controls={isPlaying}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 1.2 }}
              >
                <source src={vid} type="video/mp4" />
                Your browser does not support the video tag.
              </motion.video>
              {!isPlaying && (
                <motion.button 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-4 hover:bg-opacity-90 transition duration-300"
                  onClick={handlePlayPause}
                  aria-label="Play video"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 50 }}
                >
                  <svg 
                    className="w-8 h-8 text-[#B4E90E]" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutUs;