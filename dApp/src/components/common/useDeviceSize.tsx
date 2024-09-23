import { useState, useEffect } from 'react';

export default function useDeviceSize () {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 500);
  const [isTablet, setIsTablet] = useState<boolean>(window.innerWidth >= 500 && window.innerWidth < 650);
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 650);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 500);
      setIsTablet(window.innerWidth >= 500 && window.innerWidth < 650);
      setIsDesktop(window.innerWidth >= 650);
    };

    window.addEventListener('resize', handleResize);

    // Initial screen size check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isMobile, isTablet, isDesktop };
};