import React, { useState, useRef, useEffect } from 'react';

interface ScrollingTextProps {
  text: string;
  className?: string;
}

const ScrollingText: React.FC<ScrollingTextProps> = ({ text, className = "" }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const isTextOverflowing = textRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsOverflowing(isTextOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="relative flex"
      >
        <div
          ref={textRef}
          className={`whitespace-nowrap text-trax-white font-light font-body text-base mb-0 ${className} ${
            isOverflowing && isHovering
              ? 'animate-ticker'
              : ''
          }`}
          style={{
            transform: !isOverflowing || !isHovering ? 'translateX(0)' : undefined,
            transition: !isOverflowing || !isHovering ? 'transform 0.3s ease-out' : undefined
          }}
        >
          {text}
          {isOverflowing && isHovering && (
            <>
              <span className="mx-4">•</span>
              {text}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrollingText;