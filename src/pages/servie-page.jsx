'use client';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

const activities = [
  {
    title: "Bodybuilding",
    description: "Do you have muscles but feel like your appearance needs to be toned? Don't worry! We offer the perfect body-shaping program to give you the toned appearance you desire.",
    image: "https://bqe.vibefitness.com/images/easyblog_shared/services_personal_training_2024.jpg"
  },
  {
    title: "Pre/Postnatal Exercises",
    description: "Ready to welcome your new baby or have you recently given birth? If you're suffering from muscle slackness or the effects of a C-section, we're here to help! With our expert trainers, we'll help you achieve the desired fitness by treating muscle separation and tightening your abdominal muscles.",
    image: "https://images.squarespace-cdn.com/content/v1/582a774c5016e1e43d96ecba/1616515884190-ZSIYM8ZSZ0K7UOW8H8NP/unsplash-image-ORK-USd2DDc.jpg?format=1500w"
  },
  {
    title: "Boxing",
    description: "Learn martial arts and boost your self-confidence with boxing exercises. You'll improve your focus and reduce work stress while enjoying a unique sporting experience.",
    image: "https://media.gq.com/photos/59ee10b166e2d56abcd79fd3/16:9/w_2560%2Cc_limit/gq-fitness-boxing.jpg"
  },
  {
    title: "Yoga",
    description: "Complete combat training combining standing fighting, wrestling and ground combat techniques.",
    image: "https://ds.static.rtbf.be/article/image/1920x1080/0/2/f/87ae6fb631f7c8a627e8e28785d9992d-1687356162.jpg"
  },
  {
    title: "Kids Programs",
    description: "Special programs designed for children to learn discipline, self-control and basic combat techniques safely.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp4zaa2yPkZFRlMYR3KYRF8E0P7J_80uTh6Q&s"
  },
  {
    title: "General Fitness",
    description: "Do you find yourself quickly tiring when climbing stairs? Don't worry! We offer a fitness program specifically designed for your age and weight, using circuit training and an endurance approach to help you regain your fitness and energy.",
    image: "https://flexfitnessapp.com/_next/image/?url=https%3A%2F%2Fflex-web-media-prod.storage.googleapis.com%2F2025%2F02%2FAthletic-Man-Doing-a-Bulgarian-Split-Squat.jpg&w=1024&q=75"
  },
  {
    title: "Job Training",
    description: "Get ready to achieve your goals! We offer a training program that will help enhance your overall function, focusing on jumping, climbing, and playing with your children as you wish.",
    image: "https://ceoworld.biz/wp-content/uploads/2019/06/Gym.jpg"
  },
  {
    title: "Swimming",
    description: "Enjoy learning to swim from scratch! We'll help you learn to stand and balance in the water, as well as teach you different swimming styles. You can even teach these skills to your children!",
    image: "https://cdn4.explainthatstuff.com/og-large-swimming.jpg"
  },
  {
    title: "Mixed Martial Arts",
    description: "Do you dream of becoming a martial arts champion? Join us to learn multiple skills, become strong in various disciplines, and why not, become a professional!",
    image: "https://www.evolutionhealthcareandfitness.com/green-things/uploads/2017/05/mixed-martial-arts_960_720.jpg"
  }
];

