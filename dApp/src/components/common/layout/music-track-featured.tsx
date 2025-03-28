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
}

const TrackListItemFeatured: React.FC<TrackListItemProps> = ({
  track,
  index
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
  const isSoldOut = track.isSale === 'pay' && track.limitSupply && track.supply === 0

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
      <div className=' border-[0.5px] border-custom-green rounded backdrop-blur uppercase flex flex-row px-2 py-0.5 gap-1'>
        {/* <LockClosedIcon className='text-custom-green' width={14} height={14} /> */}
        <span className='text-custom-green font-semibold font-heading text-sm'>{message}</span>
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
      className="flex flex-col items-center gap-2 p-2 cursor-pointer rounded-lg transition-colors relative"
    >
      <div className="relative w-44 h-44 min-w-44 min-h-44">
        <img
          src={calcBackgroundStyle()}
          alt={track.title}
          className="w-full h-full rounded-lg object-cover cursor-pointer"
        />

        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded"
          >
            <div className='bg-[#414141e6] rounded-full p-4'>
              <PlayIcon className="w-8 h-8 text-trax-white" />
            </div>
          </motion.div>
        )}
      </div>
      <div className="flex-grow overflow-hidden text-start w-44 cursor-pointer">
        <ScrollingText text={track?.title}/>
        <CollaboratorList isFromRelatedList={true} video={track} />
      </div>

      {(membersOnly || unpaid) && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }} className="flex items-start justify-start w-full ">
            {membersOnly && thumbnailOverlay('Members only')}
            {(!isSoldOut && unpaid) && thumbnailOverlay(`$${track.price}`)}
            {isSoldOut && thumbnailOverlay(`Sold out`)}
          </motion.div>
        )
      }
    </Link>
  );
};

export default TrackListItemFeatured;