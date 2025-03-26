"use client";
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = useTranslations('HomePage');

  
  const testimonials = [
    {
      id: 1,
      name: "ARTIE IPTEAR",
      position: "CEO, UP COMPANY",
      quote: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't.",
      image: "https://i.pinimg.com/736x/ab/d6/20/abd62052dc3ccad8152e95aea72b6050.jpg"
    },
    {
      id: 2,
      name: "SARAH JOHNSON",
      position: "MARKETING DIRECTOR, TECH INC",
      quote: "Working with this team has been an absolute pleasure. Their attention to detail and commitment to quality is unmatched in the industry. I would highly recommend their services.",
      image: "https://i.pinimg.com/736x/ba/fc/c8/bafcc8bab754978e1da209ad1985dc60.jpg"
    },
    {
      id: 3,
      name: "JAMES RODRIGUEZ",
      position: "FOUNDER, STELLAR SOLUTIONS",
      quote: "The level of professionalism and expertise demonstrated by this team is remarkable. They delivered beyond our expectations and helped us achieve our business goals.",
      image: "https://i.pinimg.com/736x/4b/fe/8a/4bfe8a3a4bed3705187ba6e127880e62.jpg"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="flex justify-center items-center ">
      <div className="max-w-3xl w-11/12 text-center relative px-4">
      <div className="text-center flex flex-col items-center mb-10">
          <h2 className=" text-md md:text-2xl font-bold flex items-center text-center mb-6 text-white">
            <span className="mx-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
            {t('testemonia')}
            <span className="ml-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
          </h2>
          
        </div>
        
        <div className="relative h-80 overflow-hidden">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className={`absolute w-full transition-all duration-500 ease-in-out flex flex-col items-center px-6 ${
                index === currentIndex 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-12"
              }`}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {testimonial.name}
              </h3>
              {/* <p className="text-sm text-gray-300 mb-6">
                {testimonial.position}
              </p> */}
              <div className="relative max-w-xl">
                <p className="italic text-white text-base leading-relaxed px-8 ">
                  {testimonial.quote}
                </p>
                <span className="absolute top-0 left-0 text-5xl text-[#B4E90E] leading-none">"</span>
                <span className="absolute bottom-0 right-0 text-5xl text-[#B4E90E] leading-none">"</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mx-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full mx-1 transition-colors duration-300 ${
                index === currentIndex ? "bg-white" : "bg-white/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="absolute top-1/2 w-full flex justify-between px-4 transform -translate-y-1/2 pointer-events-none">
          <button
            onClick={prevSlide}
            className="bg-[#B4E90E] hover:bg-[#B4E90E]/80 text-[#0d111a] w-10 h-10 rounded-full flex justify-center items-center transition-colors duration-300 pointer-events-auto"
            aria-label="Previous testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-left"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
          </button>
          <button
            onClick={nextSlide}
            className="bg-[#B4E90E] hover:bg-[#B4E90E]/80 text-[#0d111a] w-10 h-10 rounded-full flex justify-center items-center transition-colors duration-300 pointer-events-auto"
            aria-label="Next testimonial"
          >
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;