/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';

const formWaveSurferOptions = (ref) => ({
  container: ref,
  waveColor: '#eee',
  progressColor: '#c8ff02',
  cursorColor: 'OrangeRed',
  barWidth: 3,
  barRadius: 3,
  responsive: true,
  height: 150,
  normalize: true,
  partialRender: true
});

export default function WavePlayer() {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [playing, setPlaying] = useState(false);

  const url = 'https://www.mfiles.co.uk/mp3-downloads/brahms-st-anthony-chorale-theme-two-pianos.mp3';

  const create = async () => {
    const WaveSurfer = (await import('wavesurfer.js')).default;

    const options = formWaveSurferOptions(waveformRef.current);
    wavesurfer.current = WaveSurfer.create(options);

    wavesurfer.current.load(url);
  };

  useEffect(() => {
    create();

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, []);

  const handlePlayPause = () => {
    setPlaying(!playing);
    wavesurfer.current.playPause();
  };

  return (
    <div className='fixed bottom-0 left-0 w-screen  overflow-hidden rounded-full p-4'>
      <div id="waveform" className="waveform-wrapper" ref={waveformRef} />
      <div onClick={handlePlayPause}>{!playing ? 'Play' : 'Pause'}</div>
      <div className="controls">
        {/* <div className="volume">
          <img
            id="volumeIcon"
            className="volume-icon"
            src="assets/icons/volume.svg"
            alt="Volume"
          />
          <input
            id="volumeSlider"
            className="volume-slider"
            type="range"
            name="volume-slider"
            min="0"
            max="100"
            value="50"
          />
        </div> */}
        <div className="timecode">
          <span id="currentTime">00:00:00</span>
          <span>/</span>
          <span id="totalDuration">00:00:00</span>
        </div>
      </div>
      <div className="controls" />
    </div>
  );
}
