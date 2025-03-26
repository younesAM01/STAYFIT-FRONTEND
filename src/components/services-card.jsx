'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

const ActivityCard = ({ activity }) => {
    const [loadError, setLoadError] = useState(false);
  
    const handleImageError = () => {
      setLoadError(true);
    };
  
    return (
      <motion.div
        className="relative h-[250px] sm:h-[300px] rounded-xl sm:rounded-2xl overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.5
          }
        }}
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-800"
          style={{ 
            backgroundImage: loadError ? 'none' : `url(${activity.image})`,
            backgroundColor: loadError ? '#1f2937' : 'transparent'
          }}
          onError={handleImageError}
        />
  
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 sm:bg-black/30 sm:group-hover:bg-black/60 transition-colors duration-500" />
  
        {/* Content Container */}
        <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
          {/* Title Container */}
          <motion.div 
            className="absolute w-full flex items-center sm:items-center justify-center transition-all duration-700 ease-in-out 
                top-8 sm:inset-0 sm:group-hover:items-start sm:group-hover:pt-8"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.5, 
                delay: 0.2 
              }
            }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <h2 className=" text:lg md:text-2xl sm:text-3xl font-bold text-white text-center drop-shadow-lg px-4 sm:px-6">
              {activity.title}
            </h2>
          </motion.div>
  
          {/* Description */}
          <motion.div 
            className="absolute w-full px-4 sm:px-6 top-20 sm:bottom-0 sm:opacity-0 sm:group-hover:opacity-100 
                sm:translate-y-full sm:group-hover:translate-y-0 
                transition-all duration-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.5, 
                delay: 0.4 
              }
            }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <p className="text-sm md:text-md lg:text-lg text-white leading-relaxed text-center drop-shadow-lg">
              {activity.description}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  };

export default ActivityCard;