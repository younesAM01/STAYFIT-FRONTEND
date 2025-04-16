"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Users, Award, Heart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button";
import abt from "@/assets/abt1.jpg"
import { useLocale } from "next-intl"

// Framer Motion variants for animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export default function AboutUs() {
  const vid = require('@/assets/pinterest.mp4');
  // Refs for scroll animations
  const storyRef = useRef(null)
  const valuesRef = useRef(null)
  const teamRef = useRef(null)
  const locale = useLocale();
  const [isPlaying, setIsPlaying] = useState (false);
  const videoRef = useRef(null);

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

  // Localized core values
  const getCoreValues = () => {
    const defaultValues = [
      {
        icon: <Users className="h-10 w-10 text-[#B4E90E]" />,
        title: {
          en: "Community",
          ar: "المجتمع"
        },
        description: {
          en: "We believe in building a supportive community where everyone feels welcome and motivated.",
          ar: "نؤمن ببناء مجتمع داعم يشعر فيه الجميع بالترحيب والتحفيز."
        }
      },
      {
        icon: <Award className="h-10 w-10 text-[#B4E90E]" />,
        title: {
          en: "Excellence",
          ar: "التميز"
        },
        description: {
          en: "We strive for excellence in everything we do, from our training programs to our facility.",
          ar: "نسعى للتميز في كل ما نقوم به، من برامج التدريب إلى المرافق."
        }
      },
      {
        icon: <Heart className="h-10 w-10 text-[#B4E90E]" />,
        title: {
          en: "Passion",
          ar: "الشغف"
        },
        description: {
          en: "Our coaches are passionate about fitness and dedicated to helping you achieve your goals.",
          ar: "مدربونا مفعمون بالشغف بالرياضة ومكرسون لمساعدتك في تحقيق أهدافك."
        }
      },
      {
        icon: <Clock className="h-10 w-10 text-[#B4E90E]" />,
        title: {
          en: "Consistency",
          ar: "الاستمرارية"
        },
        description: {
          en: "We believe consistent effort over time is the key to lasting transformation and results.",
          ar: "نؤمن بأن الجهد المستمر عبر الوقت هو مفتاح التحول والنتائج الدائمة."
        }
      }
    ];

    return defaultValues.map(value => ({
      ...value,
      title: value.title[locale] || value.title.en,
      description: value.description[locale] || value.description.en
    }));
  };

  // Localized team members
  const getTeamMembers = () => {
    const defaultMembers = [
      {
        name: {
          en: "John Doe",
          ar: "جون دو"
        },
        role: {
          en: "Founder & Head Coach",
          ar: "المؤسس والمدرب الرئيسي"
        },
        image: "/placeholder.svg?height=400&width=400&text=John",
        bio: {
          en: "Former Olympic athlete with 15+ years of coaching experience. John founded Elite Fitness to help people transform their lives through fitness.",
          ar: "رياضي أولمبي سابق مع أكثر من 15 عامًا من الخبرة التدريبية. أسس جون Elite Fitness لمساعدة الناس على تحويل حياتهم من خلال اللياقة البدنية."
        }
      },
      {
        name: {
          en: "Jane Smith",
          ar: "جين سميث"
        },
        role: {
          en: "Nutritionist",
          ar: "أخصائية تغذية"
        },
        image: "/placeholder.svg?height=400&width=400&text=Jane",
        bio: {
          en: "Jane is a certified nutritionist with over 10 years of experience in helping clients achieve their dietary goals.",
          ar: "جين أخصائية تغذية معتمدة ولديها أكثر من 10 سنوات من الخبرة في مساعدة العملاء على تحقيق أهدافهم الغذائية."
        }
      },
      {
        name: {
          en: "Mike Johnson",
          ar: "مايك جونسون"
        },
        role: {
          en: "Fitness Trainer",
          ar: "مدرب لياقة"
        },
        image: "/placeholder.svg?height=400&width=400&text=Mike",
        bio: {
          en: "Mike is a passionate fitness trainer who specializes in strength training and has helped many clients reach their fitness goals.",
          ar: "مايك مدرب لياقة شغوف متخصص في تدريب القوة وقد ساعد العديد من العملاء في تحقيق أهدافهم الرياضية."
        }
      },
      // ... (other team members with localized content)
    ];

    return defaultMembers.map(member => ({
      ...member,
      name: member.name[locale] || member.name.en,
      role: member.role[locale] || member.role.en,
      bio: member.bio[locale] || member.bio.en
    }));
  };

  return (
    <div className="min-h-screen bg-[#0d111a] text-white">
     

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center ">
        <div className="absolute inset-0 z-0 sm:translate-y-0 md:translate-y-[60px]" >
          <Image
            src={abt}
            alt="About Us Hero"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="container mx-auto px-4 z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              About <span className="text-[#B4E90E]">STAY FIT</span>
            </h1>
            <div className="text-lg md:text-xl mb-8 text-gray-300">
              Our journey, our mission, and the team behind your transformation
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section ref={storyRef} className="py-16 container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-10 items-center"
        >
          <motion.div variants={fadeIn} className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-6">
              Our <span className="text-[#B4E90E]">Story</span>
            </h2>
            <div className="space-y-4 text-lg text-gray-300">
              <p>
                Founded in 2010, Elite Fitness began with a simple mission: to create a fitness environment where
                everyone feels empowered to transform their lives through exercise and healthy habits.
              </p>
              <p>
                What started as a small studio with just two coaches has grown into a comprehensive fitness center with
                specialized training programs, nutrition guidance, and a thriving community of members who support each
                other.
              </p>
              <p>
                Over the years, we&apos;ve helped thousands of clients achieve their fitness goals, whether that&apos;s losing
                weight, building strength, improving athletic performance, or simply leading healthier lives.
              </p>
            </div>
          </motion.div>
          <motion.div variants={fadeIn} className="order-1 md:order-2 relative h-[400px] rounded-xl w-min-[#400px]">
          <motion.div 
            className="w-full  lg:mx-8"
            initial={{ x: locale === 'ar' ? -50 : 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, type: 'spring', stiffness: 50 }}
          >
            <div className="relative rounded-lg overflow-hidden">
              <motion.video 
                ref={videoRef}
                className=" h-[400px] w-[500px] object-cover rounded-lg"
                poster="https://i.pinimg.com/236x/64/25/81/642581d7373f8f3cc234bebfe77e6dfb.jpg"
                controls={isPlaying}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 1.2 }}
              >
                <source src={vid} type="video/mp4" />
                Your browser does not support the video tag.
              </motion.video>
              {!isPlaying && (
                <motion.button 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-4 hover:bg-opacity-90 transition duration-300"
                  onClick={handlePlayPause}
                  aria-label="Play video"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 50 }}
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
        </motion.div>
      </section>

      {/* Core Values Section */}
      <section ref={valuesRef} className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeIn} className="text-3xl font-bold mb-4">
              {locale === 'ar' ? 'قيمنا' : 'Our'} <span className="text-[#B4E90E]">{locale === 'ar' ? 'الأساسية' : 'Core Values'}</span>
            </motion.h2>
            <motion.div variants={fadeIn} className="max-w-2xl mx-auto text-gray-300">
              {locale === 'ar' 
                ? 'هذه المبادئ توجه كل ما نقوم به في STAY FIT'
                : 'These principles guide everything we do at STAY FIT'}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {getCoreValues().map((value, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors duration-300"
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
      <section ref={teamRef} className="py-16 container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeIn} className="text-3xl font-bold mb-4">
            {locale === 'ar' ? 'تعرف على' : 'Meet Our'} <span className="text-[#B4E90E]">{locale === 'ar' ? 'فريق القيادة' : 'Leadership Team'}</span>
          </motion.h2>
          <motion.div variants={fadeIn} className="max-w-2xl mx-auto text-gray-300">
            {locale === 'ar'
              ? 'الخبراء وراء برامج التدريب وفلسفتنا'
              : 'The experts behind our training programs and philosophy'}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {getTeamMembers().map((member, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
            >
              <div className="relative h-64">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  className="object-cover object-center"
                />
              </div>
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
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-6">
              {locale === 'ar' ? 'جاهز للبدء' : 'Ready to'} <span className="text-[#B4E90E]">{locale === 'ar' ? 'رحلتك معنا؟' : 'Start Your Journey'} </span>
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-gray-300">
              {locale === 'ar'
                ? 'انضم إلى مجتمعنا اليوم واتخذ الخطوة الأولى نحو تحقيق أهدافك الرياضية.'
                : 'Join our community today and take the first step toward achieving your fitness goals.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                className="bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c] px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link href={`/${locale}/coaches`}>
                  {locale === 'ar' ? 'قابل مدربينا' : 'Meet Our Coaches'}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
