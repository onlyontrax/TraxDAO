import { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { IVideo } from 'src/interfaces/video';
import { VideoCard } from './video-card';

interface IProps {
  videos: any;
}

export class PerformerListVideo extends PureComponent<IProps> {
  render() {
    const { videos } = this.props;
    return (
      <Col className="tracks-col">
        {videos.length > 0
          && videos.map((video: IVideo) => (
            <Row style={{ width: '100%' }} key={video._id}>
              <VideoCard video={video} />
            </Row>
          ))}
      </Col>
    );
  }
}
