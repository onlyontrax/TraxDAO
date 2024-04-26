import { PureComponent } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
interface IProps {
  source: string;
  stop: boolean;
}

export class AudioPlayer_ extends PureComponent<IProps> {
  playerRef: any;

  componentWillUnmount() {
    if (this.playerRef) {
      this.playerRef.dispose();
    }
  }

  componentDidUpdate() {
    const { stop } = this.props;
    if (stop) {
      this.stopVideo();
    }
  }

  stopVideo() {
    if (this.playerRef) {
      this.playerRef.pause();
    }
  }

  render() {
    const { source: sourceUrl } = this.props;
    return (
      <div className="audio-player">
        <AudioPlayer
          autoPlay
          src={sourceUrl}
          onPlay={e => console.log("onPlay")}
          showSkipControls={false}
          showJumpControls={false}
          showFilledVolume={false}
          // customIcons={{
          //   play: <FontAwesomeIcon icon={faPlay} />,
          //   stop
          // }}
          // other props here
        />
        {/* <audio controlsList="nodownload" className="basic-audio-player" controls ref={this.playerRef}>
          <source src={sourceUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio> */}
      </div>
    );
  }
}
