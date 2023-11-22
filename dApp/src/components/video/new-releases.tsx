import { videoService } from '@services/video.service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {FaPlay} from 'react-icons/fa'
import MappedElement from './new-releases-component'



export default function NewReleases() {
  const [videos, setVideos] = useState([]);
  // const [isHovered, setIsHovered] = useState(false);
  const loadRecentTracks = async () => {
    const response = (await videoService.newReleases());
    setVideos(response.data);
  };

  useEffect(() => {
    loadRecentTracks();
  }, []);

  return (
    <div className="new-releases-container">
      <p className="new-releases-header">New Releases</p>
      <div className="new-releases-wrapper">
        {videos.map((video) => (
          <MappedElement key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}