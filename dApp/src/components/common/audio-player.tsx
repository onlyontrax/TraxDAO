import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { BackwardIcon, ForwardIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

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


  const customIcons = {
    play: <PlayIcon className='w-12 h-12 text-trax-white hover:text-custom-green transition' />,
    pause: <PauseIcon className='w-12 h-12 text-trax-white hover:text-custom-green transition' />,
    // rewind: <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path fill-rule="evenodd" clip-rule="evenodd" d="M21.6667 41C22.2189 41 22.6667 40.5523 22.6667 40L22.6667 20C22.6667 19.4477 22.219 19 21.6667 19L20 19C19.4477 19 19 19.4477 19 20L19 40C19 40.5523 19.4477 41 20 41L21.6667 41ZM39.4855 40.0913C40.152 40.4912 41 40.0111 41 39.2338L41 20.7662C41 19.9889 40.152 19.5088 39.4855 19.9087L24.0958 29.1425C23.4485 29.5309 23.4485 30.4691 24.0958 30.8575L39.4855 40.0913Z" fill="#F2F2F2"/>
    // </svg>,
    // forward: <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path fill-rule="evenodd" clip-rule="evenodd" d="M38.3333 19C37.781 19 37.3333 19.4477 37.3333 20V40C37.3333 40.5523 37.781 41 38.3333 41H40C40.5523 41 41 40.5523 41 40V20C41 19.4477 40.5523 19 40 19H38.3333ZM20.5145 19.9087C19.848 19.5088 19 19.9889 19 20.7662V39.2338C19 40.0111 19.848 40.4912 20.5145 40.0913L35.9042 30.8575C36.5515 30.4691 36.5515 29.5309 35.9042 29.1425L20.5145 19.9087Z" fill="#F2F2F2"/>
    // </svg>,
  };



  const handlePrevious = useCallback(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    const currentIndex = relatedVideos.findIndex(source => source.slug === id);
    
    // Find the previous audio track starting from current position
    let previousIndex = currentIndex;
    do {
        previousIndex = (previousIndex - 1 + relatedVideos.length) % relatedVideos.length;
        // Break if we've checked all videos to avoid infinite loop
        if (previousIndex === currentIndex) break;
    } while (relatedVideos[previousIndex]?.trackType !== 'audio');

    // Only navigate if we found an audio track
    if (relatedVideos[previousIndex]?.trackType === 'audio') {
        router.push(`track/?id=${relatedVideos[previousIndex]?.slug}`);
    }
}, [relatedVideos, router]);

  const handleNext = useCallback(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    const currentIndex = relatedVideos.findIndex(source => source.slug === id);
    
    // Find the next audio track starting from current position
    let nextIndex = currentIndex;
    do {
        nextIndex = (nextIndex + 1) % relatedVideos.length;
        // Break if we've checked all videos to avoid infinite loop
        if (nextIndex === currentIndex) break;
    } while (relatedVideos[nextIndex]?.trackType !== 'audio');

    // Only navigate if we found an audio track
    if (relatedVideos[nextIndex]?.trackType === 'audio') {
        router.push(`track/?id=${relatedVideos[nextIndex]?.slug}`);
    }
}, [relatedVideos, router]);

  // uncomment this if you want log in modal to appear for users who arent signed in
  const handlePlay = useCallback(() => {
    // if (!hasSignedIn) {
    //   onPressPlay();
    //   if (playerRef.current) {
    //     playerRef.current.audio.current.pause();
    //     playerRef.current.audio.current.currentTime = 0;
    //   }
    // }
  }, [hasSignedIn, onPressPlay]);

  return (
    <div className="audio-player">
      <AudioPlayer
        ref={playerRef}
        autoPlay={false}
        src={props.source}
        customIcons={customIcons}
        onPlay={handlePlay}
        showSkipControls={false}
        showJumpControls={false}
        showFilledVolume={false}
      />
      <div className='flex flex-row gap-4 justify-evenly relative -top-16'>
        {showPrevious && <BackwardIcon onClick={handlePrevious} className='cursor-pointer flex text-trax-white w-9 h-9 hover:text-custom-green transition'>Previous</BackwardIcon>}
        {showNext && <ForwardIcon onClick={handleNext} className='cursor-pointer flex text-trax-white w-9 h-9 hover:text-custom-green transition'>Next</ForwardIcon>}
      </div>
    </div>
  );
};

export default AudioPlayer_;