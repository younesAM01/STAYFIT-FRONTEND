'use client';
import { motion } from 'framer-motion';
import ActivityCard from './services-card';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';

const TimelineItem = ({ activity, index, position = 'right' }) => {
  const isLeft = position === 'left';
  const t = useTranslations('HomePage');
  const locale = useLocale();

  // Helper function to get the localized content
  const getLocalizedContent = (item, field, fallback = '') => {
    if (!item || !item[field]) return fallback;
    
    // If the field has the requested locale, use it
    if (item[field][locale]) return item[field][locale];
    
    // Otherwise use the other locale as fallback
    const otherLocale = locale === 'en' ? 'ar' : 'en';
    if (item[field][otherLocale]) return item[field][otherLocale];
    
    // Last resort: return empty string
    return fallback;
  };

  // Console log for debugging
  console.log('Activity:', activity);

  return (
    <div className="relative flex items-center justify-center last:mb-0 py-6">
      {/* Timeline line */}
      <div className="absolute h-full w-0.5 bg-[#B4E90E] top-0 left-1/2 transform -translate-x-1/2" />
      
      {/* Timeline dot with subtle scale effect */}
      <motion.div 
        className="absolute z-10 w-4 h-4 rounded-full bg-[#B4E90E] left-1/2 transform -translate-x-1/2"
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.3, margin: "-20px" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 50, damping: 14 }}
      />
      
      {/* Content container */}
      <div className={`flex w-full items-center ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Timeline label */}
        <motion.div 
          className={`w-1/3 px-4 ${isLeft ? 'text-right' : 'text-left'}`}
          initial={{ opacity: 0, x: isLeft ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2, margin: "-20px" }}
          transition={{ duration: 0.7, type: "spring", stiffness: 45, damping: 12 }}
        >
          <h3 className={`md:text-xl text-xl font-medium ${isLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-blue-600 to-[#B4E90E] bg-clip-text text-transparent`}>
            {getLocalizedContent(activity, 'title')}
          </h3>
        </motion.div>
        
        {/* Timeline line connector */}
        <motion.div 
          className={`w-1/6 h-0.5 bg-[#B4E90E] ${isLeft ? 'mr-1' : 'ml-1'}`} 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: false, amount: 0.3, margin: "-20px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: isLeft ? 'right' : 'left' }}
        />
        
        {/* Card container */}
        <div className="w-1/2">
          <motion.div
            initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2, margin: "-20px" }}
            transition={{ duration: 0.9, type: "spring", stiffness: 40, damping: 15, mass: 1.5 }}
          >
            <ActivityCard 
              activity={{
                ...activity,
                title: getLocalizedContent(activity, 'title'),
                description: getLocalizedContent(activity, 'description'),
                // Use imageUrl property, or fall back to image property
                image: activity.imageUrl || activity.image || "https://placehold.co/600x400?text=No+Image"
              }} 
              index={index} 
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Timeline = () => {
  const t = useTranslations('HomePage');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.success) {
          console.log('Fetched services:', data.data);
          // Limit to first 3 services
          setServices(data.data.slice(0, 3));
        } else {
          setError(data.error || 'Failed to fetch services');
        }
      } catch (error) {
        setError('Error fetching services');
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
      {/* Title section */}
      <div className="flex flex-col items-center mb-12">
        <motion.h2 
          className="text-lg md:text-2xl font-bold flex items-center text-center text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
        >
          <span className="mx-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
            {t('servicestitle')}
          <span className="ml-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
        </motion.h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-20">
          {error}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center text-white py-20">
          No services available
        </div>
      ) : (
        <div className="relative py-4">
          {services.map((service, index) => (
            <TimelineItem 
              key={service._id || index}
              activity={service}
              index={index}
              position={index % 2 === 0 ? 'right' : 'left'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;