import { videoService } from '@services/video.service';
import { useEffect, useState } from 'react';
import VideoComponent from './Searched_video_component'
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './video.module.scss';

export default function VideoSearch({tags = 'featured', sortBy = 'latest'}) {
  const [videos, setVideos] = useState([]);
  const [limit, setLimit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreTracks = async (newOffset) => {
    const response = await videoService.homePageSearch({
      limit,
      sortBy,
      tags,
      offset: newOffset,
    });

    // Total shows 103, but real total (filtered) is currently 90
    const totalVideos = response.data.total;

    // New videos to be added
    const newVideos = response.data.data;

    if (offset === 0) {
      setVideos(newVideos);
    } else {
      setVideos(prevVideos => [...prevVideos, ...newVideos]);
    }

    const updatedOffset = newOffset + newVideos.length;
    setOffset(updatedOffset);

    if (updatedOffset >= totalVideos || newVideos.length < limit) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    // Reset the state
    setVideos([]);
    setLimit(15);
    setOffset(0);
    setHasMore(true);

    // Load the first batch of videos
    const initialLoad = async () => {
      await loadMoreTracks(0);
    };
    initialLoad();
  }, [tags, sortBy]);

  return (
    <div className={styles.componentVideoModule}>
      <div className="w-full flex justify-start mx-6 sm:mx-3 mt-4 mb-4 ">
            <span className="text-5xl sm:text-5xl font-heading uppercase font-bold text-[#B3B3B3] ">Recently featured</span>
        </div>
      <InfiniteScroll
        dataLength={videos.length}
        next={() => loadMoreTracks(offset)}
        hasMore={hasMore}
        loader

      >
        <div className={styles['searched-video-container']}>
          <div className={styles['searched-video-wrapper']}>
            {videos.map((video, index) => (
              <VideoComponent key={index} video={video} />
            ))}
          </div>
        </div>
      </InfiniteScroll>
    </div>
  );
}