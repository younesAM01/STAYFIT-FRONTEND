import { useTranslations } from 'next-intl';
import React from 'react';
import Link from "next/link"

const TrainerShowcase = () => {
  const t = useTranslations('HomePage');
  const trainers = [
    {
      name: "Ahmed Sobhi",
      role: "Fitness Coach",
      image: "https://i.pinimg.com/474x/a2/fb/13/a2fb13560cae8b99da7ab04497737746.jpg",
      socials: {
        facebook: "https://facebook.com/nila.adams",
        twitter: "https://twitter.com/nila.adams",
        instagram: "https://instagram.com/nila.adams"
      }
    },
    {
      name: "Anass Beniss",
      role: "CrossFit Coach",
      image: "https://i.pinimg.com/474x/88/d1/1a/88d11a3428462b2e143d8c4a28af7a60.jpg",
      socials: {
        facebook: "https://facebook.com/guy.hawkins",
        twitter: "https://twitter.com/guy.hawkins",
        instagram: "https://instagram.com/guy.hawkins"
      }
    },
    {
      name: "Ahmed Hassan",
      role: "CrossFit Coach",
      image: "https://i.pinimg.com/474x/f0/f4/88/f0f4889240793a25e5b7c4fa2fbfb37b.jpg",
      socials: {
        facebook: "https://facebook.com/robert.fox",
        twitter: "https://twitter.com/robert.fox",
        instagram: "https://instagram.com/robert.fox"
      }
    },
    {
      name: "Layla Mahmoud",
      role: "Body Building",
      image: "https://i.pinimg.com/736x/79/3a/b1/793ab11603c2f931ae82bad4f5e3219c.jpg",
      socials: {
        facebook: "https://facebook.com/ronald.richards",
        twitter: "https://twitter.com/ronald.richards",
        instagram: "https://instagram.com/ronald.richards"
      }
    }
  ];
  
  return (
    <div className="text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center flex flex-col items-center mb-12">
          <h2 className="text-md md:text-2xl font-bold flex items-center text-center mb-8">
            <span className="mx-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
            {t('Trainer.title')}
            <span className="ml-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
          </h2>
          <p className="max-w-3xl mx-auto text-gray-400">
            {t('Trainer.description')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trainers.map((trainer, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="mb-4 overflow-hidden hover:rounded-3xl rounded-3xl" style={{ maxWidth: '240px' }}>
                <img 
                  src={trainer.image} 
                  alt={trainer.name} 
                  className="w-full h-auto transition-transform duration-300 hover:scale-105 "
                />
              </div>
              <h3 className="text-xl font-bold mb-1">{trainer.name}</h3>
              <p className="text-[#B4E90E] mb-3">{trainer.role}</p>
              <div className="flex space-x-4">
                
              </div>
              <Link 
                  href={`/en/aboutme`}
                    
                >
              <button className="mt-4 bg-[#B4E90E] text-[#0d111a] font-medium py-2 px-4 rounded hover:bg-[#9bcf0e] transition-colors duration-300">
              {t('Trainer.profileBtn')}
              </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainerShowcase;
