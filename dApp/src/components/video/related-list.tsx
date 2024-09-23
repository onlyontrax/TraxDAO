import { Col, Row } from 'antd';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces/video';
import { VideoCard } from './video-card';
import styles from './video.module.scss';

interface IProps {
  videos: any;
}

export class RelatedList extends PureComponent<IProps> {
  render() {
    const { videos } = this.props;
    return (
      // <div className="other-ppv-suggestions">
      //   <Row  className='flex justify-center gap-y-8 gap-x-4	sm:gap-x-0'>
      //     {videos.length > 0
      //       ? videos.map((video: IVideo, index) => (
      //         <Col xs={11.5} sm={11} md={8} lg={8} key={index}>
      //           <VideoCard video={video} />
      //         </Col>
      //     )) : <p>No video was found</p>}
      // </Row>
      // </div>
      <div className={styles.componentVideoModule}>
        <div className={styles['searched-video-container-music']}>
          <div className={styles['searched-video-wrapper-music']}>
            {videos.map((video, index) => (
              <VideoCard video={video} key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}


