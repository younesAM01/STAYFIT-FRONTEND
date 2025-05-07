"use client";
import { useTranslations, useLocale } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { Star, StarHalf, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from '@/context/authContext';
import { useGetReviewsQuery } from '@/redux/services/review.service';

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const { loading } = useAuth();
  
  const { data, isLoading: isReviewsLoading, isSuccess: isReviewsSuccess, isError: isReviewsError } = useGetReviewsQuery();


  useEffect(() => {
    if (isReviewsSuccess && data) {
      setReviews(data.data);
    }
  }, [data, isReviewsSuccess]);

  useEffect(() => {
    if (reviews.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center my-8 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
      </div>
    );
  }

  if (isReviewsLoading) {
    return (
      <div className="flex justify-center items-center my-8 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
      </div>
    );
  }

  if (isReviewsError) {
    return (
      <div className="text-white text-center py-16">
        Error fetching reviews
      </div>
    );
  }

  // Helper function to get the localized content
  const getLocalizedContent = (item, field) => {
    if (!item || !item[field]) return '';
    return item[field][locale] || item[field]['en'] || '';
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
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

  return (
    <div className="flex justify-center items-center my-8 py-8">
      <div className="max-w-4xl w-11/12 text-center relative px-4">
        <div className="text-center flex flex-col items-center mb-10">
          <h2 className="text-md md:text-2xl font-bold flex flex-wrap items-center justify-center text-center mb-6 text-white">
            <span className="mx-4 w-16 md:w-28 h-0.5 bg-[#B4E90E] block"></span>
            {t('testemonia')}
            <span className="ml-4 w-16 md:w-28 h-0.5 bg-[#B4E90E] block"></span>
          </h2>
        </div>

        {isReviewsLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#1a1f2c] p-6 rounded-xl shadow-lg border border-[#B4E90E]/30">
            <p className="text-white">No reviews available.</p>
          </div>
        ) : (
          <>
            <div className="relative h-[400px] md:h-[350px] overflow-hidden">
              {reviews.map((review, index) => (
                <div
                  key={review._id || index}
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
                      src={review.userId?.profilePic || review.image || 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg'} 
                      alt={getLocalizedContent(review, 'name')} 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.src = 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg';
                      }}
                    />
                  </div>

                  <div className="flex justify-center mb-2">
                    {renderStars(review.rating)}
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                    {getLocalizedContent(review, 'name')}
                  </h3>

                  <p className="text-sm text-[#B4E90E] font-semibold mb-4">
                    {locale === 'en' 
                      ? `Coached by ${getLocalizedContent(review, 'trainerName')}`
                      : `${getLocalizedContent(review, 'trainerName')} تدريب من طرف`
                    }
                  </p>

                  <div className="relative max-w-2xl">
                    {getLocalizedContent(review, 'quote') && (
                      <>
                        <span className="absolute -top-4 -left-2 text-4xl md:text-5xl text-[#B4E90E] leading-none opacity-50">"</span>
                        <p className="italic text-white text-sm md:text-base leading-relaxed px-4 md:px-8">
                          {getLocalizedContent(review, 'quote')}
                        </p>
                        <span className="absolute -bottom-4 -right-2 text-4xl md:text-5xl text-[#B4E90E] leading-none opacity-50">"</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-4">
              {reviews.map((_, index) => (
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