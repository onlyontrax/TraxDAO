import { shortenLargeNumber, videoDuration } from '@lib/index';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces';

interface IProps {
  video: IVideo;
}

export class VideoCard extends PureComponent<IProps> {
  state = {
    isHovered: false
  };

  render() {
    const { video } = this.props;
    const canView = (video.isSale === 'subscription' && video.isSubscribed)
      || (video.isSale === 'pay' && video.isBought)
      || video.isSale === 'free';
    const thumbUrl = (canView ? video?.thumbnail?.url : video?.thumbnail?.thumbnails && video?.thumbnail?.thumbnails[0])
      || (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0])
      || (video?.video?.thumbnails && video?.video?.thumbnails[0])
      || '/static/no-image.jpg';
    return (
      <div className="tracks-wrapper">
        <div className='tracks-wrapper-overlay'>
        <Link
          href={`/video?id=${video.slug || video._id}`}
          as={`/video?id=${video.slug || video._id}`}
          legacyBehavior
        >
          <div className="tracks-tab-stats">
            <div className="track-image" style={{ backgroundImage: `url(${thumbUrl})` }} />
            <div className="track-name">{video.title}</div>
            <div className="track-views">{shortenLargeNumber(video?.stats?.views || 0)}</div>

            <div className="track-length">{videoDuration(video?.video?.duration || 0)}</div>

            <span className="track-price">
              {video.isSale === 'pay' && (
              <div className="price-badge">
                $
                {(video.price || 0).toFixed(2)}
              </div>
              )}
              {video.isSale === 'free' && <div className="free-badge">Free</div>}
              {video.isSale === 'subscription' && <div className="sub-badge">Subs</div>}
            </span>
            {/* )} */}
          </div>
        </Link>
        </div>
      </div>
    );
  }
}
