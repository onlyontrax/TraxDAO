import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountHeading from '../count-heading';

const ImageCarousel = ({ profiles = [], title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [needsScroll, setNeedsScroll] = useState(false);
  const titleRef = useRef(null);
  const containerRef = useRef(null);
  
  const slideWidth = 270;
  const slideSpacing = slideWidth;
  const centerOffset = 0;

  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current && containerRef.current) {
        const titleWidth = titleRef.current.scrollWidth / 2; // Divide by 2 because we duplicate the text
        const containerWidth = containerRef.current.offsetWidth;
        setNeedsScroll(titleWidth > containerWidth);
      }
    };

    // Reset overflow check when slide changes
    setNeedsScroll(false);
    
    // Add a small delay to allow the new content to render
    const timeoutId = setTimeout(checkOverflow, 50);

    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
      clearTimeout(timeoutId);
    };
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === profiles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? profiles.length - 1 : prevIndex - 1
    );
  };

  const calculateSlidePosition = (index) => {
    let position = -currentIndex * slideSpacing + index * slideSpacing + centerOffset;
    const totalWidth = profiles.length * slideSpacing;
    
    if (position < -totalWidth / 2) position += totalWidth;
    if (position > totalWidth / 2) position -= totalWidth;
    
    return position;
  };

  const calculateZIndex = (index) => {
    const distance = Math.abs(index - currentIndex);
    const reverseDistance = profiles.length - distance;
    const shortestDistance = Math.min(distance, reverseDistance);
    return profiles.length - shortestDistance;
  };

  const isMobile = window.innerWidth <= 600;

  return (
    <div className="relative w-full mx-auto overflow-hidden bg-black h-[450px] md:h-[600px] mt-4">
      {/* Animated title */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          ref={containerRef}
          className="absolute z-[5] inset-0 flex items-end justify-center pointer-events-none sm:pl-10 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '50%' }}
          transition={{ duration: 0.5 }}
        >
          <div ref={titleRef} className="flex">
            <h1 
              className={`${
                isMobile 
                  ? profiles[currentIndex].title.length <= 8
                    ? "text-9xl"
                    : profiles[currentIndex].title.length < 16
                      ? "text-7xl"
                      : "text-5xl"
                  : "text-9xl"
              } text-trax-white uppercase leading-[0px] font-heading tracking-tight font-bold whitespace-nowrap transition-all duration-500`}
            >
              {profiles[currentIndex].title}
            </h1>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel container */}
      <div className="relative h-full w-screen flex items-center justify-center">
        {profiles.map((profile, index) => {
          const zIndex = calculateZIndex(index);
          return (
            <motion.a
              href={profile.link}
              key={index}
              className="absolute rounded-full overflow-hidden w-[270px] h-[270px] md:w-[400px] md:h-[400px]"
              animate={{
                x: calculateSlidePosition(index),
                scale: index === currentIndex ? 1 : 0.8,
                zIndex: zIndex,
                filter: index === currentIndex ? 'brightness(1)' : 'brightness(0.7)',
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
              style={{
                transformOrigin: 'center center',
              }}
            >
              <img
                src={profile.photo.url}
                alt={profile.title}
                className="w-full h-full object-cover"
              />
            </motion.a>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div 
        className="flex absolute right-0 top-0 to-black z-[1] h-[360px] w-28"
        style={{background: "linear-gradient(90deg, rgba(14, 14, 14, 0) 0px, rgba(14, 14, 14, 0.01) 8.1%, rgba(14, 14, 14, 0.047) 15.5%, rgba(14, 14, 14, 0.106) 22.5%, rgba(14, 14, 14, 0.176) 29%, rgba(14, 14, 14, 0.26) 35.3%, rgba(14, 14, 14, 0.353) 41.2%, rgba(14, 14, 14, 0.45) 47.1%, rgba(14, 14, 14, 0.55) 52.9%, rgba(14, 14, 14, 0.647) 58.8%, rgba(14, 14, 14, 0.74) 64.7%, rgba(14, 14, 14, 0.824) 71%, rgba(14, 14, 14, 0.894) 77.5%, rgba(14, 14, 14, 0.953) 84.5%, rgba(14, 14, 14, 0.99) 91.9%, rgb(14, 14, 14))"}}
      />
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-1 text-trax-white bg-[#414141] rounded-lg hover:text-custom-green transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-1 text-trax-white bg-[#414141] rounded-lg hover:text-custom-green transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Counter in top left corner */}
      <div className="absolute top-0 text-custom-green font-mono pl-6 sm:pl-10 ">
        <CountHeading isLarge={true} title={title} count={profiles.length} />
      </div>

      {/* Add the CSS animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default ImageCarousel;