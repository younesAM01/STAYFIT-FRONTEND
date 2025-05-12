"use client";
import { motion } from "framer-motion";
// Import useInView and useAnimation if you wanted more control, but for simple re-triggering, modifying viewport is enough.
// We will stick to modifying viewport as it's simpler for this case.
import { useEffect, useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useGetServicesQuery } from "@/redux/services/services.service";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Services() {
  const t = useTranslations("Servicespage");
  const locale = useLocale();
  const router = useRouter();
  
  // Removed isClient state as it didn't seem to be used
  const [loadError, setLoadError] = useState({});
  const [services, setServices] = useState([]);
  // Removed isLoading state as isServicesLoading is used directly
  const servicesRef = useRef(null);
  const {
    data,
    isLoading: isServicesLoading, // Use directly for loading state
    isSuccess: isServicesSuccess,
    isError: isServicesError, // Can be used for error handling if needed
  } = useGetServicesQuery();

  useEffect(() => {
    if (isServicesSuccess && data) {
      setServices(data.services);
    }
  }, [data, isServicesSuccess]);

 

  const handleImageError = (index) => {
    setLoadError((prev) => ({ ...prev, [index]: true }));
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

 
  // Helper function to get the localized content
  const getLocalizedContent = (service, field, fallback = "") => {
    if (!service || !service[field]) return fallback;
    if (service[field][locale]) return service[field][locale];
    const otherLocale = locale === "en" ? "ar" : "en";
    if (service[field][otherLocale]) return service[field][otherLocale];
    return fallback;
  };

  return (
    // Added bg-[#0d111a] to the outer container for consistent background
    <div className="min-h-screen overflow-hidden bg-[#0d111a]">
      {/* Full-height Banner Section */}
      <div className="relative w-full h-screen overflow-hidden text-[#0d111a]">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://png.pngtree.com/background/20230616/original/pngtree-contemporary-fitness-and-gym-with-a-panoramic-city-and-sky-view-picture-image_3653380.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Banner Content - These animations run once on load */}
        <motion.div
          className="relative z-10 flex flex-col h-full container mx-auto px-4 sm:px-8 md:px-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col h-full items-center justify-center ">
            <motion.div
              className="mb-4 text-lg sm:text-xl md:text-2xl font-semibold tracking-wider text-[#e6edd3] text-center sm:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t("title")}
            </motion.div>
            <motion.h1
              className="mb-6 text-5xl sm:text-6xl md:text-7xl lg:text-6xl font-bold tracking-tight text-center sm:text-left text-[#b4e90e] "
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {t("subtitle")}
            </motion.h1>
            <motion.p
              className="mb-8 text-lg sm:text-xl md:text-2xl text-[#f2fad8] text-center sm:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {t("description")}
            </motion.p>

            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href={`/${locale}/free-session`} className="px-8 py-3 bg-[#B4E90E] hover:bg-[#9bcf0e] text-[#0d111a] font-medium rounded-md transition-colors text-base sm:text-lg md:text-xl w-full cursor-pointer sm:w-auto">
                  {t("subscribe")}
                </Link>
                <button
                  onClick={scrollToServices}
                  className="px-8 py-3 border-2 border-white text-[#b4e90e] hover:bg-white/10 rounded-md font-bold transition-colors text-base sm:text-lg md:text-xl cursor-pointer w-full sm:w-auto"
                >
                  {t("services")}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar - Runs once on load */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-6 bg-[#b4e90e]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p
            className="text-sm sm:text-lg md:text-2xl tracking-normal whitespace-nowrap px-4 rtl:tracking-normal text-[#0d111a]" // Ensure text color is set
            dir="auto"
          >
            {t("focus")}
          </p>
        </motion.div>
      </div>

      {/* Cards Section */}
      <div
        ref={servicesRef}
        // Added text-white for fallback if loading takes time or error occurs
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-white"
      >
        {isServicesLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b4e90e]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* First row - Three cards */}
            {services.slice(0, 3).map((service, index) => (
              <motion.div
                key={service._id || index}
                className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: index * 0.1 }, // Slightly reduced delay for re-trigger
                }}
                // MODIFIED: Changed once: true to once: false
                viewport={{ once: false, margin: "-50px" }}
              >
                {/* Card content remains the same */}
                 <div
                   className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                   style={{
                     backgroundImage: loadError[index]
                       ? "none"
                       : `url(${service.image})`,
                     backgroundColor: loadError[index]
                       ? "#1f2937" // Fallback background color on image error
                       : "transparent",
                   }}
                   // Add onError on the div if using it as img replacement
                   // onErrorCapture={() => handleImageError(index)} // Use onErrorCapture for divs
                 />
                 {/* Fallback Image or Placeholder if needed */}
                 {loadError[index] && (
                   <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                     <span className="text-gray-400">Image failed to load</span>
                   </div>
                 )}
                 {/* Image tag method (alternative, maybe better for onError) */}
                 {/* {!loadError[index] && (
                    <img
                      src={service.image}
                      alt={getLocalizedContent(service, "title")}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={() => handleImageError(index)}
                    />
                 )} */}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4 select-none">
                    {getLocalizedContent(service, "title")}
                  </h2>
                  <p className="text-base sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500 select-none">
                    {getLocalizedContent(service, "description")}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Second row - One large card */}
            {services.length > 3 && (
              <motion.div
                key={services[3]?._id || "featured"}
                className="relative h-[250px] sm:h-[400px] lg:h-[500px] col-span-1 sm:col-span-2 lg:col-span-3 rounded-xl overflow-hidden group"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.6 },
                }}
                 // MODIFIED: Changed once: true to once: false
                viewport={{ once: false, margin: "-50px" }}
              >
                 {/* Card content remains the same */}
                 <div
                   className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                   style={{
                     backgroundImage: loadError[3] ? "none" : `url(${services[3]?.image})`,
                     backgroundColor: loadError[3] ? "#1f2937" : "transparent",
                   }}
                  // onErrorCapture={() => handleImageError(3)}
                 />
                 {loadError[3] && (
                   <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                     <span className="text-gray-400">Image failed to load</span>
                   </div>
                 )}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-6 select-none">
                    {getLocalizedContent(services[3], "title")}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-white/80 text-center max-w-xl block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500 select-none">
                    {getLocalizedContent(services[3], "description")}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Third row - Two cards side by side */}
            {services.length > 4 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {services.slice(4, 6).map((service, index) => (
                  <motion.div
                    key={service._id || index + 4}
                    className="relative h-[350px] sm:h-[400px] lg:h-[450px] rounded-xl overflow-hidden group"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.6, delay: index * 0.1 }, // Reduced delay
                    }}
                    // MODIFIED: Changed once: true to once: false
                    viewport={{ once: false, margin: "-50px" }}
                  >
                     {/* Card content remains the same */}
                    <div
                       className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                       style={{
                         backgroundImage: loadError[index + 4] ? "none" : `url(${service.image})`,
                         backgroundColor: loadError[index + 4] ? "#1f2937" : "transparent",
                       }}
                       // onErrorCapture={() => handleImageError(index + 4)}
                     />
                    {loadError[index + 4] && (
                       <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                         <span className="text-gray-400">Image failed to load</span>
                       </div>
                     )}
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                    <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4 select-none">
                        {getLocalizedContent(service, "title")}
                      </h2>
                      <p className="text-base sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform select-none sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500">
                        {getLocalizedContent(service, "description")}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Fourth row - Three cards */}
            {/* Check if there are services beyond the first 6 */}
            {services.length > 6 && services.slice(6).map((service, index) => (
              <motion.div
                key={service._id || index + 6}
                className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: index * 0.1 }, // Reduced delay
                }}
                 // MODIFIED: Changed once: true to once: false
                viewport={{ once: false, margin: "-50px" }}
              >
                 {/* Card content remains the same */}
                <div
                   className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                   style={{
                     backgroundImage: loadError[index + 6] ? "none" : `url(${service.image})`,
                     backgroundColor: loadError[index + 6] ? "#1f2937" : "transparent",
                   }}
                   // onErrorCapture={() => handleImageError(index + 6)}
                 />
                 {loadError[index + 6] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                      <span className="text-gray-400">Image failed to load</span>
                    </div>
                  )}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-500" />
                <div className="relative h-full w-full flex flex-col justify-center items-center p-4">
                  <h2 className="text-2xl select-none sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4">
                    {getLocalizedContent(service, "title")}
                  </h2>
                  <p className="text-base select-none sm:text-lg text-white/80 text-center max-w-sm block sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500">
                    {getLocalizedContent(service, "description")}
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