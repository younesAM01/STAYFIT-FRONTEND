'use client';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function Services() {
  const t = useTranslations('Servicespage');
  const locale = useLocale();
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState({});
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const servicesRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    
    // Fetch services from the backend
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.success) {
          setServices(data.data);
        } else {
          console.error('Failed to fetch services:', data.error);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const handleImageError = (index) => {
    setLoadError(prev => ({...prev, [index]: true}));
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to get the localized content
  const getLocalizedContent = (service, field, fallback = '') => {
    if (!service || !service[field]) return fallback;
    
    // If the field has the requested locale, use it
    if (service[field][locale]) return service[field][locale];
    
    // Otherwise use the other locale as fallback
    const otherLocale = locale === 'en' ? 'ar' : 'en';
    if (service[field][otherLocale]) return service[field][otherLocale];
    
    // Last resort: return empty string
    return fallback;
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
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b4e90e]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* First row - Three cards */}
            {isClient && services.slice(0, 3).map((service, index) => (
              <motion.div
                key={service._id || index}
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
                    backgroundImage: loadError[index] ? 'none' : `url(${service.image})`,
                    backgroundColor: loadError[index] ? '#1f2937' : 'transparent'
                  }}
                  onError={() => handleImageError(index)}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4 select-none">
                    {getLocalizedContent(service, 'title')}
                  </h2>
                  <p className="text-base sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500 select-none">
                    {getLocalizedContent(service, 'description')}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Second row - One large card */}
            {isClient && services.length > 3 && (
              <motion.div
                key={services[3]?._id || 'featured'}
                className="relative h-[250px] sm:h-[400px] lg:h-[500px] col-span-1 sm:col-span-2 lg:col-span-3 rounded-xl overflow-hidden group"
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
                    backgroundImage: loadError[3] ? 'none' : `url(${services[3]?.image})`,
                    backgroundColor: loadError[3] ? '#1f2937' : 'transparent'
                  }}
                  onError={() => handleImageError(3)}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-6 select-none">
                    {getLocalizedContent(services[3], 'title')}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-white/80 text-center max-w-xl block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500 select-none">
                    {getLocalizedContent(services[3], 'description')}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Third row - Two cards side by side */}
            {services.length > 4 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {isClient && services.slice(4, 6).map((service, index) => (
                  <motion.div
                    key={service._id || index + 4}
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
                        backgroundImage: loadError[index + 4] ? 'none' : `url(${service.image})`,
                        backgroundColor: loadError[index + 4] ? '#1f2937' : 'transparent'
                      }}
                      onError={() => handleImageError(index + 4)}
                    />
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                    <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4 select-none">
                        {getLocalizedContent(service, 'title')}
                      </h2>
                      <p className="text-base sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform select-none sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500">
                        {getLocalizedContent(service, 'description')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Fourth row - Three cards */}
            {isClient && services.slice(6).map((service, index) => (
              <motion.div
                key={service._id || index + 6}
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
                    backgroundImage: loadError[index + 6] ? 'none' : `url(${service.image})`,
                    backgroundColor: loadError[index + 6] ? '#1f2937' : 'transparent'
                  }}
                  onError={() => handleImageError(index + 6)}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                  <h2 className="text-2xl select-none sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4">
                    {getLocalizedContent(service, 'title')}
                  </h2>
                  <p className="text-base select-none sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500">
                    {getLocalizedContent(service, 'description')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}