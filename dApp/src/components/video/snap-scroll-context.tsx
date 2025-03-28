import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

interface SnapScrollContextType {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  currentIndex: number;
  scrollToIndex: (index: number) => void;
  handleScroll: () => void;
}

const SnapScrollContext = createContext<SnapScrollContextType | undefined>(undefined);

export const useSnapScroll = () => {
  const context = useContext(SnapScrollContext);
  if (!context) {
    throw new Error('useSnapScroll must be used within a SnapScrollProvider');
  }
  return context;
};

interface SnapScrollProviderProps {
  children: React.ReactNode;
}

export const SnapScrollProvider: React.FC<SnapScrollProviderProps> = ({ children }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const items = scrollContainerRef.current.children;
      if (items[index]) {
        items[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
        setCurrentIndex(index);
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.firstElementChild?.clientWidth || 0;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  }, []);

  return (
    <SnapScrollContext.Provider value={{
      scrollContainerRef,
      currentIndex,
      scrollToIndex,
      handleScroll
    }}>
      {children}
    </SnapScrollContext.Provider>
  );
};
