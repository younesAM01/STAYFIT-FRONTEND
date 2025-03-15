'use client';
import Timeline from '@/components/timeline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const activities = [
 
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
  }
//   {
//     title: "Kids Programs",
//     description: "Special programs designed for children to learn discipline, self-control and basic combat techniques safely.",
//     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp4zaa2yPkZFRlMYR3KYRF8E0P7J_80uTh6Q&s"
//   }
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-white">
                  Our services
              </h1>

              <Timeline activities={activities} />
          </div>
      </div>
  );
}