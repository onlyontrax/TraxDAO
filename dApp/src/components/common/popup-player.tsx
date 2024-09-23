import { PureComponent } from 'react';
import videojs from 'video.js';
import ReactPlayer from 'react-player';
import { Button } from 'antd';


export class VideoPlayer extends PureComponent<any> {
  videoNode: HTMLVideoElement;

  player: any;

  state = {
    isDesktop: false,
    currentIndex: 0,
    showPrevious: false,
    showNext: false
  }

  componentDidMount() {
    const videoSettings = { ...this.props };
    let { showPrevious, showNext } = this.state;

    if (videoSettings.showPrevious) {
      showPrevious = true;
    }
    if (videoSettings.showNext) {
      showNext = true;
    }

    // this.player = videojs(this.videoNode, {
    //   ...videoSettings,
    //   fluid: true,
    //   enableDocumentPictureInPicture: true,
    //   disablePictureInPicture: false,
    //   controlBar: {
    //     pictureInPictureToggle: true
    //   }
    // } as any);
    // ReactPlayer.canPlay(videoSettings.sources[0].src)
    this.setState({ isDesktop: window.innerWidth > 500, showPrevious, showNext });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  componentDidUpdate() {
    const { stop } = this.props;
    if (stop) {
      this.stopVideo();
    }
  }

  stopVideo() {
    if (this.player) {
      this.player.pause();
    }
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

  handlePrevious = () => {
    const { currentIndex } = this.state;
    const { sources } = this.props;
    const previousIndex = (currentIndex - 1 + sources.length) % sources.length;
    this.setState({ currentIndex: previousIndex });
  };

  handleNext = () => {
    console.log("mijenjam index");
    const { currentIndex } = this.state;
    const { sources } = this.props;
    const nextIndex = (currentIndex + 1) % sources.length;
    console.log("nextIndex", nextIndex);
    this.setState({ currentIndex: nextIndex });
  };

  render() {
    const { isDesktop, currentIndex, showPrevious, showNext } = this.state;
    const videoSettings = { ...this.props };
    const currentSource = videoSettings.sources[currentIndex];
console.log("currentSource", currentSource);

console.log("tu sam");
    return (
      <div className="videojs-player">
        <div>
          {/* <video controlsList="nodownload" ref={(node) => { this.videoNode = node; }} className="video-js" /> */}
          <ReactPlayer className='player-react-vid' url={currentSource.src} width='100%'
          height='100%' style={{maxHeight: '750px'}} controls={true} pip={true} stopOnUnmount={false}
          config={{ file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }}}/>

        {showPrevious && <Button onClick={this.handlePrevious.bind(this)} style={{ marginRight: '10px' }}>Previous</Button>}
        {showNext && <Button onClick={this.handleNext.bind(this)} style={{ marginLeft: '10px' }}>Next</Button>}
        </div>
      </div>
    );
  }
}
