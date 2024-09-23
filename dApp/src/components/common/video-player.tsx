import { useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';

export const VideoPlayer = (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const videoSettings = { ...props };
  const currentSource = videoSettings.sources[0];

  const handlePlay = useCallback(() => {
    if (!props.hasSignedIn) {
      props.onPressPlay();
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [props.hasSignedIn, props.onPressPlay]);

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  console.log(isPlaying)

  return (
    <div className="videojs-player">
      <div>
        <ReactPlayer
          ref={playerRef}
          className='player-react-vid'
          url={currentSource.src}
          width='100%'
          height='100%'
          style={{ maxHeight: '750px' }}
          controls={true}
          playing={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          pip={true}
          stopOnUnmount={false}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;