import { videoService } from '@services/video.service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {FaPlay} from 'react-icons/fa'


export default function MappedElement (video) {
  const [hover, setHover] = useState(false)
  const [isDesktop, setIsDesktop] = useState(Boolean);

  const updateMedia = () => {
    // @ts-ignore
    setIsDesktop(window.innerWidth > 1200);
  };

  useEffect(() => {
    setIsDesktop(window.innerWidth > 1200);
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  const getUrl = (videoProp) => {
    const { thumbnail, video, teaser } = videoProp;
    const url = (thumbnail?.thumbnails && thumbnail?.thumbnails[0]) || (teaser?.thumbnails && teaser?.thumbnails[0]) || (video?.thumbnails && video?.thumbnails[0]) || '/static/no-image.jpg';
    return url;
  };

  const getTitle = (title) => {
    let res;
    if (!isDesktop) {
      res = typeof title !== 'undefined' && title.length > 16 ? `${title.substring(0, 16)}...` : title;
    } else {
      res = title;
    }
    return res;
  };

  const getArtist = (artist) => {
    let res;
    if (!isDesktop) {
      res = typeof artist !== 'undefined' && artist.length > 16 ? `${artist.substring(0, 16)}...` : artist;
    } else {
      res = artist;
    }
    return res;
  };


  return (
    <div key={video.video.id} className="h-track-wrapper">
        <Link onPointerOver={() => setHover(true)}
              onPointerOut={() => setHover(false)} 
              href={`/video?id=${video.video.slug}`}
              className="h-track-link">
          <div className="h-track-thumb">
            <div className="h-track-bg" style={{ backgroundImage: `url(${getUrl(video.video)})` }} />
            {hover && (
                <div className="play-btn-wrapper-ht">
                  <FaPlay className='play-btn-nr-ht'/>
                </div>
            )}
          </div>
          <div className="h-track-info-wrapper">
            <p className="h-track-title">
              {getTitle(video.video.title)}
            </p>
            <Link 
              href={`/artist/profile?id=${video.video?.performer?.username || video.video?.performer?._id}`}
              as={`/artist/profile?id=${video.video?.performer?.username || video.video?.performer?._id}`} 
              className="h-track-artist"
            >
              {getArtist(video.video.performer.name)}
            </Link>
          </div>
        </Link>
  </div>
  )}
