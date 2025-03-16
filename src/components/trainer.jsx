import { useTranslations } from 'next-intl';
import React from 'react';

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
                {Object.entries(trainer.socials).map(([social, url], i) => (
                  <a 
                    key={i}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-gray-400 hover:text-white transition-colors duration-300 `}
                  >
                    <svg className="w-5 h-5  hover:scale-120 " fill="currentColor" viewBox="0 0 24 24">
                      {social === "facebook" && <path className="hover:text-[#434d8c]" d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />}
                      {social === "twitter" && <path className="hover:text-[#1DA1F2]" d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />}
                      {social === "instagram" && <path className="hover:text-[#C13584]" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />}
                    </svg>
                  </a>
                ))}
              </div>
              <button className="mt-4 bg-[#B4E90E] text-[#0d111a] font-medium py-2 px-4 rounded hover:bg-[#9bcf0e] transition-colors duration-300">
              {t('Trainer.profileBtn')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainerShowcase;
