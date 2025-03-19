"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell, FishIcon as Swimming, BoxIcon as Boxing, Heart } from "lucide-react"

// Sample coaches data with two images per coach
const coaches = [
  {
    id: 1,
    name: "Alex Johnson",
    specialty: "Strength Training",
    categories: ["gym"],
    image: "https://i.pinimg.com/474x/47/43/f7/4743f767aacfdfad392f14cbd6068eb3.jpg",
    hoverImage: "https://i.pinimg.com/474x/47/43/f7/4743f767aacfdfad392f14cbd6068eb3.jpg",
    experience: "10+ years",
  },
  {
    id: 2,
    name: "Sarah Williams",
    specialty: "Cardio Specialist",
    categories: ["cardio"],
    image: "https://i.pinimg.com/474x/aa/1e/2d/aa1e2df688b7973ac727c946b1236a0a.jpg",
    hoverImage: "https://i.pinimg.com/474x/aa/1e/2d/aa1e2df688b7973ac727c946b1236a0a.jpg",
    experience: "8 years",
  },
  {
    id: 3,
    name: "Mike Tyson",
    specialty: "Boxing Champion",
    categories: ["boxing"],
    image: "https://i.pinimg.com/474x/77/fa/a5/77faa57e1970621e63ee70605a9c18f3.jpg",
    hoverImage: "https://i.pinimg.com/474x/77/fa/a5/77faa57e1970621e63ee70605a9c18f3.jpg",
    experience: "15+ years",
  },
  {
    id: 4,
    name: "Emma Davis",
    specialty: "Swimming Coach",
    categories: ["swimming"],
    image: "https://i.pinimg.com/736x/7a/cb/32/7acb325350f365650c5b454110afe5b9.jpg",
    hoverImage: "https://i.pinimg.com/736x/7a/cb/32/7acb325350f365650c5b454110afe5b9.jpg",
    experience: "12 years",
  },
  {
    id: 5,
    name: "Chris Parker",
    specialty: "CrossFit Expert",
    categories: ["gym", "cardio"],
    image: "https://i.pinimg.com/736x/3b/af/de/3bafdec795d05743cc394b333556f3bd.jpg",
    hoverImage: "https://i.pinimg.com/736x/3b/af/de/3bafdec795d05743cc394b333556f3bd.jpg",
    experience: "7 years",
  },
  {
    id: 6,
    name: "Lisa Rodriguez",
    specialty: "HIIT Trainer",
    categories: ["cardio", "gym"],
    image: "https://i.pinimg.com/736x/79/3a/b1/793ab11603c2f931ae82bad4f5e3219c.jpg",
    hoverImage: "https://i.pinimg.com/736x/79/3a/b1/793ab11603c2f931ae82bad4f5e3219c.jpg",
    experience: "9 years",
  },
  {
    id: 7,
    name: "David Kim",
    specialty: "Boxing Instructor",
    categories: ["boxing"],
    image: "https://i.pinimg.com/736x/91/9d/e7/919de76e84604e977598671a7052bcac.jpg",
    hoverImage: "https://i.pinimg.com/736x/91/9d/e7/919de76e84604e977598671a7052bcac.jpg",
    experience: "11 years",
  },
  {
    id: 8,
    name: "Natalie Chen",
    specialty: "Olympic Swimmer",
    categories: ["swimming"],
    image: "https://i.pinimg.com/736x/43/7f/03/437f03c960c999e6d44792d8529f0d02.jpg",
    hoverImage: "/placeholder.svg?height=400&width=400&text=Natalie+Training",
    experience: "14 years",
  },
]

export default function FitnessCoaching() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredCoaches =
    activeFilter === "all" ? coaches : coaches.filter((coach) => coach.categories.includes(activeFilter))

  const getCategoryIcon = (category) => {
    switch (category) {
      case "gym":
        return <Dumbbell className="h-5 w-5" />
      case "cardio":
        return <Heart className="h-5 w-5" />
      case "boxing":
        return <Boxing className="h-5 w-5" />
      case "swimming":
        return <Swimming className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://i.pinimg.com/736x/b9/5e/34/b95e3402e0301cf3f3ab308147d81bcf.jpg"
            alt="Fitness Hero"
            fill
            className="object-cover opacity-40 "
            priority
          />
        </div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Transform Your Body, <span className="text-[#B4E90E]">Transform Your Life</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              Our expert coaches are ready to guide you through your fitness journey, providing personalized training to
              help you achieve your goals.
            </p>
            <Button className="bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c] px-8 py-6 text-lg font-semibold">
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Meet Our <span className="text-[#B4E90E]">Expert Coaches</span>
        </h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-2 rounded-full ${
              activeFilter === "all" ? "bg-[#B4E90E] text-[#0d111a]" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            All
          </Button>
          <Button
            onClick={() => setActiveFilter("cardio")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 ${
              activeFilter === "cardio" ? "bg-[#B4E90E] text-[#0d111a]" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            <Heart className="h-4 w-4" /> Cardio
          </Button>
          <Button
            onClick={() => setActiveFilter("gym")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 ${
              activeFilter === "gym" ? "bg-[#B4E90E] text-[#0d111a]" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            <Dumbbell className="h-4 w-4" /> Gym
          </Button>
          <Button
            onClick={() => setActiveFilter("boxing")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 ${
              activeFilter === "boxing" ? "bg-[#B4E90E] text-[#0d111a]" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            <Boxing className="h-4 w-4" /> Boxing
          </Button>
          <Button
            onClick={() => setActiveFilter("swimming")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 ${
              activeFilter === "swimming" ? "bg-[#B4E90E] text-[#0d111a]" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            <Swimming className="h-4 w-4" /> Swimming
          </Button>
        </div>

        {/* Coaches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center md:justify-items-normal">
            {filteredCoaches.map((coach) => (
                <Card
                key={coach.id}
                className="bg-gray-800 border-none overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
                >
                <div className="relative min-h-80 overflow-hidden group">
                    <Image
                    src={coach.image || "/placeholder.svg"}
                    alt={coach.name}
                    fill
                    className="object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                    />
                    <Image
                    src={coach.hoverImage || "/placeholder.svg"}
                    alt={`${coach.name} in action`}
                    fill
                    className="object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
                    />
                </div>
                <CardContent className="py-4 px-6">
                    <h3 className="text-xl font-bold text-amber-50 mb-1">{coach.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                    {coach.categories.map((category) => (
                        <span key={category} className="flex items-center text-[#B4E90E]">
                        {getCategoryIcon(category)}
                        </span>
                    ))}
                    </div>
                    <p className="text-gray-400 mb-2">{coach.specialty}</p>
                    <p className="text-sm text-gray-500">{coach.experience} experience</p>
                    <div className="flex gap-2 mt-4">
                    <Button className="flex-1 bg-transparent border border-[#B4E90E] text-[#B4E90E] hover:bg-[#B4E90E] hover:text-[#0d111a]">
                        View Profile
                    </Button>
                    <Button className="flex-1 bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c]">Book Now</Button>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
      </section>
    </div>
  )
}

