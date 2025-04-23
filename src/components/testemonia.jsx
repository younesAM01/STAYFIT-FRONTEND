"use client";
import { useTranslations, useLocale } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { Star, StarHalf, ChevronLeft, ChevronRight, Send, Dumbbell } from "lucide-react";
import { useAuth } from '@/context/authContext';

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: { en: "", ar: "" },
    trainerName: { en: "", ar: "" },
    quote: { en: "", ar: "" },
    rating: 0,
    image: null
  });
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const { mongoUser, isAuthenticated, loading } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState('');
  
  useEffect(() => {
    // Fetch reviews from the backend
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/review');
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.data);
        } else {
          console.error('Failed to fetch reviews:', data.error);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, []);

  // Fetch coaches from backend
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        console.log('Fetching coaches...');
        const response = await fetch('/api/coach');
        const data = await response.json();
        console.log('Coaches response:', data);
        
        if (Array.isArray(data)) {
          console.log('Setting coaches:', data);
          setCoaches(data);
        } else {
          console.error('Failed to fetch coaches: Invalid data format');
        }
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };
    fetchCoaches();
  }, []);

  // Add a useEffect to log coaches state changes
  useEffect(() => {
    console.log('Coaches state updated:', coaches);
  }, [coaches]);

  // Add loading state check
  if (loading) {
    return (
      <div className="flex justify-center items-center my-8 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
      </div>
    );
  }

  // Pre-fill user information when form is shown and user is logged in
  useEffect(() => {
    if (showForm && mongoUser) {
      console.log('Current mongoUser:', mongoUser);
      setNewReview(prev => ({
        ...prev,
        name: {
          en: `${mongoUser.firstName} ${mongoUser.lastName}`,
          ar: `${mongoUser.firstName} ${mongoUser.lastName}`
        },
        image: mongoUser.profilePic || mongoUser.profilePicture
      }));
    }
  }, [showForm, mongoUser]);

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

  useEffect(() => {
    if (!showForm && reviews.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, showForm, reviews.length]);

  const handleInputChange = (e, lang) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [lang]: value
      }
    }));
  };

  const handleRatingClick = (rating) => {
    setNewReview((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleCoachSelect = (e) => {
    const coachId = e.target.value;
    setSelectedCoach(coachId);
    
    // Find the selected coach from the coaches array
    const selectedCoachData = coaches.find(coach => coach._id === coachId);
    
    if (selectedCoachData) {
      setNewReview(prev => ({
        ...prev,
        trainerName: {
          en: `${selectedCoachData.firstName} ${selectedCoachData.lastName}`,
          ar: `${selectedCoachData.firstName} ${selectedCoachData.lastName}`
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formSubmitting) return;
    setFormSubmitting(true);

    if (!isAuthenticated || !mongoUser) {
      alert("Please log in to submit a review");
      setFormSubmitting(false);
      return;
    }

    if (!selectedCoach) {
      alert("Please select a coach");
      setFormSubmitting(false);
      return;
    }

    if (!newReview.rating || newReview.rating < 1) {
      alert("Please provide a rating between 1 and 5");
      setFormSubmitting(false);
      return;
    }

    if (!mongoUser._id) {
      alert("User ID is missing. Please try logging in again.");
      setFormSubmitting(false);
      return;
    }
    
    try {
      const reviewData = {
        rating: newReview.rating,
        userId: mongoUser._id,
        coachId: selectedCoach,
        quote: newReview.quote || { en: "", ar: "" },
        name: {
          en: `${mongoUser.firstName} ${mongoUser.lastName}`,
          ar: `${mongoUser.firstName} ${mongoUser.lastName}`
        },
        trainerName: newReview.trainerName || { en: "", ar: "" },
        image: mongoUser.profilePic || mongoUser.profilePicture
      };

      console.log('Submitting review data:', reviewData); // Debug log

      const reviewResponse = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const result = await reviewResponse.json();
      console.log('Review submission result:', result); // Debug log

      if (result.success) {
        // Refresh the reviews to include the new one
        const refreshResponse = await fetch('/api/review');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setReviews(refreshData.data);
        }
        
        // Reset the form
        setNewReview({
          name: { en: "", ar: "" },
          trainerName: { en: "", ar: "" },
          quote: { en: "", ar: "" },
          rating: 0,
          image: null
        });
        setSelectedCoach('');
        setShowForm(false);
      } else {
        console.error("Error adding review:", result.error);
        alert(result.error || "Failed to add review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("An error occurred while submitting the review");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Add useEffect to log mongoUser when it changes
  useEffect(() => {
    console.log('mongoUser updated:', mongoUser);
  }, [mongoUser]);

  // Add a useEffect to log auth state changes
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, mongoUser });
  }, [isAuthenticated, mongoUser]);

  // Add loading state for auth
  if (loading) {
    return (
      <div className="flex justify-center items-center my-8 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
      </div>
    );
  }

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

          {isAuthenticated && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#B4E90E] hover:bg-[#a3d00c] text-[#0d111a] font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              {showForm ? "View Trainer Reviews" : "Rate Your Trainer"}
              <Dumbbell className="w-4 h-4" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
          </div>
        ) : showForm && isAuthenticated ? (
          <div className="bg-[#1a1f2c] p-6 rounded-xl shadow-lg border border-[#B4E90E]/30 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">Rate Your Trainer</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left text-white text-sm mb-1">
                How would you rate your experience?
              </div>
              {renderRatingInput()}

              <div className="space-y-2">
                <label className="block text-left text-white text-sm">
                  Select Your Coach
                </label>
                <select
                  value={selectedCoach}
                  onChange={handleCoachSelect}
                  className="w-full p-3 rounded-lg bg-[#2a303c] text-white border border-[#B4E90E]/30 focus:border-[#B4E90E] focus:outline-none"
                >
                  <option value="">Select a coach</option>
                  {coaches && coaches.length > 0 ? (
                    coaches.map(coach => (
                      <option key={coach._id} value={coach._id}>
                        {coach.firstName} {coach.lastName}
                      </option>
                    ))
                  ) : (
                    <option disabled>No coaches available</option>
                  )}
                </select>
                {coaches && coaches.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">No coaches found. Please try again later.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <textarea
                    name="quote"
                    value={newReview.quote.en || ''}
                    onChange={(e) => handleInputChange(e, 'en')}
                    placeholder="Share your experience (English)..."
                    rows={4}
                    className="w-full p-3 rounded-lg bg-[#2a303c] text-white border border-[#B4E90E]/30 focus:border-[#B4E90E] focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <textarea
                    name="quote"
                    value={newReview.quote.ar || ''}
                    onChange={(e) => handleInputChange(e, 'ar')}
                    placeholder="شارك تجربتك (بالعربية)..."
                    rows={4}
                    className="w-full p-3 rounded-lg bg-[#2a303c] text-white border border-[#B4E90E]/30 focus:border-[#B4E90E] focus:outline-none resize-none text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className={`bg-[#B4E90E] hover:bg-[#a3d00c] text-[#0d111a] font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full transition-all duration-300 ${formSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {formSubmitting ? (
                  <>Submitting... <div className="animate-spin h-4 w-4 border-t-2 border-[#0d111a] rounded-full"></div></>
                ) : (
                  <>Submit Review <Send className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#1a1f2c] p-6 rounded-xl shadow-lg border border-[#B4E90E]/30">
            <p className="text-white">No reviews yet. Be the first to rate a trainer!</p>
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
                    {getLocalizedContent(review, 'trainerName')}
                  </p>

                  <div className="relative max-w-2xl">
                    <p className="italic text-white text-sm md:text-base leading-relaxed px-4 md:px-8">
                      {getLocalizedContent(review, 'quote')}
                    </p>
                    <span className="absolute top-0 left-0 text-4xl md:text-5xl text-[#B4E90E] leading-none opacity-50">"</span>
                    <span className="absolute bottom-0 right-0 text-4xl md:text-5xl text-[#B4E90E] leading-none opacity-50">"</span>
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