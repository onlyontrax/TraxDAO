import { Col, Row } from 'antd';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces/video';
import VideoCardSuggested from './VideoCardSuggested';

interface IProps {
  videos: any;
}

export class RelatedListVideo extends PureComponent<IProps> {
  render() {
    const { videos } = this.props;
    return (
      <div className="other-ppv-suggestions">
        <Row  className='flex gap-x-4	sm:gap-x-0 w-full'>
          {videos.length > 0
            ? videos.map((video: IVideo, index) => (
              <Col className='w-full' key={index}>
                <VideoCardSuggested video={video} />
              </Col>
          )) : <p>No video was found</p>}
      </Row>
      </div>
    );
  }
}


