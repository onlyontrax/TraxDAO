import { PureComponent } from 'react';

interface IProps {
  source: string
}

const formWaveSurferOptions = () => ({
  container: '#waveform',
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

export class WaveAudioPlayer extends PureComponent<IProps, {playing: boolean}> {
  waveformRef: any;

  wavesurfer: any;

  state ={
    playing: false
  }

  componentDidMount() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
    this.create();
  }

  componentWillUnmount() {
    if (this.waveformRef) {
      this.waveformRef.destroy();
    }
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
  }

  handlePlayPause = () => {
    this.setState((prevState) => ({ playing: !prevState.playing }));
    this.wavesurfer.playPause();
  };

  create = async () => {
    const WaveSurfer = (await import('wavesurfer.js')).default;
    const options = formWaveSurferOptions();

    this.wavesurfer = WaveSurfer.create(options);
    // eslint-disable-next-line react/destructuring-assignment
    this.wavesurfer.load(this.props.source);
  };

  render() {
    const { source: sourceUrl } = this.props;
    const { playing } = this.state;
    return (
      <div>
        <div id="waveform" className="waveform-wrapper" ref={this.waveformRef} />
        {/* <audio id="track" src={sourceUrl} /> */}
        <div onClick={() => this.handlePlayPause()}>{!playing ? 'Play' : 'Pause'}</div>
        <div className="controls">
          <div className="volume">
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
          </div>
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
}
