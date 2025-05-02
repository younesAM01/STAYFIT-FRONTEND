"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useGetCoachQuery } from "@/redux/services/user.service";
// Import motion components and hooks from framer-motion
import { motion, useAnimation, useInView } from "framer-motion";

// Reusable animation variants for fade-in-up effect
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Reusable animation variants for simple fade-in effect
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function FitnessCoaching() {
  const [coaches, setCoaches] = useState([]);
  const t = useTranslations("COACHEPAGE");
  const locale = useLocale();
  const {
    data,
    isLoading: isCoachesLoading,
    isSuccess: isCoachesSuccess,
    isError: isCoachesError,
  } = useGetCoachQuery();

  // --- Animation Hooks Setup ---
  // Controls for managing animations programmatically
  const heroControls = useAnimation();
  const coachesSectionControls = useAnimation();
  const coachesGridControls = useAnimation();

  // Refs to track when elements enter the viewport
  const heroRef = useRef(null);
  const coachesSectionRef = useRef(null);
  const coachesGridRef = useRef(null);

  // Hooks to detect if the refs are in view
  // REMOVED 'once: true' to allow animation on scroll back
  const isHeroInView = useInView(heroRef, { margin: "-100px 0px" });
  const isCoachesSectionInView = useInView(coachesSectionRef, {
    margin: "-100px 0px",
  });
  const isCoachesGridInView = useInView(coachesGridRef, {
    margin: "-50px 0px",
  });

  // --- Animation Trigger Logic ---
  // Trigger hero animation based on visibility state
  useEffect(() => {
    // Animate to "visible" if in view, otherwise animate back to "hidden"
    if (isHeroInView) {
      heroControls.start("visible");
    } else {
      heroControls.start("hidden"); // Animate out when scrolling away
    }
  }, [heroControls, isHeroInView]); // Dependency array includes isHeroInView

  // Trigger coaches section title/separator animation based on visibility
  useEffect(() => {
    if (isCoachesSectionInView) {
      coachesSectionControls.start("visible");
    } else {
      coachesSectionControls.start("hidden"); // Animate out
    }
  }, [coachesSectionControls, isCoachesSectionInView]);

  // Trigger coaches grid animation (including staggering) based on visibility
  useEffect(() => {
    if (isCoachesGridInView) {
      coachesGridControls.start("visible");
    } else {
      // Note: Animating a staggered list back to hidden might look abrupt
      // depending on the effect. Simple fade-out is usually fine.
      coachesGridControls.start("hidden"); // Animate out
    }
  }, [coachesGridControls, isCoachesGridInView]);
  // --- End Animation Hooks Setup ---

  useEffect(() => {
    if (isCoachesSuccess && data) {
      setCoaches(data.coach.filter((coach) => coach.coachActive === true));
    }
  }, [data, isCoachesSuccess]);

  // Determine text alignment and flex direction based on locale
  const textAlign = locale === "ar" ? "text-right" : "text-left";
  const flexDirection = locale === "ar" ? "flex-row-reverse" : "flex-row";

  if (isCoachesLoading) {
    return (
      <div className="min-h-screen bg-[#0d111a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#B4E90E] border-[#161c2a] rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading coaches...</p>
        </div>
      </div>
    );
  }
  if (isCoachesError) {
    return (
      <div className="text-white text-center py-16">Error fetching coaches</div>
    );
  }

  return (
    // Add overflow-x-hidden to the main container to prevent horizontal scrollbars caused by animations
    <div
      className={`min-h-screen text-white ${textAlign} bg-[#0d111a] overflow-x-hidden`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      {/* Use motion.section for section-level animation */}
      <motion.section
        // Removed initial animation props from section container, focus on content
        className="relative h-[80vh] flex items-center"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://i.pinimg.com/736x/b9/5e/34/b95e3402e0301cf3f3ab308147d81bcf.jpg"
            alt="Fitness Hero"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="container px-6 mx-4 z-10">
          {/* Wrap hero content in a motion.div for scroll-triggered animation */}
          <motion.div
            ref={heroRef} // Attach ref for viewport detection
            className="max-w-2xl mx-auto text-center justify-center"
            initial="hidden" // Start hidden (will transition between hidden/visible)
            animate={heroControls} // Control animation based on scroll
            variants={fadeInUp} // Use fade-in-up effect
          >
            <h1 className={`text-4xl md:text-6xl font-bold mb-4 `}>
              {t("herotitle1")} <br />
              <span className="text-[#B4E90E]">{t("herotitle_span")}</span>
            </h1>
            <p className={`text-lg md:text-xl mb-8 text-gray-300 `}>
              {t("paragraph")}
            </p>
            <div className={`flex justify-center gap-4`}>
              <Button className="bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c] px-8 py-6 text-lg font-semibold transition-transform hover:scale-105 duration-200 ease-in-out">
                {" "}
                {/* Added subtle scale on hover */}
                {t("boutton")}
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>
      {/* Coaches Section Title/Separator */}
      {/* Use motion.div for this specific part's animation */}
      <motion.div
        ref={coachesSectionRef} // Attach ref for viewport detection
        className="py-16 container mx-auto px-4 text-center"
        initial="hidden"
        animate={coachesSectionControls} // Control animation based on scroll
        variants={fadeInUp} // Use fade-in-up effect for the section title area
      >
        <h2 className={`text-3xl md:text-4xl font-bold mb-4`}>
          {locale === "ar" ? "قابل" : "Meet"}{" "}
          <span className="text-[#B4E90E]">
            {locale === "ar" ? "مدربينا المحترفين" : "Our Expert Coaches"}
          </span>
        </h2>
        <div className="relative mb-12">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-[#0d111a]">
              <div className="w-16 h-1 bg-gradient-to-r from-[#B4E90E] to-transparent"></div>
            </span>
          </div>
        </div>
      </motion.div>{" "}
      {/* End of title/separator section animation wrapper */}
      {/* Coaches Grid - Apply animation to the grid container */}
      <motion.div
        ref={coachesGridRef} // Attach ref for viewport detection
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center md:justify-items-normal container mx-auto px-4 pb-16" // Added container/padding here
        initial="hidden"
        animate={coachesGridControls} // Control animation based on scroll
        variants={{
          // Define variants directly here for staggering effect
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15, // Slightly faster stagger
              delayChildren: 0.1,
              // Ensure parent opacity transition happens smoothly too
              duration: 0.3, // Duration for the parent container fade-in itself
            },
          },
          hidden: {
            opacity: 0,
            transition: {
              // When hiding, stagger can feel weird, often better to fade all at once or reverse stagger
              // For simplicity, let's just fade the container out quickly.
              // Children will inherit the 'hidden' state instantly unless specific exit transitions are defined.
              duration: 0.3,
            },
          },
        }}
      >
        {coaches.map((coach) => (
          // Wrap each card in a motion.div for individual animation within the stagger
          <motion.div
            key={coach._id} // Key should be on the outermost motion element in the map
            variants={fadeInUp} // Each card uses the fade-in-up effect for enter/exit
            // No initial/animate needed here, controlled by parent stagger/visibility
            layout // Keeps smooth transitions if list order changes
          >
            <Card
              className="bg-gray-800 border-none overflow-hidden h-full flex flex-col group" // Added group for parent hover effects
            >
              <div className="relative min-h-80 overflow-hidden flex-shrink-0">
                <Image
                  src={coach.profilePic || "/placeholder.svg"}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" // Image zoom on card hover
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>{" "}
                {/* Gradient overlay on hover */}
              </div>
              <CardContent
                className={`py-4 px-6 ${textAlign} flex flex-col flex-grow min-w-[320px]`}
              >
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-amber-50 mb-1">
                    {coach.firstName} {coach.lastName}
                  </h3>
                  <p className="text-gray-300 mb-1">{coach.title?.[locale]}</p>
                  <p className="text-gray-400 mb-2 text-sm">
                    {coach.available?.[locale] ||
                      (locale === "ar" ? "متاح للجميع" : "Available for all")}
                  </p>
                </div>
                <div
                  className={`flex gap-2 mt-4 ${locale === "ar" ? "justify-start" : "justify-start"}`}
                >
                  <Link
                    href={`/${locale}/coach/${coach._id}`}
                    passHref
                    legacyBehavior
                  >
                    <motion.a // Use motion.a for animating link/button if needed
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block" // Needed for transform to apply correctly
                    >
                      <Button
                        className={`flex bg-transparent ${flexDirection} border border-[#B4E90E] text-[#B4E90E] hover:bg-[#B4E90E] hover:text-[#0d111a] transition-colors duration-200`}
                      >
                        {locale === "ar" ? "عرض الملف" : "View Profile"}
                      </Button>
                      {/* <Button className="flex-1 bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c]">
                    {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
                  </Button> */}
                    </motion.a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div> // End motion wrapper for card
        ))}
      </motion.div>{" "}
      {/* End Coaches Grid motion container */}
    </div>
  );
}
