import { videoService } from '@services/video.service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {FaPlay} from 'react-icons/fa';

export default function MappedElement(video) {
  const [hover, setHover] = useState(false);

  const getUrl = (videoProp) => {
    const { thumbnail, video, teaser } = videoProp;
    const url = (video?.thumbnail?.url ? video?.thumbnail?.url : video?.teaser?.thumbnails.url)
      || (thumbnail?.thumbnails && thumbnail?.thumbnails[0])
      || (teaser?.thumbnails && teaser?.thumbnails[0])
      || (video?.thumbnails && video?.thumbnails[0])
      || '/static/no-image.jpg';
    return url;
  };

  const backgroundImageStyle = {
    backgroundImage: `url("${getUrl(video.video)}")`
  };

  return (
    <div key={video.video.id} className="new-track-wrapper">
      <Link href={`/video?id=${video.video.slug}`}
          className="new-track-link"
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}>

        <div className="new-track-thumb">
          <div className="new-track-bg" style={backgroundImageStyle}>
            {hover && (
              <div className='play-btn-wrapper'>
                <FaPlay className='play-btn-nr'/>
              </div>
            )}
          </div>
        </div>
        <div className="track-info-wrapper">
          <p className="track-title">{ video.video.title }</p>
          <span className="track-artist">
            {video.video.performer.name }
          </span>
        </div>
      </Link>
    </div>
  )}
