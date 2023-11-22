import {
  CommentOutlined,
  FileImageOutlined,
  HeartOutlined,
  LockOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { shortenLargeNumber, videoDuration } from '@lib/index';
import { Button } from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IFeed } from 'src/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faLockOpen, faUnlock  } from '@fortawesome/free-solid-svg-icons'
interface IProps {
  feed: IFeed;
  fromExplore?: boolean;
}

export class FeedGridCard extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { feed, fromExplore } = this.props;
    const canView = (feed?.isSale === 'subscription' && (feed?.isSubscribed || fromExplore === true)) || (feed?.isSale === 'pay' && feed?.isBought) || feed?.isSale === 'free';
    const images = feed?.files && feed?.files.filter((f) => f.type === 'feed-photo');
    const videos = feed?.files && feed?.files.filter((f) => f.type === 'feed-video');
    const isVideo = videos && videos.length > 0; // Check if there are any videos
    const isImage = images && images.length > 0; // Check if there are any videos

    const thumbUrl = isVideo
      ? videos[0]?.url // Use the video URL as the thumbnail URL if it's a video
      : (canView ? ((feed?.thumbnail?.url) || (images && images[0] && images[0]?.url) || (feed?.teaser && feed?.teaser?.thumbnails && feed?.teaser?.thumbnails[0]))
        : (feed?.thumbnail?.thumbnails && feed?.thumbnail?.thumbnails[0]) || (images && images[0] && images[0]?.thumbnails && images[0]?.thumbnails[0]) || (videos && videos[0] && videos[0]?.thumbnails && videos[0]?.thumbnails[0]))
     || '/static/leaf.jpg';
    return (
      <div className="feed-grid-card" key={feed?._id}>
        <Link
          href={`/post?id=${feed?.slug || feed?._id}`}
          as={`/post?id=${feed?.slug || feed?._id}`}
          legacyBehavior
        >
          <div className="card-thumb">
            {/* eslint-disable-next-line no-nested-ternary */}
            {canView && isVideo && (
              <div className="videojs-player" style={{position: 'absolute'}}>
                <video controls={false} autoPlay muted loop preload="auto" className="vid-preview">
                  <source src={thumbUrl} type="video/mp4" />
                </video>
              </div>
            )}
            {!canView && isVideo && (
              <div className="card-bg" style={{ backgroundImage: `url(${feed?.thumbnail?.url ? feed?.thumbnail?.url : '/static/placeholder-trax.jpeg'})`, filter: (feed?.isSale === 'subscription' && !feed?.isSubscribed) || (feed?.isSale === 'pay' && !feed?.isBought) ? 'blur(7px)' : 'blur(0px)' }} />
            )}
            {isImage && (
              <div className="card-bg" style={{ backgroundImage: `url(${thumbUrl})`, filter: (feed?.isSale === 'subscription' && !feed?.isSubscribed) || (feed?.isSale === 'pay' && !feed?.isBought) ? 'blur(7px)' : 'blur(0px)' }} />
            )}
            {!isVideo && !isImage && (
              <div className="text-post-wrapper-grid">
                <span className="text-post-grid">
                  {feed?.text}
                </span>
              </div>
            )}
            <div className="card-middle">
              {(isImage || isVideo) && (
                <>
                  {!canView && <FontAwesomeIcon style={{}} icon={faLock} className='lock-icon'/>}
                  {(feed?.isSale === 'subscription' && (!feed?.isSubscribed && fromExplore !== true)) && <Button style={{}} className='lock-btn' type="link">Subscribe to unlock</Button>}
                  {(feed?.isSale === 'pay' && !feed?.isBought) && <Button className='lock-btn' type="link">Pay now to unlock</Button>}
                </>
              )}
            </div>
            <div className="card-bottom">
              <div className="stats">
                <a>
                  <HeartOutlined />
                  {' '}
                  {feed?.totalLike > 0 ? shortenLargeNumber(feed?.totalLike) : 0}
                </a>
                <a>
                  <CommentOutlined />
                  {' '}
                  {feed?.totalComment > 0 ? shortenLargeNumber(feed?.totalComment) : 0}
                </a>
              </div>
              {feed?.files && feed?.files?.length > 0 && (
                <span className="count-media-item">
                  {images?.length > 0 && (
                  <span>
                    {images?.length > 1 && images?.length}
                    {' '}
                    <FileImageOutlined />
                    {' '}
                  </span>
                  )}
                  {videos?.length > 0 && images?.length > 0 && '|'}
                  {videos?.length > 0 && (
                  <span>
                    <VideoCameraOutlined />
                    {' '}
                    {videos?.length === 1 && videoDuration(videos[0]?.duration)}
                  </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
      // </div>
    );
  }
}

FeedGridCard.defaultProps = {
  fromExplore: false
} as Partial<IProps>;
