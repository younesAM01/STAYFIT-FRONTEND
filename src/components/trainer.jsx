"use client"
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import Link from "next/link"
import { useLocale } from 'next-intl';
import { useGetCoachQuery } from '@/redux/services/user.service';
const TrainerShowcase = () => {
  const t = useTranslations('HomePage');
  const [trainers, setTrainers] = useState([]);
  const locale = useLocale();
  const { data, isLoading: isCoachesLoading , isSuccess: isCoachesSuccess , isError: isCoachesError } = useGetCoachQuery();
  useEffect(() => {
    if (isCoachesSuccess && data) {
      setTrainers(data.coach.filter(coach => coach.coachActive === true));
    }
  }, [data, isCoachesSuccess]);

  if (isCoachesLoading) {
    return <div className="text-white text-center py-16">Loading...</div>;
  }
  if (isCoachesError) {
    return <div className="text-white text-center py-16">Error fetching coaches</div>;
  }
  
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
              <div className="mb-4 overflow-hidden hover:rounded-3xl rounded-3xl" style={{ maxWidth: '300px', width: '100%' }}>
                <img 
                  src={trainer.profilePic || trainer.hoverImage || null} 
                  alt={trainer.firstName} 
                  className="w-full h-[400px] object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">
                {locale === 'ar' ? trainer.coachnamearabic : `${trainer.firstName}`}
              </h3>
              <p className="text-[#B4E90E] mb-3">{trainer.title?.[locale]}</p>
              <div className="flex space-x-4">
                
              </div>
              <Link 
                href={`${locale}/coach/${trainer._id}`}
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