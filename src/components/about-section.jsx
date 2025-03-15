"use client";
import React, { useState, useRef } from 'react';
import { useTranslations } from "next-intl";


const AboutUs = () => {
  const vid = require("@/assets/pinterest.mp4");
  const t = useTranslations('HomePage');

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

  return (
    <div className="text-white">
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          {/* Content Section */}
          <div className="w-full md:w-1/2 md:pl-12 mb-8 md:mb-0">
            <div className="text-[#B4E90E] text:lg md:text-2x font-medium mb-2 text-center md:text-left">{t('abouttitle1')}</div>
            <h2 className="text:lg md:text-2xl font-bold mb-6 text-center md:text-left">{t('abouttitle2')}</h2>
            <p className="text-gray-400 mb-8 text-center md:text-left ">
              {t('about')}.
            </p>
            <a 
              href="#" 
              className="mx-auto max-w-[250px] block md:inline-block bg-[#B4E90E] hover:bg-[#9bcf0e] text-[#0d111a] font-bold py-3 px-8 rounded-lg transition duration-300 text-center"
            >
              {t('aboutbtn')}
            </a>
          </div>

          {/* Video Section */}
          <div className="w-full md:w-1/2 lg:ml-16">
            <div className="relative rounded-lg overflow-hidden">
              <video 
                ref={videoRef}
                className="w-full h-[400px] object-cover rounded-lg"
                poster="https://i.pinimg.com/236x/64/25/81/642581d7373f8f3cc234bebfe77e6dfb.jpg"
                controls={isPlaying}
              >
                <source src={vid} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {!isPlaying && (
                <button 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-4 hover:bg-opacity-90 transition duration-300"
                  onClick={handlePlayPause}
                  aria-label="Play video"
                >
                  <svg 
                    className="w-8 h-8 text-[#B4E90E]" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
