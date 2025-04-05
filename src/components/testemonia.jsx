"use client";
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { Star, StarHalf, ChevronLeft, ChevronRight, Send, Dumbbell } from "lucide-react";

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    trainerName: "",
    quote: "",
    rating: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const t = useTranslations('HomePage');

  
  const testimonials = [
    {
      id: 1,
      name: "MICHAEL THOMPSON",
      trainerName: "Coach Alex Rodriguez",
      quote: "Coach Alex completely transformed my approach to fitness. In just 3 months, I lost 25 pounds and gained so much energy. His personalized program and constant motivation made all the difference.",
      image: "https://i.pinimg.com/736x/ab/d6/20/abd62052dc3ccad8152e95aea72b6050.jpg",
      rating: 5,
    },
    {
      id: 2,
      name: "JENNIFER WILLIAMS",
      trainerName: "Coach Sarah Martinez",
      quote: "I've worked with many trainers before, but Coach Sarah's expertise is unmatched. She designed a program specifically for my goals and was always there to correct my form. After 6 weeks, I'm lifting weights I never thought possible!",
      image: "https://i.pinimg.com/736x/ba/fc/c8/bafcc8bab754978e1da209ad1985dc60.jpg",
      rating: 4.5,
    },
    {
      id: 3,
      name: "DAVID CHEN",
      trainerName: "Coach Marcus Johnson",
      quote: "As a college athlete, I needed specialized training to improve my performance. Coach Marcus understood exactly what I needed and created a conditioning program that significantly improved my speed and endurance.",
      image: "https://i.pinimg.com/736x/4b/fe/8a/4bfe8a3a4bed3705187ba6e127880e62.jpg",
      rating: 5,
    },
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
    if (!showForm) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, showForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (rating) => {
    setNewReview((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted review:", newReview);
    setNewReview({
      name: "",
      trainerName: "",
      quote: "",
      rating: 0,
    });
    setShowForm(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-5 h-5 fill-[#B4E90E] text-[#B4E90E]" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="w-5 h-5 fill-[#B4E90E] text-[#B4E90E]" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="w-5 h-5 text-[#B4E90E]" />);
    }

    return stars;
  };

  const renderRatingInput = () => {
    return (
      <div className="flex justify-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                (hoverRating || newReview.rating) >= star 
                  ? "fill-[#B4E90E] text-[#B4E90E]" 
                  : "text-[#B4E90E]"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center my-8 py-8">
      <div className="max-w-4xl w-11/12 text-center relative px-4">
        <div className="text-center flex flex-col items-center mb-10">
          <h2 className="text-md md:text-2xl font-bold flex flex-wrap items-center justify-center text-center mb-6 text-white">
            <span className="mx-4 w-16 md:w-28 h-0.5 bg-[#B4E90E] block"></span>
            {t('testemonia')}
            <span className="ml-4 w-16 md:w-28 h-0.5 bg-[#B4E90E] block"></span>
          </h2>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#B4E90E] hover:bg-[#a3d00c] text-[#0d111a] font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            {showForm ? "View Trainer Reviews" : "Rate Your Trainer"}
            <Dumbbell className="w-4 h-4" />
          </button>
        </div>

        {showForm ? (
          <div className="bg-[#1a1f2c] p-6 rounded-xl shadow-lg border border-[#B4E90E]/30 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">Rate Your Trainer</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left text-white text-sm mb-1">
                How would you rate your experience?
              </div>
              {renderRatingInput()}

              <div>
                <input
                  type="text"
                  name="name"
                  value={newReview.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="w-full p-3 rounded-lg bg-[#2a303c] text-white border border-[#B4E90E]/30 focus:border-[#B4E90E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  name="trainerName"
                  value={newReview.trainerName}
                  onChange={handleInputChange}
                  placeholder="Trainer's Name"
                  className="w-full p-3 rounded-lg bg-[#2a303c] text-white border border-[#B4E90E]/30 focus:border-[#B4E90E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <textarea
                  name="quote"
                  value={newReview.quote}
                  onChange={handleInputChange}
                  placeholder="Share your experience with this trainer..."
                  rows={4}
                  className="w-full p-3 rounded-lg bg-[#2a303c] text-white border border-[#B4E90E]/30 focus:border-[#B4E90E] focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#B4E90E] hover:bg-[#a3d00c] text-[#0d111a] font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full transition-all duration-300"
              >
                Submit Review <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="relative h-[400px] md:h-[350px] overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`absolute w-full transition-all duration-700 ease-in-out flex flex-col items-center px-2 md:px-6 ${
                    index === currentIndex 
                      ? "opacity-100 translate-x-0" 
                      : index < currentIndex
                        ? "opacity-0 -translate-x-full"
                        : "opacity-0 translate-x-full"
                  }`}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 border-2 border-[#B4E90E] p-1">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <div className="flex justify-center mb-2">
                    {renderStars(testimonial.rating)}
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                    {testimonial.name}
                  </h3>

                  <p className="text-sm text-[#B4E90E] font-semibold mb-4">
                    {testimonial.trainerName}
                  </p>

                  <div className="relative max-w-2xl">
                    <p className="italic text-white text-sm md:text-base leading-relaxed px-4 md:px-8">
                      {testimonial.quote}
                    </p>
                    <span className="absolute top-0 left-0 text-4xl md:text-5xl text-[#B4E90E] leading-none opacity-50">"</span>
                    <span className="absolute bottom-0 right-0 text-4xl md:text-5xl text-[#B4E90E] leading-none opacity-50">"</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full mx-1.5 transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-[#B4E90E] scale-125" 
                      : "bg-white/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="absolute top-1/2 w-full flex justify-between px-2 md:px-4 transform -translate-y-1/2 pointer-events-none">
              <button
                onClick={prevSlide}
                className="bg-[#B4E90E]/90 hover:bg-[#B4E90E] text-[#0d111a] w-10 h-10 md:w-12 md:h-12 rounded-full flex justify-center items-center transition-colors duration-300 pointer-events-auto shadow-lg"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="bg-[#B4E90E]/90 hover:bg-[#B4E90E] text-[#0d111a] w-10 h-10 md:w-12 md:h-12 rounded-full flex justify-center items-center transition-colors duration-300 pointer-events-auto shadow-lg"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TestimonialSlider;