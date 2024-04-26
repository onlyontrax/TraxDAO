import { videoService } from '@services/video.service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MappedElement from './hot-track-component';

export default function HotTracks() {
  const [videos, setVideos] = useState([]);
  const [isDesktop, setIsDesktop] = useState(Boolean);

  const loadHotTracks = async () => {
    const response = (await videoService.hotTracks());
    setVideos(response.data);
  };

  const updateMedia = () => {
    // @ts-ignore
    setIsDesktop(window.innerWidth > 1200);
  };

  useEffect(() => {
    loadHotTracks();
    setIsDesktop(window.innerWidth > 1200);
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  return (
    <div className="hot-tracks-container">
      <p className="hot-tracks-header">Hot Tracks</p>
      <div className="hot-tracks-wrapper">
      {videos.map((video, index) => <MappedElement key={video._id} video={video} idValue={index}/> )}
      </div>
    </div>
  );
}
