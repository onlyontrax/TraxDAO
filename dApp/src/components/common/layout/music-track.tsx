import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import ScrollingText from './scrolling-text';
import Link from 'next/link';
import { BackwardIcon, ForwardIcon, PlayIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import CollaboratorList from '@components/video/collaborator-list';

interface Thumbnail {
  url: string;
}

interface Video {
  thumbnails?: string[];
  duration: number;
}

interface Performer {
  name: string;
}

interface TrackListItemProps {
  track: any;
  index: number;
  themeColor?: string;
}

const TrackListItem: React.FC<TrackListItemProps> = ({
  track,
  index,
  themeColor
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial screen width
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial value
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const membersOnly = track.isSale === 'subscription' && !track.isSubscribed;
  const unpaid = track.isSale === 'pay' && !track.isBought && !track.isSchedule;

  const formatSeconds = (seconds) => {
    if (!seconds) {
      return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  }

  const thumbnailOverlay = (message: String) => (
    <div className='flex items-center justify-center z-10'>
      <div className='bg-trax-black rounded-md backdrop-blur uppercase flex flex-row py-2 px-3 gap-1'>
        <LockClosedIcon className='text-custom-green' width={14} height={14} />
        <span className='text-custom-green text-xs'>{message}</span>
      </div>
    </div>
  );

   const calcBackgroundStyle = () => {
    const thumbnails = track?.thumbnail?.thumbnails;
    const fallbackUrl = track?.thumbnail?.url;

    return thumbnails?.length ? thumbnails[0] : fallbackUrl ?? '/static/no-image.jpg';
  };

  return (
    <Link
      href={`/${track?.trackType === 'video' ? track?.trackType : 'track'}/?id=${track?.slug}`}
      key={index}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-4 p-2 pl-3 pr-4 cursor-pointer hover:bg-slaps-gray rounded-lg transition-colors relative"
    >
      {!isMobile && (
        <div className="relative w-4 flex items-center justify-end">
        
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute text-base text-trax-gray-400"
          >
            {index + 1}
          </motion.span>
        
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            {membersOnly || unpaid ? (
              <LockClosedIcon className='w-6 h-6 relative left-[7px] text-trax-white'/>
            ) : (
              <PlayIcon className="w-6 h-6 relative left-[7px] text-custom-green" />
            )}
          </motion.div>
        </div>
      )}
      <div className="relative w-10 h-10 min-w-10 min-h-10">
        <img
          src={calcBackgroundStyle()}
          alt={track.title}
          className="w-full h-full rounded object-cover "
        />

        {isMobile && (membersOnly || unpaid) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <LockClosedIcon className='w-6 h-6 text-trax-white'/>
          </div>
        )}
      </div>
      <div className="flex-grow flex flex-col overflow-hidden -ml-1.5">
        <ScrollingText text={track?.title}/>
        <CollaboratorList isFromRelatedList={true} video={track} />
      </div>

      {!isMobile && (
        (membersOnly || unpaid) && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }} className="flex items-center justify-center">
            {membersOnly && thumbnailOverlay('Members only')}
            {unpaid && thumbnailOverlay(`Unlock for $${track.price}`)}
          </motion.div>
        )
      )}

      <span className="text-sm text-trax-gray-400 font-[300]">
        {formatSeconds(track?.video?.duration)}
      </span>
    </Link>
  );
};

export default TrackListItem;