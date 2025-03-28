import React, { useEffect, useRef, useState } from 'react';
import TraxButton from '../TraxButton';
import Link from 'next/link'



interface VideoHeroProps {
  video: any;
  artistName: string;
}

const VideoHero = ({ video, artistName }: VideoHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {

    const videoElement = videoRef.current;

    if (videoElement) {
      // Reset states
      setIsLoading(true);
      setHasError(false);

      const playVideo = async () => {
        try {
          await videoElement.play();
        } catch (error) {
          console.error('Video playback failed:', error);
          setHasError(true);
        }
      };

      const handleCanPlay = () => {
        setIsLoading(false);
        playVideo();
      };

      const handleError = () => {
        console.error('Video loading error');
        setIsLoading(false);
        setHasError(true);
      };

      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('error', handleError);

      // Start loading the video
      videoElement.load();

      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [video]);

  return (
    <div className="relative h-[85vh] w-screen overflow-hidden my-4 ">
      {/* Video Background */}
      {!hasError && (
        <video
          ref={videoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={video?.teaser?.url ? video?.teaser?.url : video?.video?.url} type="video/mp4" />
        </video>
      )}

      <div
          className="w-full absolute h-full top-0"
          style={{backgroundImage: "linear-gradient(180deg,#0e0e0e,#0000 20%,#0000 60%,#0e0e0e)"}}
        />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500">
          Failed to load video
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative font-heading h-full flex flex-col items-start  justify-end text-white px-6 pb-8">
        <h1 className="text-[100px] uppercase tracking-tighter sm:text-[80px] md:text-[100px] lg:text-[140px] text-[#F2F2F2] font-black ">
          {video?.title}
        </h1>
        <Link className="" href={`/${video?.trackType === 'video' ? video?.trackType : 'track'}/?id=${video?.slug}`}>
        <TraxButton
            htmlType="button"
            styleType="primary"
            buttonSize='medium'
            buttonText="watch now"
        />
        </Link>

      </div>
    </div>
  );
};

export default VideoHero;