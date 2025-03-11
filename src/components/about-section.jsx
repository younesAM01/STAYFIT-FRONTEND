"use client";

import Image from "next/image";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { useTranslations } from "next-intl";

const AboutUs = () => {
    const t = useTranslations('HomePage');
  return (
    <div className="flex ml-8 items-start space-x-4 p-6 text-white">
      {/* Logo */}
      {/* <Image
        src="/mnt/data/abt 1.png"
        alt="About Us Logo"
        width={50}
        height={50}
      /> */}

      {/* Text Section */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold flex items-center text-center">
          <span className="mx-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
          ABOUT US
          <span className="ml-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
        </h2>

        {/* Text Reveal Effect */}
        <TextGenerateEffect
          words={t('about')}
          className="text-gray-400 mt-4 text-md px-12 text-center"
          duration={0.5}
        />
      </div>
    </div>
  );
};

export default AboutUs;
