import React, { useEffect, useState } from 'react';
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";
import { PerformerAdvancedFilter } from '@components/common/base/performer-advanced-filter';
import { message } from 'antd';
import { performerService, utilsService, videoService, featuredArtistsService } from 'src/services';
import { AnimatePresence, motion } from "framer-motion";
import TrackListItem from '@components/common/layout/music-track'
import VideoComponent from '@components/video/Searched_video_component';
import RelatedList from '@components/video/related-list';
import CountHeading from './count-heading';

const initial_1 = { opacity: 0, y: 0 };
const animate_1 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 1.3,
    delay: 0.3,
    ease: "easeOut",
    once: true,
  },
}
interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
}

interface Artist {
  id: string;
  name: string;
  image: string;
}

const NavigationContent = ({ isMobile, user}) => {

  const [showFeaturedArtists, setShowFeaturedArtists] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState({sortBy: 'latest'} as any)
  const [limit, setLimit] = useState(15)
  const [fetching, setFetching] = useState(false)
  const [performers, setPerformers] = useState([])
  const [featuredMusic, setFeaturedMusic] = useState([])
  const [featuredVids, setFeaturedVids] = useState([])
  const [featuredPerformers, setFeaturedPerformers] = useState([])
  const [total, setTotal] = useState(0)
  const [openSearchBox, setOpenSearchBox] = useState(false)
  const [isSearchEmpty, setIsSearchEmpty] = useState(false)
  const [openNavDropDown, setOpenNavDropDown] = useState(false)


  useEffect(() => {
    const fetchData = async () => {
      await getFeaturedArtists();
      // handleGenreFilter('featured');
      await getFeaturedContent();
    };

    fetchData();
  }, []);

  const handleGenreFilter = (genreName: string) => {

    let f, vals;
    if(genreName !== 'featured'){

      vals = {searchValue: genreName, q: genreName}
      f = { ...filter, ...vals };
      setOffset(0), setFilter(f);
      getPerformersByGenre(0, f, limit);
    }else{
      vals = {searchValue: '', q: ''}
      handleFilter(vals, true);
      // this.updateDataDependencies();
    }
  }





  const getPerformersByGenre = async(offset: any, filter: any, limit: any) => {

    try {
      setFetching(true);
      const resp = await videoService.homePageSearch({
        limit,
        ...filter,
        offset: limit * offset
      });
      setPerformers(resp.data.data), setTotal(resp.data.total), setFetching(false);
    } catch {
      message.error('Error occured, please try again later');
      setFetching(false);
    }
  }



  const getFeaturedArtists = async () => {
    try {
      const [featuredArtists] = await Promise.all([
        featuredArtistsService.search({ limit: 99 }),
      ]);
      setPerformers(featuredArtists.data?.data)

    } catch (e) {
      return {
        featuredArtists: [],
      };
    }
  }



  const getArtists = async () => {

    let filter = { sortBy: 'latest' }

      let vals = {searchValue: 'featured', q: 'featured'};
      let f = { ...filter, ...vals };

    const response = await performerService.searchGenre({
      limit: 15,
        ...f,
        offset: 15
    });
  }

  const formatSeconds = (seconds) => {
    if (!seconds) {
      return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  }

  const handleFilter = (values: any, getGenre: boolean) => {
    setShowFeaturedArtists(!values.searchValue ? true : false);
    const f = { ...filter, ...values };
    setOffset(0)
    setFilter(f)
    getPerformers(0, f, limit);
  }

  const getPerformers = async(offset: any, filter: any, limit: any) => {

    try {

      setFetching(true);

      const resp = await performerService.search({
        limit,
        ...filter,
        offset: limit * offset
      });

      setPerformers(resp.data.data);
      setTotal(resp.data.total);
      setFetching(false);
    } catch (error) {
      console.log(error)
      // message.error('Error occured, please try again later');
      setFetching(false);
    }
  }

  const changeEmptySearchBar = (bool) =>{
    // const { onFinish: isSearch } = this.props;
    // if(bool){
    //   isSearch(false, [], 0);
    // }
    setOpenSearchBox(!bool)
    setIsSearchEmpty(bool)
  }


  const getFeaturedContent = async () => {
    let featured = [];
    let featuredVids = [];
    await videoService.homePageSearch({
      limit: 10,
      sortBy: 'latest',
      tags: 'featured',
      offset: 0,
    }).then((res) => {
      res.data.data.map((v)=>{
        if(v._id){

            if(v.trackType === 'audio'){
              featured.push(v);
            }else if(v.trackType === 'video'){
              featuredVids.push(v);
            }else{}
          }

      })
    })
    setFeaturedMusic(shuffleArray(featured));
    setFeaturedVids(shuffleArray(featuredVids));
  }

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return (
    <div className=" border-t border-[#9dff0059] ">


      <div className={`${isMobile ? 'top-7 -right-[5.5rem]' : 'top-2.5 right-20'}  absolute `}>
        <PerformerAdvancedFilter
          isMobile={isMobile}
          onSubmit={handleFilter}
          onSearch={changeEmptySearchBar}
          user={user}
        />
      </div>
      <div className='flex flex-col sm:flex-row gap-4'>



      <div className="flex flex-col w-full sm:w-1/2 py-4 sm:p-6 bg-[#1F1F1FB2]">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: "easeOut"
        }}
          className="sm:-ml-10"
        >
          <CountHeading isLarge={true} count={performers.length} title={"Artists"}/>
        </motion.h2>



        <div className="relative">
          {performers.length === 0 && (
            <div className='flex blur-[1.2px] opacity-50'>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                  ease: "easeOut"
                }}
                className='text-5xl w-full text-trax-white font-heading font-semibold uppercase pl-4 sm:pl-0'
              >
                No artists match your search
              </motion.span>
            </div>
          )}
          <div className={`flex gap-x-4 gap-y-8 overflow-x-auto pb-4 pl-4 sm:pl-0 sm:grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3`}>
            {performers.length > 0 && (
              performers.map((artist, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                      duration: 0.5,
                      delay: 0.2 + (index * 0.025),
                      ease: "easeOut"
                  }}
                  className="flex-shrink-0 w-fit"
                >
                  <a className='flex justify-center' href={`${artist.username ? `/artist/profile/?id=${artist?.username || artist?._id}`: artist.link} `} >
                  <div className="w-36 h-36 lg:w-52 lg:h-52 rounded-full overflow-hidden mb-2 border border-[#ffffff30] p-1 ">
                  <img
                      src={artist.avatar || artist?.photo?.url || '/static/no-avatar.png'}
                      alt={artist.name || artist.title}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  </a>
                  <p className="text-center text-2xl uppercase text-trax-white font-heading">{artist.name || artist.title }</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full gap-8 sm:w-1/2 flex-col overflow-y-auto relative py-4 sm:p-6">
      <div className='flex-col  sm:pl-0'>
        <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.4,
              ease: "easeOut"
          }}
          className="sm:-ml-10"
        >
          <CountHeading isLarge={true} count={featuredMusic.length} title={"Exclusive tracks"}/>
        </motion.h2>
        <div className="grid grid-cols-1 overflow-y-auto overflow-x-hidden gap-2 px-3 sm:px-0">
          {featuredMusic.map((track, index) => (
            <motion.a
              href={`${track?.trackType === 'video' ? track?.trackType : 'track'}/?id=${track?.slug}`}
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + (index * 0.08),
                ease: "easeOut"
              }}
            >
              <TrackListItem track={track} index={index} />
            </motion.a>
          ))}
        </div>
      </div>
      <div className='pl-4 sm:pl-0 '>
        <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.4,
              ease: "easeOut"
          }}
          className="-ml-6 sm:-ml-10"
        >
          <CountHeading isLarge={true} count={featuredVids.length} title={"Popular videos"}/>
        </motion.h2>

              <RelatedList videos={featuredVids} />

      </div>

      </div>
      </div>
    </div>
  );
};

export default NavigationContent;