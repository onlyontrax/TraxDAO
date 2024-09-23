import { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { IVideo } from 'src/interfaces/video';
import { VideoCard } from './video-card';
import VideoComponent from './Searched_video_component'
import styles from './video.module.scss';

interface IProps {
  videos: any;
  isProfileGrid?: boolean;
}

export class PerformerListVideo extends PureComponent<IProps> {
  render() {
    const { videos, isProfileGrid } = this.props;
    return (
      <div className={styles['searched-video-container']}>
          <div className={styles['searched-video-wrapper']}>
      {/* <Row  className='flex justify-center sm:justify-start gap-y-8 gap-x-4	sm:gap-x-0'> */}
        {videos.length > 0 && videos.map((video: IVideo, index) => (
            // <Col xs={11.5} sm={11} md={8} lg={8} key={video._id} className='flex justify-center'>
            <VideoComponent key={index} video={video} isProfileGrid={isProfileGrid}/>
            // </Col>
          ))}
          </div>
          </div>

      // <Col className="tracks-col">
      //   {videos.length > 0
      //     && videos.map((video: IVideo) => (
      //       <Row style={{ width: '100%' }} key={video._id}>
      //         <VideoCard video={video} />
      //       </Row>
      //     ))}
      // </Col>
    );
  }
}