export default function Services() {
  const t = useTranslations('Servicespage');
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState({});
  const servicesRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleImageError = (index) => {
    setLoadError(prev => ({...prev, [index]: true}));
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0d111a]">
      {/* Full-height Banner Section */}
      <div className="relative w-full h-screen overflow-hidden bg-[#0d111a] text-[#0d111a]">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('https://png.pngtree.com/background/20230616/original/pngtree-contemporary-fitness-and-gym-with-a-panoramic-city-and-sky-view-picture-image_3653380.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <motion.div 
          className="relative z-10 flex flex-col h-full container mx-auto px-4 sm:px-8 md:px-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col justify-center h-full items-center sm:items-start max-w-2xl">
            <motion.div 
              className="mb-4 text-lg sm:text-xl md:text-2xl font-semibold tracking-wider text-[#e6edd3] text-center sm:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('title')}
            </motion.div>
            <motion.h1 
              className="mb-6 text-5xl sm:text-6xl md:text-7xl lg:text-6xl font-bold tracking-tight text-center sm:text-left text-[#b4e90e] "
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {t('subtitle')}
            </motion.h1>
            <motion.p 
              className="mb-8 text-lg sm:text-xl md:text-2xl text-[#f2fad8] text-center sm:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {t('description')}
            </motion.p>

            <motion.div 
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button className="px-8 py-3 bg-[#0d111a] hover:bg-[#0d111a]-700 text-[#b4e90e] font-bold rounded-md transition-colors text-base sm:text-lg md:text-xl">
                {t('subscribe')}
              </button>
              <button 
                onClick={scrollToServices}
                className="px-8 py-3 border-2 border-white text-[#b4e90e] hover:bg-white/10 rounded-md font-bold transition-colors text-base sm:text-lg md:text-xl cursor-pointer"
              >
                {t('services')}
              </button>
            </motion.div>
          </div>
        </motion.div>

         <motion.div 
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-6 bg-[#b4e90e]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-sm sm:text-lg md:text-2xl tracking-normal whitespace-nowrap px-4 rtl:tracking-normal" dir="auto">
            {t('focus')}
          </p>
        </motion.div>
      </div>

      {/* Cards Section */}
      <div ref={servicesRef} className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* First row - Three cards */}
          {isClient && activities.slice(0, 3).map((activity, index) => (
            <motion.div
              key={index}
              className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5, delay: index * 0.2 }
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                style={{ 
                  backgroundImage: loadError[index] ? 'none' : `url(${activity.image})`,
                  backgroundColor: loadError[index] ? '#1f2937' : 'transparent'
                }}
                onError={() => handleImageError(index)}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
              <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4 select-none">
                  {activity.title}
                </h2>
                <p className="text-base sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500 select-none">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Second row - One large card */}
          {isClient && activities.slice(3, 4).map((activity, index) => (
            <motion.div
              key={index + 3}
              className="relative h-[400px] sm:h-[500px] lg:h-[600px] col-span-1 sm:col-span-2 lg:col-span-3 rounded-xl overflow-hidden group"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ 
                opacity: 1, 
                scale: 1,
                transition: { duration: 0.6 }
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                style={{ 
                  backgroundImage: loadError[index + 3] ? 'none' : `url(${activity.image})`,
                  backgroundColor: loadError[index + 3] ? '#1f2937' : 'transparent'
                }}
                onError={() => handleImageError(index + 3)}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
              <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-6 select-none">
                  {activity.title}
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-white/80 text-center max-w-xl block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500 select-none">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Third row - Two cards side by side */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {isClient && activities.slice(4, 6).map((activity, index) => (
              <motion.div
                key={index + 4}
                className="relative h-[350px] sm:h-[400px] lg:h-[450px] rounded-xl overflow-hidden group"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { duration: 0.6, delay: index * 0.2 }
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                  style={{ 
                    backgroundImage: loadError[index + 4] ? 'none' : `url(${activity.image})`,
                    backgroundColor: loadError[index + 4] ? '#1f2937' : 'transparent'
                  }}
                  onError={() => handleImageError(index + 4)}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4 select-none">
                    {activity.title}
                  </h2>
                  <p className="text-base sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform select-none sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fourth row - Three cards */}
          {isClient && activities.slice(6, 9).map((activity, index) => (
            <motion.div
              key={index + 6}
              className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5, delay: index * 0.2 }
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                style={{ 
                  backgroundImage: loadError[index + 6] ? 'none' : `url(${activity.image})`,
                  backgroundColor: loadError[index + 6] ? '#1f2937' : 'transparent'
                }}
                onError={() => handleImageError(index + 6)}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
              <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                <h2 className="text-2xl select-none sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4">
                  {activity.title}
                </h2>
                <p className="text-base select-none sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}