"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, Users, Award, Heart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button";
import abt from "@/assets/abt1.jpg"

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
  // Refs for scroll animations
  const storyRef = useRef(null)
  const valuesRef = useRef(null)
  const teamRef = useRef(null)

  // Team members data
  const teamMembers = [
    {
      name: "John Doe",
      role: "Founder & Head Coach",
      image: "/placeholder.svg?height=400&width=400&text=John",
      bio: "Former Olympic athlete with 15+ years of coaching experience. John founded Elite Fitness to help people transform their lives through fitness.",
    },
    {
      name: "Sarah Johnson",
      role: "Nutrition Specialist",
      image: "/placeholder.svg?height=400&width=400&text=Sarah",
      bio: "Certified nutritionist with a passion for helping clients achieve their goals through proper diet and exercise balance.",
    },
    {
      name: "Michael Chen",
      role: "Performance Coach",
      image: "/placeholder.svg?height=400&width=400&text=Michael",
      bio: "Specializes in athletic performance and rehabilitation. Michael has worked with professional athletes across multiple sports.",
    },
  ]

  // Core values data
  const coreValues = [
    {
      icon: <Users className="h-10 w-10 text-[#B4E90E]" />,
      title: "Community",
      description: "We believe in building a supportive community where everyone feels welcome and motivated.",
    },
    {
      icon: <Award className="h-10 w-10 text-[#B4E90E]" />,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from our training programs to our facility.",
    },
    {
      icon: <Heart className="h-10 w-10 text-[#B4E90E]" />,
      title: "Passion",
      description: "Our coaches are passionate about fitness and dedicated to helping you achieve your goals.",
    },
    {
      icon: <Clock className="h-10 w-10 text-[#B4E90E]" />,
      title: "Consistency",
      description: "We believe consistent effort over time is the key to lasting transformation and results.",
    },
  ]

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
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              Our journey, our mission, and the team behind your transformation
            </p>
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
            <div className="space-y-4 text-gray-300">
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
                Over the years, we've helped thousands of clients achieve their fitness goals, whether that's losing
                weight, building strength, improving athletic performance, or simply leading healthier lives.
              </p>
            </div>
          </motion.div>
          <motion.div variants={fadeIn} className="order-1 md:order-2 relative h-[400px] rounded-xl overflow-hidden">
            <Image
              src="/placeholder.svg?height=800&width=600&text=Our+Journey"
              alt="Our Story"
              fill
              className="object-cover"
            />
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
              Our <span className="text-[#B4E90E]">Core Values</span>
            </motion.h2>
            <motion.p variants={fadeIn} className="max-w-2xl mx-auto text-gray-300">
              These principles guide everything we do at Elite Fitness
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {coreValues.map((value, index) => (
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
            Meet Our <span className="text-[#B4E90E]">Leadership Team</span>
          </motion.h2>
          <motion.p variants={fadeIn} className="max-w-2xl mx-auto text-gray-300">
            The experts behind our training programs and philosophy
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {teamMembers.map((member, index) => (
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
              Ready to <span className="text-[#B4E90E]">Start Your Journey</span> With Us?
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-gray-300">
              Join our community today and take the first step toward achieving your fitness goals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                className="bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c] px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link href="/en/coaches">Meet Our Coaches</Link>
              </Button>

            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

