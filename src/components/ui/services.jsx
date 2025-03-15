'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const activities = [
  {
    title: "Cross Training",
    description: "High-intensity workouts that develop strength, endurance and overall fitness. Suitable for all levels from beginner to advanced.",
    image: "data:image/jpeg;base64,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" // Make sure to add your images to the public folder
  },
  {
    title: "Fitness",
    description: "Improve your cardiovascular endurance, increase strength or maintain regular physical activity with our complete equipment.",
    image: "https://img.freepik.com/photos-gratuite/vue-angle-bas-homme-muscle-meconnaissable-se-preparant-soulever-barre-dans-club-sante_637285-2497.jpg"
  },
  {
    title: "Group Classes",
    description: "Join our muscle strengthening, cardio, endurance, dance and relaxation classes led by qualified instructors.",
    image: "https://web-back.perfectgym.com/sites/default/files/styles/460x/public/equipment%20%286%29.jpg?itok=bC0T32-Kg"
  },
  {
    title: "Boxing",
    description: "Learn or perfect your boxing technique with our high-quality equipment and experienced instructors.",
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
  }
];

export default function ServicesPage() {
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
      {/* New Header Section */}
      <div className="relative w-full h-[300px]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('https://png.pngtree.com/thumb_back/fh260/background/20250120/pngtree-black-and-white-gym-photography-with-modern-fitness-equipment-image_16886018.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex items-center justify-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white text-center">
              Our Activities
            </h1>
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
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-800"
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
                              top-8 sm:inset-0 sm:group-hover:items-start sm:group-hover:pt-8"
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
                              transition-all duration-1500"
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