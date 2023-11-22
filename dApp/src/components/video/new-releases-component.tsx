import { videoService } from '@services/video.service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {FaPlay} from 'react-icons/fa';

export default function MappedElement (video) {
  const [hover, setHover] = useState(false)
  return (
    <div key={video.video.id} className="new-track-wrapper">
      <Link href={`/video?id=${video.video.slug}`} 
          className="new-track-link" 
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}>

        <div className="new-track-thumb">
          <div className="new-track-bg" style={{ backgroundImage: `url(${video.video?.thumbnail?.url ? video.video?.thumbnail?.url : video.video?.teaser?.thumbnails.url})` }}>
            {hover && (
              <div className='play-btn-wrapper'>
                <FaPlay className='play-btn-nr'/>
              </div>
            )}
          </div>
        </div>
        <div className="track-info-wrapper">
          <p className="track-title">{ video.video.title }</p>
          <p className="track-artist">{ video.video.performer.name }</p>
        </div>
      </Link>
    </div>
  )}
