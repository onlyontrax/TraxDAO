import { Col } from 'antd';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces/video';
import { VideoCard } from './video-card';

interface IProps {
  videos: any;
}

export class RelatedListVideo extends PureComponent<IProps> {
  render() {
    const { videos } = this.props;
    return (
      <div className="other-ppv-suggestions">
        {videos.length > 0
          ? videos.map((video: IVideo) => (
            <Col key={video._id}>
              <VideoCard video={video} />
            </Col>
          )) : <p>No video was found</p>}
      </div>
    );
  }
}
