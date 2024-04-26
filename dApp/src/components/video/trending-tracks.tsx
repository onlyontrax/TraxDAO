import { videoService } from '@services/video.service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MappedElement from './trending-tracks-component'

export default function TrendingTracks() {
  const [videos, setVideos] = useState([]);
  const [isDesktop, setIsDesktop] = useState(Boolean);

  const loadTrendingTracks = async () => {
    const response = (await videoService.trendingTracks());
    setVideos(response.data);
  };

  const updateMedia = () => {
    // @ts-ignore
    setIsDesktop(window.innerWidth > 1200);
  };

  useEffect(() => {
    loadTrendingTracks();
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
      res = typeof title !== 'undefined' && title.length > 18 ? `${title.substring(0, 18)}...` : title;
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
    <div className="hot-tracks-container">
      <p className="hot-tracks-header">New Music</p>
      
      <div className="hot-tracks-wrapper">
        {videos.map((video) => (
          <MappedElement key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}
