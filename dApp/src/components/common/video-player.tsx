import { useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';

export const VideoPlayer = (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const videoSettings = { ...props };
  const currentSource = videoSettings.sources[0];
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