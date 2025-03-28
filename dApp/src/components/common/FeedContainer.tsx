import React, { useState, useEffect } from 'react';
import RelatedListMusicFeatured from '@components/video/related-track-featured';
import RelatedList from '@components/video/related-list';
import {Carousel} from '@components/ui/apple-cards-carousel';
import VideoHero from '@components/common/layout/video-hero';
import { performerService, videoService, featuredArtistsService, utilsService, bannerService } from 'src/services';
import { GENRES } from 'src/constants';

interface Track {
  id: string;
  title: string;
  artist: string;
  [key: string]: any;
}

interface Video {
  id: string;
  title: string;
  [key: string]: any;
}

interface Artist {
  id: string;
  name: string;
  [key: string]: any;
  index: number;
  element: JSX.Element;
}

interface VideoHeroProps {
  video: Video;
  artistName: string;
}

interface FeedContainerProps {
  options: {
    type: 'genres' | 'homepage';
    genresTag?: string;
  };
}

const FeedContainer: React.FC<FeedContainerProps> = ({ options = { type: 'homepage', genresTag: '' } }) => {
  const [featuredMusic, setFeaturedMusic] = useState([]);
  const [featuredVids, setFeaturedVids] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [fullScreenVideo, setFullScreenVideo] = useState(null);
  const [popularTracks, setPopularTracks] = useState([]);
  const [traxOriginals, setTraxOriginals] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [limit] = useState(30);
  const [filter] = useState({ sortBy: 'latest' });
  const [offset, setOffset] = useState(0);

  const loadMoreTracks = async (newOffset: number, tag: string, genresTag?: string) => {
    try {
      const response = await videoService.homePageSearch({
        limit,
        sortBy: filter.sortBy,
        tags: tag,
        offset: newOffset,
      });

      const totalContent = response.data.total;
      const newContent = response.data.data;

      // Filter tracks if genresTag is provided and exists in tags
      const filteredContent = genresTag && genresTag !== "new"
      ? newContent.filter((video) => video.tags.includes(genresTag)) 
      : newContent;

      const audioTracks = filteredContent.filter((track) => track.trackType === 'audio');
      const videoTracks = filteredContent.filter((track) => track.trackType === 'video');

      console.log("genresTag: ", genresTag);
      console.log("tag:", tag);
      console.log("audioTracks: ", audioTracks);

      setFeaturedMusic((prevMusic) => (newOffset === 0 ? audioTracks : [...prevMusic, ...audioTracks]));
      setFeaturedVids((prevVideos) => (newOffset === 0 ? videoTracks : [...prevVideos, ...videoTracks]));

      const updatedOffset = newOffset + newContent.length;
      setOffset(updatedOffset);

      if (updatedOffset >= totalContent || newContent.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more tracks:', error);
      return;
    }
  };

  const fetchData = async () => {
    try {
      const [artistsRes, countriesRes] = await Promise.all([
        featuredArtistsService.search({ limit: 99 }),
        utilsService.countriesList()
      ]);

      setFeaturedArtists(artistsRes?.data?.data ?? []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setFeaturedArtists([]);
    } 
  };

  const loadTracks = async (tag: string, genresTag?: string) => {

    console.log("@loadTracks tag ", tag)
    console.log("@loadTracks genresTag ", genresTag)

    const tags = genresTag && genresTag !== "new" 
      ? `${tag},${genresTag}` 
      : tag;

    try {
      const response = await videoService.homePageSearch({
        limit,
        offset : 0,
        sortBy: filter.sortBy,
        tags: tag,
      });

      

      const tracks = response.data.data;

      // Filter tracks if genresTag is provided and exists in tags
      const filtered = genresTag && genresTag !== "new"
      ? tracks.filter((video) => video.tags.includes(genresTag)) 
      : tracks;

      console.log("filtered ", filtered)

      const filteredTracks = filtered.filter((track) => track.trackType === 'audio');
      const filteredVideos = filtered.filter((track) => track.trackType === 'video');

      console.log("filteredTracks ", filteredTracks)
      console.log("filteredVideos ", filteredVideos)
    
      switch (tag) {
        case 'popularTrack':
          setPopularTracks(filteredTracks);
          break;
        case 'recommendedTrack':
          setRecommendedTracks(filteredTracks);
          break;
        case 'traxOriginal':
          setTraxOriginals(filteredVideos);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
      return;
    } 
  };

  const loadVideoHero = async (tag: string, genresTag?: string) => {
    try {
      const response = await videoService.homePageSearch({
        limit,
        sortBy: filter.sortBy,
        tags: tag,
        offset : 0,
      });
  
      const vid = response.data.data;

      // Filter tracks if genresTag is provided and exists in tags
      const filteredVid = genresTag && genresTag !== "new"
      ? vid.filter((video) => video.tags.includes(genresTag)) 
      : vid;

      const filteredVideos = filteredVid.filter((track) => track.trackType === 'video');
      
      if (filteredVideos.length > 0) {
        setFullScreenVideo(filteredVideos[0]);
      } else {
        setFullScreenVideo(null);
      }
    } catch (error) {
      console.error('Error loading video hero:', error);
    }
  };

  useEffect(() => {
    const genresTag = options.genresTag;
    const initialize = async (genresTag?: string) => {
    
      await fetchData();
      
  
      loadMoreTracks(0, 'featured', genresTag);
      loadTracks('popularTrack', genresTag);
      loadTracks('recommendedTrack', genresTag);
      loadTracks('traxOriginal');
      loadVideoHero('featuredVideoOne', genresTag);
    };
  
    initialize(genresTag);
  }, [options.genresTag]);


  console.log(featuredMusic)

  return (
    <div className="feed-container main-container">
      <div className="home-container pr-0">
        <div className="left-explore-container gap-10 sm:gap-9 flex flex-col mt-12 sm:mt-16">

          {featuredMusic.length > 0 && (
            <div>
              <RelatedListMusicFeatured
                tracks={featuredMusic}
                isHomePage={true}
                total={featuredMusic.length}
                title={`Trending ${options.genresTag && options.genresTag !== 'homepage' ? `${GENRES.find(genre => genre.value === options.genresTag)?.text } ` : ''}tracks`}
              />
            </div>
          )}

          {featuredVids.length > 0 && (
            <div>
              <RelatedList
                videos={featuredVids}
                isHomePage={true}
                total={featuredVids.length}
                title={`Featured ${options.genresTag ? `${options.genresTag} ` : ''}videos`}
              />
            </div>
          )}

          <div>
            <Carousel items={featuredArtists} />
          </div>

          {recommendedTracks.length > 0 && (
            <div>
              <RelatedListMusicFeatured
                tracks={recommendedTracks}
                isHomePage={true}
                total={recommendedTracks.length}
                title="Recommended for you"
              />
            </div>
          )}

          {fullScreenVideo && (
            <div className="overflow-hidden">
              <VideoHero
                video={fullScreenVideo}
                artistName="ARTIST NAME"
              />
            </div>
          )}

          {popularTracks.length > 0 && (
            <div>
              <RelatedListMusicFeatured
                tracks={popularTracks}
                isHomePage={true}
                total={popularTracks.length}
                title="Everyone's listening to"
              />
            </div>
          )}

          {options.type === 'homepage' && traxOriginals.length > 0 && (
            <div>
              <RelatedList
                videos={traxOriginals}
                isHomePage={true}
                total={traxOriginals.length}
                title="TRAX originals"
              />
            </div>
          )}

          {/*
          {featuredArtists.length > 0 && (
            <div className='overflow-hidden'>
              <ImageCarousel title={"Rising talent"} profiles={featuredArtists}/>
            </div>
          )} */}

        </div>
      </div>
    </div>
  );
};

export default FeedContainer;
