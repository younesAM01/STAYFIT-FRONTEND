'use client';
import { motion } from 'framer-motion';
import ActivityCard from './services-card';
import { useTranslations } from 'next-intl';

const TimelineItem = ({ activity, index, position = 'right' }) => {
  const isLeft = position === 'left';

  return (
    <div className="relative flex items-center justify-center last:mb-0 py-6"> {/* Reduced height */}
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
            {activity.title}
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
            <ActivityCard activity={activity} index={index} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Timeline = () => {
  const t = useTranslations('HomePage');
  const activities = [
    {
      title: t('Fitness'),  // Translated title
      description: t('FitnessDescription'),  // Translated description
      image: "https://img.freepik.com/photos-gratuite/vue-angle-bas-homme-muscle-meconnaissable-se-preparant-soulever-barre-dans-club-sante_637285-2497.jpg"
    },
    {
      title: t('GroupClasses'),
      description: t('GroupClassesDescription'),
      image: "https://web-back.perfectgym.com/sites/default/files/styles/460x/public/equipment%20%286%29.jpg?itok=bC0T32-Kg"
    },
    {
      title: t('Boxing'),
      description: t('BoxingDescription'),
      image: "https://media.gq.com/photos/59ee10b166e2d56abcd79fd3/16:9/w_2560%2Cc_limit/gq-fitness-boxing.jpg"
    },
    {
      title: t('Yoga'),
      description: t('YogaDescription'),
      image: "https://ds.static.rtbf.be/article/image/1920x1080/0/2/f/87ae6fb631f7c8a627e8e28785d9992d-1687356162.jpg"
    }
  ];
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
      {/* Title section - moved here so it appears only once */}
      <div className="flex flex-col items-center mb-12">
        <motion.h2 
          className="text-lg md:text-2xl font-bold flex items-center text-center text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
        >
          <span className="mx-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
          Our Services
          <span className="ml-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
        </motion.h2>
      </div>
      
      <div className="relative py-4">
        {activities.map((activity, index) => (
          <TimelineItem 
            key={index}
            activity={activity}
            index={index}
            position={index % 2 === 0 ? 'right' : 'left'}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;