import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { message, Spin } from 'antd';
import Error from 'next/error';
import { FireOutlined, FireFilled, PlusOutlined } from '@ant-design/icons';
import { BsCheckCircleFill } from 'react-icons/bs';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { AudioPlayer_ } from '@components/common/audio-player';
import RelatedList from './related-list';
import ContentData from './contentData';
import {
    useVideoData,
    useVideoStats,
    useUserReactions,
    usePriceConversion,
    handleReaction,
    usePurchaseHandling,
  } from './hooks';
  import { reactionService } from '@services/index';
import { IVideo, IUser, IUIConfig, ISettings, IAccount } from 'src/interfaces';
import TraxButton from '@components/common/TraxButton';
import { convertToReadableDate, useLiveCountdown } from '@components/common/date-convert';
import { AnimatePresence, motion } from "framer-motion";
import ShareButton from '@components/common/share-button';
import CollaboratorList from './collaborator-list';

interface MusicPageProps {
  user: IUser;
  error: any;
  account: IAccount;
  artistsContent: any,
  featuredContent: any,
  ui: IUIConfig;
  video: IVideo;
  settings: ISettings;
  contentUnlocked: boolean;
  openLogIn: (isOpen: boolean, logIn: boolean) => void;
  openSubModal: (open: boolean) => void;
  openPurchaseModal: (open: boolean) => void;
}

interface IVideoStats {
  likes: number;
  views: number;
  comments: number;
  bookmarks: number;
}



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
const initial_2 = { opacity: 0, y: 20 };
const animate_2 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.4,
    ease: "easeOut",
    once: true,
  },
}

const animate_3 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.6,
    ease: "easeOut",
    once: true,
  },
}

const animate_4 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.9,
    ease: "easeOut",
    once: true,
  },
}


