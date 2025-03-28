import { videoService } from '@services/video.service';
import { useEffect, useState, useRef } from 'react';
import VideoComponent from './Searched_video_component';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './video.module.scss';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { performerService } from '@services/performer.service';
import { bannerService } from '@services/banner.service';
import { GENRES } from 'src/constants';
import TraxToggle from '@components/common/TraxToggleButton';
import TrackListItem from '@components/common/layout/music-track';
import { SplideBannerGenres } from '@components/common/splide-banner-genres';
import FeedContainer from '@components/common/FeedContainer';
import { SplideBanner } from '@components/common';

const initial1 = { opacity: 0, y: 0 };
const initial2 = { opacity: 0, y: 20 };
const animate1 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 1.3,
    delay: 0.3,
    ease: [0.645, 0.045, 0.355, 1],
    once: true,
  },
};
const animate2 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.6,
    ease: 'easeOut',
    once: true,
  },
};

const itemVariants = (index) => ({
  initial: {
    opacity: 0,
    y: 15,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      delay: index * 0.1, // Calculate delay based on index
      ease: [0.215, 0.610, 0.355, 1.000],
    }
  }
});

export default function VideoSearch({tags = 'featured', sortBy = 'latest', isHomePage}) {
  const [videos, setVideos] = useState([]);
  const [music, setMusic] = useState([])
  const [limit, setLimit] = useState(50);
  const [offsetVids, setOffsetVids] = useState(0);
  const [offsetMusic, setOffsetMusic] = useState(0);
  const [hasMoreVids, setHasMoreVids] = useState(true);
  const [hasMoreMusic, setHasMoreMusic] = useState(true);
  const [contentType, setContentType] = useState(false);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [banners, setBanners] = useState([]);
  const gridRef = useRef(null);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });


  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getFeaturedContent = async (tags) => {
    let featured = [];
    await videoService.homePageSearch({
      limit: 10,
      sortBy: 'latest',
      tags,
      offset: 0,
    }).then((res) => {
      res.data.data.map((v)=>{
        if(v._id){
          featured.push(v);
        }
      })
    })
    setFeaturedContent(shuffleArray(featured));
    // setFeaturedVids(shuffleArray(featuredVids));
  }

  const getBanners = async () => {
    try {
      const response = await bannerService.search({ limit: 99 });
      setBanners(response?.data?.data || []);
    } catch (e) {
      setBanners([]);
    }
  };

  const loadMoreMusic = async (newOffset) => {
    const response = await videoService.homePageSearch({
      limit,
      sortBy,
      tags,
      offset: newOffset,
    });

    const totalMusic = response.data.total;
    const newMusic = response.data.data;

    const audioTracks = newMusic.filter(track => track.trackType === 'audio');
    // console.log(audioTracks)

    if (offsetMusic === 0) {
      setMusic(audioTracks);
    } else {
      setMusic(prevMusic => [...prevMusic, ...audioTracks]);
    }

    const updatedOffset = newOffset + newMusic.length;
    setOffsetMusic(updatedOffset);

    if (updatedOffset >= totalMusic || newMusic.length < limit) {
      setHasMoreMusic(false);
    }
  };

  const loadMoreVids = async (newOffset) => {
    const response = await videoService.homePageSearch({
      limit,
      sortBy,
      tags,
      offset: newOffset,
    });

    const totalVideos = response.data.total;
    const newVideos = response.data.data;

    const videoTracks = newVideos.filter(track => track.trackType === 'video');
    // console.log(videoTracks)
    if (offsetVids === 0) {
      setVideos(videoTracks);
    } else {
      setVideos(prevVideos => [...prevVideos, ...videoTracks]);
    }

    

    const updatedOffset = newOffset + newVideos.length;
    setOffsetVids(updatedOffset);

    if (updatedOffset >= totalVideos || newVideos.length < limit) {
      setHasMoreVids(false);
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }

    setVideos([]);
    setMusic([]);
    setLimit(100);
    setOffsetMusic(0);
    setOffsetVids(0);
    setHasMoreMusic(true);
    setHasMoreVids(true);

    loadMoreMusic(0);
    loadMoreVids(0);

    // if(tags === "featured" || "new"){
    //   getFeaturedContent(tags);
    // }else{
    //   getFeaturedContent(["featured", tags]);
    // }
    getFeaturedContent('featured');
    getBanners();
    
  }, [tags, sortBy, controls, inView]);

  const topBanners = banners && banners.length > 0 && banners.filter((b) => b.position === 'top');

  return (
    <div className={styles.componentVideoModule}>
      <SplideBanner banners={topBanners}/>
      {/* <SplideBannerGenres content={featuredContent}/> */}
      <FeedContainer options={{ type: 'genres', genresTag: tags}} />
      <div className='mt-6 sm:mt-20 px-0 sm:px-12'>
        <div className='flex flex-row justify-between w-full'>
          <motion.div
            className="w-full flex flex-row gap-2 justify-start mx-4 sm:mx-0 mb-4"
            initial={initial1}
            animate={animate1}
          >
            <span className="text-4xl sm:text-5xl text-custom-green ml-0 font-bold font-heading uppercase ">
              <span className="text-xl sm:text-2xl text-custom-green font-body align-super font-light mr-2 ">
              &#40;{contentType ? videos.length : music.length}&#41;
              </span> 
              {tags ? `${GENRES.find(genre => genre.value === tags)?.text || tags}` : "Recently featured"}
            </span>
          </motion.div>
        <div className='flex w-full justify-end'>
        <div className='flex max-w-[200px] justify-end mb-4 w-full mr-2'>
          <TraxToggle
            buttonSize="full"
            leftText="tracks"
            rightText="videos"
            // disabled={isLoading}
            onChange={(value) => setContentType(value)}
            defaultValue={contentType}
          />
        </div>
        </div>
        </div>
        {contentType ? (
          <InfiniteScroll
            dataLength={videos.length}
            next={() => loadMoreVids(offsetVids) }
            hasMore={hasMoreVids}
            loader
          >
            <div className={styles['searched-video-container']}>
              <motion.div
                initial={initial2}
                animate={animate2}
                ref={gridRef}
                className={styles['searched-video-wrapper']}
              >
                {videos.map((video, index) => (
                  <div
                    key={video.id || index}
                  >
                    <VideoComponent video={video} />
                  </div>
                ))}
              </motion.div>
            </div>
          </InfiniteScroll>
        ):(
        <InfiniteScroll
          dataLength={music.length}
          next={() => loadMoreMusic(offsetMusic) }
          hasMore={ hasMoreMusic}
          loader
        >
          <div className={styles['searched-video-container']}>
            <motion.div
              initial={initial2}
              animate={animate2}
              ref={gridRef}
              className={styles['searched-video-wrapper-audio']}
            >
              {music.map((music, index) => (
                <div
                  key={music.id || index}
                >
                  <TrackListItem track={music} index={index} />
                </div>
              ))}
            </motion.div>
          </div>
        </InfiniteScroll>
         )}
    </div>
    </div>
  );
}