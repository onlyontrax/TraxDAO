import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces';
import styles from './video.module.scss';

interface IProps {
  video: IVideo;
  style?: any;
}

export class ThumbnailVideo extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { video: videoProp, style } = this.props;
    const { thumbnail, video, teaser } = videoProp;
    const url = (thumbnail?.thumbnails && thumbnail?.thumbnails[0]) || (teaser?.thumbnails && teaser?.thumbnails[0]) || (video?.thumbnails && video?.thumbnails[0]) || '/static/no-image.jpg';
    return (
      <span className={styles.componentVideoModule}>
        <img alt="thumbnail" src={url} style={style || { width: '50px' }} />
      </span>
    );
  }
}

ThumbnailVideo.defaultProps = {
  style: {}
} as Partial<IProps>;