export const MusicPage: React.FC<MusicPageProps> = ({
  user,
  error,
  artistsContent,
  featuredContent,
  account,
  ui,
  video: initialVideo,
  settings,
  contentUnlocked,
  openLogIn,
  openSubModal,
  openPurchaseModal
}) => {
  const router = useRouter();
  const { id } = router.query;
  const { video, loading } = useVideoData(id as string, initialVideo);
  const { amountICPToDisplay, amountCKBTCToDisplay, amountTRAXToDisplay, isPriceICPLoading } = usePriceConversion(video?.price);

  const [isMobile, setIsMobile] = useState(false);
  const [videoStats, setVideoStats] = useState<IVideoStats>(video.stats);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { handlePostPurchase } = usePurchaseHandling(video);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();

    setIsLiked(video?.isLiked);
    setIsBookmarked(video?.isBookmarked);
    setVideoStats(video.stats)

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onReaction = async (action) => {
    try {
      // Check if user is logged in
      if (!user._id) {
        openLogIn(false, true);
        message.info('Please log in to react to music track');
        return;
      }
      if (action === 'like') {
        if (!isLiked) {
          await reactionService.create({
            objectId: video._id,
            action,
            objectType: 'video'
          });
        } else {
          await reactionService.delete({
            objectId: video._id,
            action,
            objectType: 'video'
          });
        }
        setIsLiked(!isLiked);
        setVideoStats(prevStats => ({
          ...prevStats,
          likes: prevStats.likes + (isLiked ? -1 : 1)
        }));
        message.success(!isLiked ? 'Liked' : 'Unliked');
      }

      if (action === 'book_mark') {
        if (!isBookmarked) {
          await reactionService.create({
            objectId: video._id,
            action,
            objectType: 'video'
          });
        } else {
          await reactionService.delete({
            objectId: video._id,
            action,
            objectType: 'video'
          });
        }
        message.success(!isBookmarked ? 'Added to Saved' : 'Removed from Saved');
        setIsBookmarked(!isBookmarked);
        setVideoStats(prevStats => ({
          ...prevStats,
          bookmarks: prevStats.bookmarks + (isBookmarked ? -1 : 1)
        }));
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occurred, please try again later');
    }
  };

  const handlePlay = useCallback(() => {
    if (!user._id) {
      openLogIn(false, true);
    }
  }, [user, openLogIn]);

  const handlePurchaseClick = useCallback(() => {
    if (user._id) {
      window.localStorage.setItem('pendingPurchaseId', video._id);
      openPurchaseModal(true);
    } else {
      openLogIn(false, true);
    }
  }, [user, openPurchaseModal, openLogIn, video._id]);

  useEffect(() => {
    const checkAndHandlePostPurchase = async () => {
      const pendingId = window.localStorage.getItem('pendingPurchaseId');
      if (contentUnlocked && video.isBought && pendingId === video._id) {
        const success = await handlePostPurchase();
        if (success) {
          setIsBookmarked(true);
        }
        window.localStorage.removeItem('pendingPurchaseId');
      }
    };

    checkAndHandlePostPurchase();
  }, [contentUnlocked, video.isBought, video._id, handlePostPurchase]);

  const handleSubClick = useCallback(() => {
    if (user._id) {
      openSubModal(true);
    } else {
      openLogIn(false, true);
    }
  }, [user, openSubModal, openLogIn]);

  if (error) {
    return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Audio was not found'} />;
  }

  if (loading || !video) {
    return <div style={{ margin: 30, textAlign: 'center' }}><img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/></div>;
  }


  const getButtonText = () => {
    if(video.isSchedule){
      return `Scheduled for ${video.scheduledAt}`
    }else{
      if(video.isSale === 'subscription' && !video.isSubscribed){
        return "Subscribe to unlock"
      }else if(video.isSale === 'pay' && !video.isBought && !video.isSchedule){
        if(!video.limitSupply || (video.limitSupply && video.supply > 0)){
          return `Unlock for $${video.price}`
        }
        if(video.limitSupply && video.supply === 0){
          return 'Sold out'
        }
      }
    }
  }

  const beforeUnlock = () => {

      if(video.isSale === 'subscription' && !video.isSubscribed){
        handleSubClick()
      }else if(video.isSale === 'pay' && !video.isBought && !video.isSchedule){
        if(!video.limitSupply || (video.limitSupply && video.supply > 0)){
          handlePurchaseClick()
        }
    }
  }

  const thumbUrl = isMobile ? 
    (video?.thumbnailMobile?.url ||
     (video?.thumbnailMobile?.thumbnails && video?.thumbnailMobile?.thumbnails[0]) ||
     video?.thumbnail?.url ||
     (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0]) ||
     (video?.video?.thumbnails && video?.video?.thumbnails[0]) ||
     '/static/no-image.jpg') :
    (video?.thumbnail?.url ||
     (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0]) ||
     (video?.video?.thumbnails && video?.video?.thumbnails[0]) ||
     '/static/no-image.jpg');

  const audioJsOptions = {
    key: video._id,
    source: video?.video?.url,
    stop: false,
    artistsContent,
    featuredContent,
    showPrevious: true,
    showNext: true,
  };


  console.log(video)
  // console.log(video)


  return (
    <div className='mt-[-80px]'>
      <motion.div
        initial={initial_1}
        animate={animate_1}
        className="tick-img-background-audio"
        style={{backgroundImage: `url('${thumbUrl}')`}}
      >
        <div className='tick-img-blur-background' />
        
      </motion.div>
      <div className={`main-container ${contentUnlocked && !video.isSchedule ? 'max-w-[408px] sm:max-w-[710px]' : 'max-w-[100vw]'} relative  mt-16 `}>
        <div className={!contentUnlocked ? 'vid-player-locked-audio' : 'vid-player-audio'}>
          {(contentUnlocked && !video.isSchedule) ? (
            video.processing ? (
              <div className="vid-processing">
                <div className="text-center">
                  <img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/>
                  <br />
                  Track file is currently processing
                </div>
              </div>
            ) : (
              <div className="audio-track-wrapper">
                <div className='vid-heading-wrapper-unlocked'>
                    <div className='flex flex-col w-full justify-start'>
                      <motion.div initial={initial_2} animate={animate_2} className="vid-heading w-full justify-start mb-1" >
                        <span className="vid-heading-span" >{video.title || 'Untitled'}</span>
                      </motion.div>
                      
                    </div>
                    <motion.div initial={initial_2} animate={animate_2} className='flex flex-row  w-full justify-end'>
                      <div className='vid-more-info-btn-wrapper w-full'>

                        <motion.div initial={initial_2} animate={animate_2}>
                          
                            {/* <span className="vid-artist">{video?.performer?.name || 'N/A'}</span> */}
                            <CollaboratorList isFromRelatedList={false} video={video} />
                            
                          
                        </motion.div>

                        {(contentUnlocked && !video.isSchedule) && (
                          <div className='flex flex-row justify-end'>
                            <ShareButton url={window.location.href} title={"Check this out!"}/>
                            <div className="like-act-btns">
                              <button onClick={() => onReaction('like')} className={`${isLiked ? 'react-btn-lg active' : 'react-btn-lg '} backdrop-blur`}>
                                {isLiked ? <FireFilled /> : <FireOutlined />}
                              </button>
                            </div>
                            <button onClick={() => onReaction('book_mark')} className={`${isBookmarked ? 'react-btn-lg active' : 'react-btn-lg '} backdrop-blur`}>
                              {isBookmarked ? <BsCheckCircleFill style={{ color: '#c7ff02' }} /> : <PlusOutlined />}
                            </button>
                          </div>
                        )}

                      </div>
                    </motion.div>
                </div>
                <motion.div initial={initial_2} animate={animate_3}>
                  <AudioPlayer_ relatedVideos={featuredContent} hasSignedIn={!!user._id} onPressPlay={handlePlay} {...audioJsOptions} />
                </motion.div>
              </div>
            )
          ) : (
            <div className='relative flex flex-col sm:flex-row gap-4 sm:gap-0 w-full justify-between px-4 sm:px-8'>
              <div className='relative flex flex-col flex-start'>
                <motion.div initial={initial_2} animate={animate_2} className="vid-heading gap-y-1">
                  {(video?.limitSupply && video?.supply > 0) && (
                    <div style={{textShadow: '#c8ff00 1.5px 0.5px 12px'}} className="w-fit mb-2 uppercase rounded font-heading text-[16px] bg-[#7E2CDD] px-[6px] py-[2px] text-[#FFF]  ">
                      Limited release
                    </div>
                  )}
                  <span className="vid-heading-span">{video.title || 'Untitled'}</span>
                  <motion.div initial={initial_2} animate={animate_2}>
                  <CollaboratorList isFromRelatedList={false} video={video} />
                  </motion.div>
                </motion.div>
              </div>

              <motion.div initial={initial_2} animate={animate_2} className='relative flex flex-end flex-col justify-center'>
                <div className={`${(video?.limitSupply && video?.supply > 0 && !contentUnlocked) ? 'bg-[#414141B2] p-4' : 'bg-transparent'} mt-4 sm:-mt-10 rounded-lg flex flex-col gap-2 `}>
                  {(video?.limitSupply && video?.supply > 0 && !contentUnlocked) && (
                    <div className=''>
                    <span className='flex flex-col text-[#EA0000] uppercase font-heading text-3xl leading-[1.6rem] font-bold'>
                      <span>{video?.supply}</span>
                      <span>{video?.supply === 1 ? "copy" : "copies"}</span>
                      <span>left!</span>
                      </span>
                  </div>
                  )}
                  {video.isSchedule ? (
                    <div className='flex rounded-lg bg-[#414141B2] p-4 w-full justify-center sm:w-fit backdrop-blur'>
                      <div className='flex flex-col justify-center font-heading'>
                        <span className='flex justify-center text-custom-green text-3xl uppercase'>Scheduled for: </span>
                        {/* <span className='flex text-custom-green text-xl'>{convertToReadableDate(video.scheduledAt)}</span> */}
                        <span className='flex text-[#EA0000] text-4xl justify-center'>{useLiveCountdown(video.scheduledAt)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className='w-full flex'>

                    
                    <TraxButton
                      htmlType="button"
                      disabled={video.limitSupply && video.supply === 0}
                      styleType="primary"
                      buttonSize={!isMobile ? 'medium' : 'full'}
                      buttonText={getButtonText()}
                      loading={false}
                      onClick={beforeUnlock}
                    />
                    </div>
                  )}
                </div>
                  </motion.div>
                </div>
          )}
        </div>
      </div>
      <motion.div initial={initial_2} animate={animate_4} className='flex flex-col md:flex-row mt-20 pl-4 pr-4 sm:pl-8 sm:pr-0 gap-8'>
        <ContentData 
          isMobile={isMobile} 
          contentUnlocked={contentUnlocked} 
          video={video} 
          settings={settings} 
          ui={ui} 
          user={user} 
          account={account}
        />
        <div className='vid-right-wrapper'>
        {artistsContent.length > 0 && (
            <div className="related-items">
              {artistsContent.length > 0 && !artistsContent.requesting && (
                <RelatedList videos={artistsContent} total={artistsContent.length} title={"More from this artist"}/>
              )}
            </div>
          )}
          {featuredContent.length > 0 && (
            <div className="related-items">
              {featuredContent.length > 0 && !featuredContent.requesting && (
                <RelatedList videos={featuredContent} total={featuredContent.length} title={"Featured content"}/>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
