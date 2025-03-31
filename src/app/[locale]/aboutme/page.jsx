"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Dumbbell, Medal, Languages, ChevronRight } from "lucide-react"
import { useTranslations } from 'next-intl'

export default function CoachProfile() {
  const [activeTab, setActiveTab] = useState("about")
  const t = useTranslations('aboutme')

  const aboutContent = {
    paragraphs: [
      "I am a trainer with over 9 years of experience in personal training and boxing. I am passionate about helping individuals achieve their health and fitness goals through customized training programs that meet their specific needs.",
      "I am committed to providing a motivating and respectful training environment for each client, which helps them achieve tangible results in fitness and nutrition. I focus on developing clients' skills and enhancing their self-confidence, contributing to an overall improvement in their quality of life."
    ],
    languages: [
      { code: "AR", name: "Arabic" },
      { code: "FR", name: "French" },
      { code: "EN", name: "English" }
    ]
  }

  const specialties = [
    {
      title: "Personal Training",
      description: "Customized training programs designed to meet your specific fitness goals."
    },
    {
      title: "Boxing & Combat Sports",
      description: "Boxing, Kickboxing, and Muay Thai training for all skill levels."
    },
    {
      title: "Weight Management",
      description: "Effective programs for weight loss, muscle gain, and body transformation."
    },
    {
      title: "General Fitness",
      description: "Comprehensive fitness programs to improve overall health and wellness."
    },
    {
      title: "Nutrition",
      description: "Expert nutritional guidance to complement your fitness journey."
    }
  ]
  const heroContent = {
    name: "OUSSAMA",
    title: "Personal Trainer & Boxing Coach",
    image: "https://static.vecteezy.com/system/resources/thumbnails/046/836/977/small/african-male-fitness-trainer-in-gym-fitness-and-wellness-african-american-coach-healthy-lifestyle-photo.jpg"
  }
  const certifications = [
    { title: "Certified Sports Nutrition Coach", org: "NASM" },
    { title: "Certified Personal Trainer", org: "NASM" },
    { title: "Certified Personal Trainer", org: "ISSA" },
    { title: "Certified CPR & AED", org: "ISSA" },
    { title: "Certified Fitness Facility Management", org: "ACE" },
    { title: "Instructor", org: "Hatton Boxing Academy" },
    { title: "Instructor Body Combat", org: "Les Mills" },
    { title: "Certified Nutrition for Health and Performance", org: "Optimum" },
    { title: "Certified Personal Trainer", org: "Global Academy" },
    { title: "Certified Female Glute Relocation Program and Corrective Strategies for Hip Dysfunction", org: "" },
    { title: "Instructor", org: "International Federation of Muay Thai Association" }
  ]

  return (
    <div className="min-h-screen bg-[#0d111a] text-white">
     {/* Hero Section with Background */}
     <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-r from-[#0d111a] via-[#0d111a]/80 to-[#0d111a]/50 z-10"
      ></motion.div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center"></div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-6 sm:pb-8 md:pb-12">
        <div className="flex flex-col items-center sm:items-start md:flex-row md:items-end gap-4 sm:gap-6 md:gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-xl overflow-hidden border-4 border-[#B4E90E] shadow-lg shadow-[#B4E90E]/20"
          >
            <Image
              src={heroContent.image}
              alt={`Coach ${heroContent.name}`}
              width={320}
              height={320}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight"
            >
              COACH <span className="text-[#B4E90E]">{heroContent.name}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mt-2 sm:mt-3"
            >
              {heroContent.title}
            </motion.p>
          </div>
        </div>
      </div>
    </div>


      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0e15] sticky top-0 z-30 border-b border-[#161c2a]"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "about"
                  ? "border-[#B4E90E] text-[#B4E90E]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t('navigation.about')}
            </button>
            <button
              onClick={() => setActiveTab("specialties")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "specialties"
                  ? "border-[#B4E90E] text-[#B4E90E]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t('navigation.specialties')}
            </button>
            <button
              onClick={() => setActiveTab("certifications")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "certifications"
                  ? "border-[#B4E90E] text-[#B4E90E]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t('navigation.certifications')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === "about" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center justify-center">
              <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
              {t('sections.about.title')}
            </h2>
            {aboutContent.paragraphs.map((paragraph, index) => (
              <motion.p 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * (index + 1) }}
                className="text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 text-center text-gray-300"
              >
                {paragraph}
              </motion.p>
            ))}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 sm:mt-12"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center justify-center">
                <Languages className="text-[#B4E90E] mr-3" />
                Languages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {aboutContent.languages.map((lang, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#0a0e15] p-4 sm:p-6 rounded-lg border border-[#161c2a]"
                  >
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl font-bold mb-2">{lang.code}</div>
                      <div className="text-sm sm:text-base text-gray-400">{lang.name}</div>
                      <div className="mt-4 h-1 bg-[#161c2a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#B4E90E] w-full"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "specialties" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center">
              <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
              {t('sections.specialties.title')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {specialties.map((specialty, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0a0e15] p-4 sm:p-6 rounded-lg border border-[#161c2a] hover:border-[#B4E90E] transition-colors group"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-[#161c2a] rounded-lg group-hover:bg-[#B4E90E] group-hover:text-[#0d111a] transition-colors">
                      <Dumbbell size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{specialty.title}</h3>
                      <p className="text-sm sm:text-base text-gray-400">{specialty.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "certifications" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center">
              <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
              {t('sections.certifications.title')}
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0a0e15] p-4 sm:p-6 rounded-lg border border-[#161c2a] hover:border-[#B4E90E] transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Medal className="text-[#B4E90E] flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold">{cert.title}</h3>
                      {cert.org && <p className="text-xs sm:text-sm text-gray-400">{cert.org}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0e15] py-8 sm:py-12 mt-8 sm:mt-12"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="max-w-3xl mx-auto bg-gradient-to-r from-[#9bc80c] to-[#B4E90E] rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-[#0d111a]">
              {t('cta.title')}
            </h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-[#0d111a]/80">
              {t('cta.description')}
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#"
              className="inline-flex items-center gap-2 bg-[#0d111a] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-[#161c2a] transition-colors text-sm sm:text-base"
            >
              {t('cta.button')}
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

