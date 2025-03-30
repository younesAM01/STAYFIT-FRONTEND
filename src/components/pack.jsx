"use client";
import React from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const MembershipPlans = () => {
  const t = useTranslations('HomePage');

  const plans = [
    {
      id: 'starter',
      name: t('packs.0.name'),
      price: t('packs.0.price'),
      period: t('packs.0.period'),
      features: [
        t('packs.0.features.0'),
        t('packs.0.features.1'),
        t('packs.0.features.2'),
        t('packs.0.features.3'),
        t('packs.0.features.4'),
        t('packs.0.features.5'),
      ],
      highlight: false
    },
    {
      id: 'standard',
      name: t('packs.1.name'),
      price: t('packs.1.price'),
      period: t('packs.1.period'),
      features: [
        t('packs.1.features.0'),
        t('packs.1.features.1'),
        t('packs.1.features.2'),
        t('packs.1.features.3'),
        t('packs.1.features.4'),
        t('packs.1.features.5'),
      ],
      highlight: true
    },
    {
      id: 'premium',
      name: t('packs.2.name'),
      price: t('packs.2.price'),
      period: t('packs.2.period'),
      features: [
        t('packs.2.features.0'),
        t('packs.2.features.1'),
        t('packs.2.features.2'),
        t('packs.2.features.3'),
        t('packs.2.features.4'),
        t('packs.2.features.5'),
      ],
      highlight: false
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 relative w-full bg-cover bg-center" 
      style={{
        backgroundImage: "url('https://i.pinimg.com/736x/d2/95/77/d295770e25e76451f2a1d3912903708f.jpg')",  
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      <div className="absolute inset-0 bg-opacity-100 z-10"></div>
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[url('/api/placeholder/400/600')] bg-cover bg-center"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('/api/placeholder/400/600')] bg-cover bg-center"></div>
      </div>
      
      <div className="text-center flex flex-col items-center mb-10">
        <h2 className="text-md md:text-2xl font-bold flex items-center text-center mb-6 text-white">
          <span className="mx-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
          {t('packtitle')}
          <span className="ml-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
        </h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-6xl justify-center relative z-10">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, x: index === 0 ? -50 : index === 2 ? 50 : 0, y: index === 1 ? 50 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: false, amount: 0.3 }}
            className={`w-full md:w-1/3 border ${plan.highlight ? 'border-2 border-[#B4E90E] shadow-2xl' : 'border-gray-700 hover:border-[#B4E90E] shadow-lg'} rounded-lg p-6 transform transition-transform hover:scale-105 hover:shadow-[#B4E90E]`}
          >
            <h2 className="text-xl font-bold text-[#B4E90E] mb-4 text-center">{plan.name}</h2>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-[#B4E90E]">{plan.price}</span>
              <span className="text-sm text-white ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="text-white h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-center">
              <button className="px-6 py-2 rounded font-medium transition-colors border border-[#B4E90E] text-white hover:bg-[#B4E90E] hover:text-black">
                {t('packbtn')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MembershipPlans;
