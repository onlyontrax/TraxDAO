import { PureComponent } from 'react';

interface IProps {
  source: string
}

export class AudioPlayer extends PureComponent<IProps> {
  playerRef: any;

  componentWillUnmount() {
    if (this.playerRef) {
      this.playerRef.dispose();
    }
  }

  render() {
    const { source: sourceUrl } = this.props;
    return (
      <div className="audio-player">
        <audio controlsList="nodownload" className="basic-audio-player" controls ref={this.playerRef}>
          <source src={sourceUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
}
