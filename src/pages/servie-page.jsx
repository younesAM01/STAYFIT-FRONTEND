'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleImageError = (index) => {
    setLoadError(prev => ({...prev, [index]: true}));
  };

  return (
    <div className="min-h-screen bg-black">
    {/* Header Section */}
    <div className="relative w-full h-[300px]">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://png.pngtree.com/thumb_back/fh260/background/20250120/pngtree-black-and-white-gym-photography-with-modern-fitness-equipment-image_16886018.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
            Our Services
          </h1>
          <p className="text-lg sm:text-xl text-white text-center max-w-3xl">
            Discover our comprehensive range of fitness programs designed to help you achieve your health and wellness goals. Whether you're just starting or looking to advance your fitness journey, we have the perfect service for you.
          </p>
        </div>
      </div>
    </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {isClient && activities.map((activity, index) => (
              <motion.div
                  key={index}
                  className="relative h-[250px] sm:h-[300px] rounded-xl sm:rounded-2xl overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                          duration: 0.5, 
                          delay: index * 0.1 
                      }
                  }}
                  viewport={{ once: true, margin: "-50px" }}
              >
                  {/* Background Image */}
                  <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
                       backgroundImage: loadError[index] ? 'none' : `url(${activity.image})`,
                       backgroundColor: loadError[index] ? '#1f2937' : 'transparent'
                     }}
                      onError={() => handleImageError(index)}
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/60 sm:bg-black/30 sm:group-hover:bg-black/60 transition-colors duration-500" />

                  {/* Content Container */}
                  <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                      {/* Title Container */}
                      <motion.div 
                          className="absolute w-full flex items-center sm:items-center justify-center transition-all duration-700 ease-in-out 
                              top-8 sm:inset-0 sm:group-hover:items-start sm:group-hover:pt-8 select-none"
                          initial={{ opacity: 0, y: -20 }}
                          whileInView={{ 
                              opacity: 1, 
                              y: 0,
                              transition: { 
                                  duration: 0.5, 
                                  delay: (index * 0.1) + 0.2 
                              }
                          }}
                          viewport={{ once: true, margin: "-50px" }}
                      >
                          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center drop-shadow-lg px-4 sm:px-6">
                              {activity.title}
                          </h2>
                      </motion.div>

                      {/* Description */}
                      <motion.div 
                          className="absolute w-full px-4 sm:px-6 top-20 sm:bottom-0 sm:opacity-0 sm:group-hover:opacity-100 
                              sm:translate-y-full sm:group-hover:translate-y-0 
                              transition-all duration-800 select-none"
                     
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ 
                              opacity: 1, 
                              y: 0,
                              transition: { 
                                  duration: 0.5, 
                                  delay: (index * 0.1) + 0.4 
                              }
                          }}
                          viewport={{ once: true, margin: "-50px" }}
                      >
                          <p className="text-sm sm:text-base text-white leading-relaxed text-center drop-shadow-lg">
                              {activity.description}
                          </p>
                      </motion.div>
                  </div>
              </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}