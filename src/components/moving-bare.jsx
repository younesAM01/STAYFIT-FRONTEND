"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import img from "@/assets/logo.png"

export default function FitnessNavbar() {
  const categories = [
    { name: "CARDIO-TRAINING", href: "#" },
    { name: "MMA", href: "#" },
    { name: "BOXING", href: "#" },
    { name: "KICKBOXING", href: "#" },
    { name: "BODYBUILDING", href: "#" },
  ]

  // Duplicate the categories to create a seamless loop
  const allCategories = [...categories, ...categories, ...categories, ...categories, ...categories, ...categories] // Tripling the categories for a smoother infinite loop

  const scrollRef = useRef(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    // Set initial position
    scrollContainer.scrollLeft = 0

    const animateScroll = () => {
      if (!scrollContainer) return

      // Reset scroll position when reaching the end of the duplicated categories
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
        scrollContainer.scrollLeft = 0
      } else {
        scrollContainer.scrollLeft += 2
      }
    }

    const animationId = setInterval(animateScroll, 40)

    return () => {
      clearInterval(animationId)
    }
  }, [])

  return (
    <nav className="w-full mt-2 bg-[#B4E90E] overflow-hidden ">
      <div ref={scrollRef} className="flex whitespace-nowrap overflow-x-hidden" style={{ scrollBehavior: "auto" }}>
        <div className="flex animate-marquee">
          {allCategories.map((category, index) => (
            <Link
              key={`${category.name}-${index}`}
              href={category.href}
              className={cn(
                "flex items-center gap-2 px-8 py-2 font-bold text-[#0d111a] hover:opacity-80 transition-opacity",
              )}
            >
              <div className="relative h-10 w-24 flex-shrink-0">
                <Image
                  src={img}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-base md:text-lg uppercase tracking-wide">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
