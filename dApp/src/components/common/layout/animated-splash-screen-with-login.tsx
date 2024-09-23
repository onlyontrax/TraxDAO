import React, { useEffect, useRef } from 'react';

const AnimatedSplashScreen = () => {
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);

  useEffect(() => {
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;

    if (row1 && row2) {
      row1.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-50%)' }
        ],
        {
          duration: 20000,
          iterations: Infinity,
          easing: 'linear'
        }
      );

      row2.animate(
        [
          { transform: 'translateX(-50%)' },
          { transform: 'translateX(0)' }
        ],
        {
          duration: 20000,
          iterations: Infinity,
          easing: 'linear'
        }
      );
    }
  }, []);

  const images = [
    'https://info.trax.so/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimgrambow.c3e53392.png&w=1200&q=75',
    'https://info.trax.so/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimgcoults.e433d879.png&w=1200&q=75',
    'https://info.trax.so/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimgalienblaze.ef6ada9a.png&w=1200&q=75',
    'https://info.trax.so/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimgimani.b870ed08.png&w=1200&q=75',
    'https://info.trax.so/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimgblanco.7ebb82a8.png&w=1200&q=75',
    '/api/placeholder/100/100',
    '/api/placeholder/100/100',
    '/api/placeholder/100/100',
  ];

  return (
    <div className="h-80 w-screen bg-gray-100 flex flex-col justify-center items-center overflow-hidden">
      
      <div className="w-full overflow-hidden">
        <div ref={row1Ref} className="flex whitespace-nowrap">
          {images.concat(images).map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Image ${index + 1}`}
              className="h-36 image-contain rounded-lg mx-2 inline-block"
            />
          ))}
        </div>
      </div>
      <div className="w-full overflow-hidden mt-4">
        <div ref={row2Ref} className="flex whitespace-nowrap">
          {images.concat(images).map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Image ${index + 9}`}
              className="h-36 rounded-lg mx-2 inline-block"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedSplashScreen;