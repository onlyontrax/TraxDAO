import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { BackwardIcon, ForwardIcon } from '@heroicons/react/24/solid';

export const AudioPlayer_ = (props) => {
  const playerRef = useRef(null);
  const router = useRouter();
  const { relatedVideos, hasSignedIn, onPressPlay } = props;
  const [showPrevious, setShowPrevious] = useState(false);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const videoSettings = { ...props };
    setShowPrevious(!!videoSettings.showPrevious);
    setShowNext(!!videoSettings.showNext);
  }, [props]);

  const handlePrevious = useCallback(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    const currentIndex = relatedVideos.findIndex(source => source.slug === id);
    const previousIndex = (currentIndex - 1 + relatedVideos.length) % relatedVideos.length;
    router.push(`video/?id=${relatedVideos[previousIndex].slug}`);
  }, [relatedVideos, router]);

  const handleNext = useCallback(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    const currentIndex = relatedVideos.findIndex(source => source.slug === id);
    const nextIndex = (currentIndex + 1) % relatedVideos.length;
    router.push(`video/?id=${relatedVideos[nextIndex].slug}`);
  }, [relatedVideos, router]);

  const handlePlay = useCallback(() => {
    if (!hasSignedIn) {
      onPressPlay();
      if (playerRef.current) {
        playerRef.current.audio.current.pause();
        playerRef.current.audio.current.currentTime = 0;
      }
    }
  }, [hasSignedIn, onPressPlay]);

  return (
    <div className="audio-player">
      <AudioPlayer
        ref={playerRef}
        autoPlay={false}
        src={props.source}
        onPlay={handlePlay}
        showSkipControls={false}
        showJumpControls={false}
        showFilledVolume={false}
      />
      <div className='flex flex-row gap-4 justify-between px-[70px] relative -top-16'>
        {showPrevious && <BackwardIcon onClick={handlePrevious} className='cursor-pointer flex text-trax-white w-10 h-10'>Previous</BackwardIcon>}
        {showNext && <ForwardIcon onClick={handleNext} className='cursor-pointer flex text-trax-white w-10 h-10'>Next</ForwardIcon>}
      </div>
    </div>
  );
};

export default AudioPlayer_;