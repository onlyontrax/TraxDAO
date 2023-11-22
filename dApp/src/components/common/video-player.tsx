import { PureComponent } from 'react';
import videojs from 'video.js';

export class VideoPlayer extends PureComponent<any> {
  videoNode: HTMLVideoElement;

  player: any;

  state={
    isDesktop: false
  }

  componentDidMount() {
    const videoSettings = { ...this.props };

    this.player = videojs(this.videoNode, {
      ...videoSettings,
      fluid: true,
      enableDocumentPictureInPicture: true,
      disablePictureInPicture: false,
      controlBar: {
        pictureInPictureToggle: true
      }
    } as any);
    this.setState({ isDesktop: window.innerWidth > 500 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isDesktop: window.innerWidth > 500 });
  };

  render() {
    const { isDesktop } = this.state;

    return (
      <div className="videojs-player">
        <div data-vjs-player style={isDesktop ? { paddingTop: 'max(60vh)' } : null}>
          <video controlsList="nodownload" ref={(node) => { this.videoNode = node; }} className="video-js" />
        </div>
      </div>
    );
  }
}
