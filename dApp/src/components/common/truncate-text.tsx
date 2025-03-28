import React, { useRef, useEffect, useState } from 'react';

interface TruncateTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const TruncateText: React.FC<TruncateTextProps> = ({ text, className, style }) => {
  const [truncatedText, setTruncatedText] = useState(text);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const truncateIfNeeded = () => {
      const div = textRef.current;
      if (!div) return;

      const availableWidth = div.clientWidth;
      div.textContent = text;

      if (div.scrollWidth <= availableWidth) {
        setTruncatedText(text);
        return;
      }

      let low = 0;
      let high = text.length;
      let best = 0;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        div.textContent = text.slice(0, mid) + '...';

        if (div.scrollWidth <= availableWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      setTruncatedText(text.slice(0, best) + '...');
    };

    truncateIfNeeded();
    window.addEventListener('resize', truncateIfNeeded);

    return () => {
      window.removeEventListener('resize', truncateIfNeeded);
    };
  }, [text]);

  const combinedStyle: React.CSSProperties = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...style,
  };

  return (
    <div 
      ref={textRef} 
      className={className} 
      style={combinedStyle} 
      title={text}
    >
      {truncatedText}
    </div>
  );
};

export default TruncateText;