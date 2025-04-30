"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Award, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import abt from "@/assets/abt1.jpg";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

// Framer Motion variants for general fade-in
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// Framer Motion variants for container staggering
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Basic stagger for children if needed elsewhere
    },
  },
};

// NEW: Variants for text slide-in based on locale, with delay parameter
const textSlideIn = (delay = 0) => ({
  hidden: (customLocale) => ({
    // Accept locale via custom prop
    opacity: 0,
    x: customLocale === "ar" ? 50 : -50, // Start from right if 'ar', left otherwise
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay: delay, // Apply the passed delay
      ease: "easeOut",
    },
  },
});

export default function AboutUs() {
  const locale = useLocale();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const t = useTranslations("AboutUs");

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Localized core values (no changes needed here)
  const getCoreValues = () => {
    const defaultValues = [
      {
        icon: <Users className="h-10 w-10 text-[#B4E90E]" />,
        title: { en: "Community", ar: "المجتمع" },
        description: {
          en: "We believe in building a supportive community where everyone feels welcome and motivated.",
          ar: "نؤمن ببناء مجتمع داعم يشعر فيه الجميع بالترحيب والتحفيز.",
        },
      },
      {
        icon: <Award className="h-10 w-10 text-[#B4E90E]" />,
        title: { en: "Excellence", ar: "التميز" },
        description: {
          en: "We strive for excellence in everything we do, from our training programs to our facility.",
          ar: "نسعى للتميز في كل ما نقوم به، من برامج التدريب إلى المرافق.",
        },
      },
      {
        icon: <Heart className="h-10 w-10 text-[#B4E90E]" />,
        title: { en: "Passion", ar: "الشغف" },
        description: {
          en: "Our coaches are passionate about fitness and dedicated to helping you achieve your goals.",
          ar: "مدربونا مفعمون بالشغف بالرياضة ومكرسون لمساعدتك في تحقيق أهدافك.",
        },
      },
      {
        icon: <Clock className="h-10 w-10 text-[#B4E90E]" />,
        title: { en: "Consistency", ar: "الاستمرارية" },
        description: {
          en: "We believe consistent effort over time is the key to lasting transformation and results.",
          ar: "نؤمن بأن الجهد المستمر عبر الوقت هو مفتاح التحول والنتائج الدائمة.",
        },
      },
    ];
    return defaultValues.map((value) => ({
      ...value,
      title: value.title[locale] || value.title.en,
      description: value.description[locale] || value.description.en,
    }));
  };

  // Localized team members (no changes needed here)
  const getTeamMembers = () => {
    const defaultMembers = [
      {
        name: { en: "OUSSAMA", ar: "أسامة" },
        role: { en: "COACH OUSSAMA", ar: "المدرب أسامة" },
        bio: {
          en: "I am a trainer with over 9 years of experience in personal training and boxing. I am passionate about helping individuals achieve their health and fitness goals through customized training programs that meet their specific needs.I am committed to providing a motivating and respectful training environment for each client, which helps them achieve tangible results in fitness and nutrition. I focus on developing clients' skills and enhancing their self-confidence, contributing to an overall improvement in their quality of life.",
          ar: "أنا مدرب ذو خبرة تزيد عن 9 سنوات في مجال التدريب الشخصي والبوكسينغ أعمل بشغف على مساعدة الأفراد في تحقيق أهدافهم الصحية واللياقية من خلال برامج تدريب مُخصصة تناسب احتياجاتهم. ألتزم بتوفير بيئة تدريب تحفز وتحترم كل عميل، مما يساعدهم على تحقيق نتائج ملموسة في مجالات اللياقة البدنية والتغذية. أركز على تطوير مهارات العملاء وتعزيز ثقتهم بأنفسهم، مما يساهم في تحسين جودة حياتهم بشكل عام.",
        },
      },
      {
        name: { en: "ISHAK", ar: "إسحاق" },
        role: { en: "COACH ISHAK", ar: "المدرب إسحاق" },
        bio: {
          en: "Passionate Personal Trainer Adept At Making Workouts Fun And Rewarding.Expertise In Instructing Clients On Proper Lifting Techniques And Educating Clients On Proper Nutrition And Hydration Needs .Experience Providing Instruction For One On One Session And Ability To Motivate Others Toward Acomplishing Weight Loss",
          ar: "أنا مدرب شخصي شغوف، أتمتع بقدرة على جعل التمارين ممتعة ومجزية. أتمتع بخبرة في تعليم العملاء تقنيات الرفع الصحيحة وتثقيفهم حول الاحتياجات المناسبة للتغذية والترطيب. لدي تجربة في تقديم التعليمات خلال جلسات فردية، وقدرة على تحفيز الآخرين لتحقيق أهداف فقدان الوزن.",
        },
      },
      {
        name: { en: "KHADIJA", ar: "خديجة" },
        role: { en: "COACH KHADIJA", ar: " المدربة خديجة" },
        bio: {
          en: "I am a dedicated trainer with over 8 years of experience In personal training, dance, and martial arts. My passion for fitness and movement drives me to help individuals achieve their personal goals through tailored training programs. I specialize in creating engaging and dynamic sessions that incorporate various styles, ensuring that each client feels motivated and empowered. Whether it's building strength, enhancing flexibility, or mastering new dance techniques, I am committed to guiding my clients on their journey to wellness and self-discovery.",
          ar: " أنا مدربة متخصصة أتمتع بخبرة تزيد عن 8 سنوات في التدريب الشخصي، والرقص، وفنون القتال. يدفعني شغفي باللياقة البدنية والحركة لمساعدة الأفراد في تحقيق أهدافهم الشخصية من خلال برامج تدريب مُخصصة. أتميز في إنشاء جلسات ممتعة وديناميكية تتضمن أنماطًا متنوعة، مما يضمن شعور كل عميل بالتحفيز والقوة. سواء كان الهدف هو بناء القوة، تعزيز المرونة، أو إتقان تقنيات رقص جديدة، أنا ملتزمة بتوجيه عملائي في رحلتهم نحو الصحة والاكتشاف الذاتي.",
        },
      },
    ];
    return defaultMembers.map((member) => ({
      ...member,
      name: member.name[locale] || member.name.en,
      role: member.role[locale] || member.role.en,
      bio: member.bio[locale] || member.bio.en,
    }));
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      {" "}
      {/* Added overflow-x-hidden to prevent horizontal scroll during animation */}
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center ">
        <div className="absolute inset-0 z-0 sm:translate-y-0 md:translate-y-[30px]">
          <Image
            src={abt}
            alt="About Us Hero"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="container mx-auto px-4 z-10">
          <motion.div
            initial="hidden"
            animate="visible" // Changed to animate to trigger on load
            variants={fadeIn}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {t("headertitle")}{" "}
              <span className="text-[#B4E90E]">{t("headertitle_span")}</span>
            </h1>
            <div className="text-lg md:text-xl mb-8 text-gray-300">
              {t("headerdescription")}
            </div>
          </motion.div>
        </div>
      </section>
      {/* Our Story Section */}
      <section className="py-16 container mx-auto px-6 md:px-14">
        <div className="grid md:grid-cols-2 gap-10 items-center mt-10">
          {/* --- Text Content Column --- */}
          <div
            className={`order-2 md:order-${locale === "ar" ? "2" : "1"} ${locale === "ar" ? "text-right" : "text-left"}`}
          >
            {/* Our Story Title + Desc */}
            <motion.h2
              custom={locale} // Pass locale to variants
              variants={textSlideIn(0)} // Use slide-in variant, delay 0
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }} // Trigger when 20% visible, only once
              className="text-3xl font-bold mb-6 text-[#B4E90E]"
            >
              {t("title")}
            </motion.h2>
            <motion.div
              custom={locale}
              variants={textSlideIn(0)} // Use slide-in variant, delay 0
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-4 text-lg text-gray-300"
            >
              <p>{t("description")}</p>
            </motion.div>

            {/* Vision Title + Desc */}
            <motion.h2
              custom={locale}
              variants={textSlideIn(0.3)} // Use slide-in variant, delay 0.3s
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="text-3xl font-bold mb-6 mt-8 text-[#B4E90E]"
            >
              {t("vision")}
            </motion.h2>
            <motion.div
              custom={locale}
              variants={textSlideIn(0.3)} // Use slide-in variant, delay 0.3s
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-4 text-lg text-gray-300"
            >
              <p>{t("visionDescription")}</p>
            </motion.div>

            {/* Mission Title + Desc */}
            <motion.h2
              custom={locale}
              variants={textSlideIn(0.6)} // Use slide-in variant, delay 0.6s
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="text-3xl font-bold mb-6 mt-8 text-[#B4E90E]"
            >
              {t("mission")}
            </motion.h2>
            <motion.div
              custom={locale}
              variants={textSlideIn(0.6)} // Use slide-in variant, delay 0.6s
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-4 text-lg text-gray-300"
            >
              <p>{t("missionDescription")}</p>
            </motion.div>
          </div>

          {/* --- Video/Image Column --- */}

          <motion.div
            className={`order-1 md:order-${locale === "ar" ? "1" : "2"} relative h-[400px] rounded-xl w-min-[#400px]`}
          >
            <motion.div
              className="w-full lg:mx-8"
              initial={{ x: locale === "ar" ? 50 : -50, opacity: 0 }} // Kept existing slide-in
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }} // Changed to once: true
              transition={{ duration: 0.8, type: "spring", stiffness: 40 }} // Adjusted transition slightly
            >
              <div className="relative rounded-lg overflow-hidden">
                <motion.video
                  ref={videoRef}
                  className=" h-[400px] w-[500px] object-cover rounded-lg"
                  // poster="https://i.pinimg.com/236x/64/25/81/642581d7373f8f3cc234bebfe77e6dfb.jpg"
                  controls={isPlaying} // Show controls only when playing
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                >
                  <source
                    src="https://res.cloudinary.com/dkjx65vc7/video/upload/v1745094824/homevid_n5g9hc.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </motion.video>
                {!isPlaying && (
                  <motion.button
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-4 hover:bg-opacity-90 transition duration-300"
                    onClick={handlePlayPause}
                    aria-label="Play video"
                    // Kept existing button animation
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 50,
                      delay: 0.5, // Delay button appearance slightly
                    }}
                  >
                    <svg
                      className="w-8 h-8 text-[#B4E90E]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>{" "}
        {/* End Grid */}
      </section>
      {/* Core Values Section */}
      <section /* Removed ref={valuesRef} */ className="py-16 ">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer} // Keep stagger for title/desc pair
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeIn} className="text-3xl font-bold mb-4">
              {locale === "ar" ? "قيمنا" : "Our"}{" "}
              <span className="text-[#B4E90E]">
                {locale === "ar" ? "الأساسية" : "Core Values"}
              </span>
            </motion.h2>
            <motion.div
              variants={fadeIn}
              className="max-w-2xl mx-auto text-gray-300"
            >
              {locale === "ar"
                ? "هذه المبادئ توجه كل ما نقوم به في STAY FIT"
                : "These principles guide everything we do at STAY FIT"}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer} // Stagger the appearance of value cards
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {getCoreValues().map((value, index) => (
              <motion.div
                key={index}
                variants={fadeIn} // Each card fades in
                className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors duration-300"
                dir={locale === "ar" ? "rtl" : "ltr"} // <-- Add this line
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Team Section */}
      <section className="py-16 container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer} // Stagger title/desc pair
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeIn} className="text-3xl font-bold mb-4">
            {locale === "ar" ? "تعرف على" : "Meet Our"}{" "}
            <span className="text-[#B4E90E]">
              {locale === "ar" ? "فريق القيادة" : "Leadership Team"}
            </span>
          </motion.h2>
          <motion.div
            variants={fadeIn}
            className="max-w-2xl mx-auto text-gray-300"
          >
            {locale === "ar"
              ? "الخبراء وراء برامج التدريب وفلسفتنا"
              : "The experts behind our training programs and philosophy"}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer} // Stagger the appearance of team cards
          className="grid md:grid-cols-3 gap-8"
          dir={locale === "ar" ? "rtl" : "ltr"} // <-- Add this line
        >
          {getTeamMembers().map((member, index) => (
            <motion.div
              key={index}
              variants={fadeIn} // Each card fades in
              // Added hover scale effect back
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gray-800 rounded-xl overflow-hidden transition-transform duration-300" // removed hover:transform hover:scale-105
            >
              <div className="p-6">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-[#B4E90E] mb-3">{member.role}</p>
                <p className="text-gray-300">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn} // Simple fade-in for the whole CTA block
          >
            <h2 className="text-3xl font-bold mb-6">
              {locale === "ar" ? "جاهز للبدء" : "Ready to"}{" "}
              <span className="text-[#B4E90E]">
                {locale === "ar" ? "رحلتك معنا؟" : "Start Your Journey"}{" "}
              </span>
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-gray-300">
              {locale === "ar"
                ? "انضم إلى مجتمعنا اليوم واتخذ الخطوة الأولى نحو تحقيق أهدافك الرياضية."
                : "Join our community today and take the first step toward achieving your fitness goals."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {/* Added slight animation to buttons */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c] px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`/${locale}/coaches`}>
                    {locale === "ar" ? "قابل مدربينا" : "Meet Our Coaches"}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
