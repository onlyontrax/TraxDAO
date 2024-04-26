import React, { useEffect, useRef } from 'react';

const Carousel = () => {
  const carouselRef = useRef(null);

  const moveToSelected = (element) => {
    const selected = element === 'next' ? carouselRef.current.querySelector('.selected').nextElementSibling :
                     element === 'prev' ? carouselRef.current.querySelector('.selected').previousElementSibling :
                     element;

    const next = selected.nextElementSibling;
    const prev = selected.previousElementSibling;
    let prevSecond = prev.previousElementSibling;
    let nextSecond = next.nextElementSibling;

    selected.className = 'selected';

    if (prev) prev.className = 'prev';
    if (next) next.className = 'next';
    if (prevSecond) prevSecond.className = 'prevLeftSecond';
    if (nextSecond) nextSecond.className = 'nextRightSecond';

    while (nextSecond && nextSecond.nextElementSibling) {
      nextSecond.nextElementSibling.className = 'hideRight';
      nextSecond = nextSecond.nextElementSibling;
    }

    while (prevSecond && prevSecond.previousElementSibling) {
      prevSecond.previousElementSibling.className = 'hideLeft';
      prevSecond = prevSecond.previousElementSibling;
    }
  };

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 37: // left
        moveToSelected('prev');
        break;
      case 39: // right
        moveToSelected('next');
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleItemClick = (e) => {
    moveToSelected(e.target);
  };

  const handlePrevClick = () => {
    moveToSelected('prev');
  };

  const handleNextClick = () => {
    moveToSelected('next');
  };

  return (
    <div className="carousel" ref={carouselRef}>
      {/* Render your carousel items here */}
      <div className="hideLeft">
         <img src="https://i1.sndcdn.com/artworks-000165384395-rhrjdn-t500x500.jpg"/>
        </div>
        
        <div className="prevLeftSecond">
         <img src="https://i1.sndcdn.com/artworks-000185743981-tuesoj-t500x500.jpg"/>
        </div>
        
        <div className="prev">
         <img src="https://i1.sndcdn.com/artworks-000158708482-k160g1-t500x500.jpg"/>
        </div>
        
        <div className="selected">
         <img src="https://i1.sndcdn.com/artworks-000062423439-lf7ll2-t500x500.jpg"/>
        </div>
        
        <div className="next">
         <img src="https://i1.sndcdn.com/artworks-000028787381-1vad7y-t500x500.jpg"/>
        </div>
        
        <div className="nextRightSecond">
         <img src="https://i1.sndcdn.com/artworks-000108468163-dp0b6y-t500x500.jpg"/>
        </div>
        
        <div className="hideRight">
         <img src="https://i1.sndcdn.com/artworks-000064920701-xrez5z-t500x500.jpg"/>
        </div>
       
      {/* ... other carousel items ... */}
      
      <div className="c-buttons">
      {/* Add prev and next buttons */}
      <button id="prev" onClick={handlePrevClick}>Prev</button>
      <button id="next" onClick={handleNextClick}>Next</button>
    </div>
    </div>
  );
};

export default Carousel;
