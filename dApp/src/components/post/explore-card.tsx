import {
  CommentOutlined,
  FileImageOutlined,
  HeartOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { shortenLargeNumber, videoDuration } from '@lib/index';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IFeed } from 'src/interfaces';

interface IProps {
  feed: IFeed;
}

export class FeedExploreGridCard extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { feed } = this.props;
    const canView = true;
    const images = feed?.files && feed?.files.filter((f) => f.type === 'feed-photo');
    const videos = feed?.files && feed?.files.filter((f) => f.type === 'feed-video');

    const isVideo = videos && videos.length > 0; // Check if there are any videos
    const thumbUrl = isVideo
      ? videos[0]?.url // Use the video URL as the thumbnail URL if it's a video
      : (canView
        ? ((feed?.thumbnail?.url) || (images && images[0] && images[0]?.url) || (feed?.teaser && feed?.teaser?.thumbnails && feed?.teaser?.thumbnails[0]))
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
            {isVideo ? (
              <div className="videojs-player">
                <video  controls={false} autoPlay muted loop className="vid-preview">
                  <source src={thumbUrl} type="video/mp4" />
                </video>
              </div>
            ) : (
              <div className="card-bg" style={{ backgroundImage: `url(${thumbUrl})`, filter: feed?.isSale === 'subscription' ? 'blur(7px)' : 'blur(0px)' }} />
            )}
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
              {feed?.files && feed?.files.length > 0 && (
                <span className="count-media-item">
                  {images.length > 0 && (
                    <span>
                      {images.length > 1 && images.length}
                      {' '}
                      <FileImageOutlined />
                      {' '}
                    </span>
                  )}
                  {videos.length > 0 && images.length > 0 && '|'}
                  {videos.length > 0 && (
                    <span>
                      <VideoCameraOutlined />
                      {' '}
                      {videos.length === 1 && videoDuration(videos[0]?.duration)}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }
}
