import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from 'antd';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import styles from './video.module.scss';
import { CheckBadgeIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import HoverVideoPlayer from 'react-hover-video-player';
import TruncateText from '@components/common/truncate-text';
import ScrollingText from '@components/common/layout/scrolling-text';
import CollaboratorList from './collaborator-list';




export default function VideoComponent(video) {

  const [hover, setHover] = useState(false);


  const membersOnly = video.video.isSale === 'subscription' && !video.video.isSubscribed;

  const unpaid = video.video.isSale === 'pay' && !video.video.isBought && !video.video.isSchedule;


  const calcBackgroundStyle = () => {
    const thumbnails = video?.video?.thumbnail?.thumbnails;
    const fallbackUrl = video?.video?.thumbnail?.url;
    
    return thumbnails?.length ? thumbnails[0] : fallbackUrl ?? '/static/no-image.jpg';
  };
  
  const backgroundImageStyle = {
    backgroundImage: `url("${calcBackgroundStyle()}")`
  };



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

  const thumbnailOverlay = (message: String) => (
    <div className='w-full flex relative justify-center items-center h-full inset-0'>
      <div className='absolute m-auto flex justify-center items-center bg-slaps-gray rounded-md backdrop-blur uppercase flex flex-row py-2 px-3 gap-1'>
        <LockClosedIcon className='text-trax-white mt-[-2px]' width={14} height={14} />
        <span className='text-trax-white text-xs'>{message}</span>
      </div>
    </div>
  );

  const thumbnailImage = () => (
    <div className={styles['new-track-thumb']}>
      <div className={styles['new-track-bg']} style={backgroundImageStyle}>
        <Link href={`/${video?.video?.trackType === 'video' ? 'video' : 'track'}?id=${video.video.slug}`} passHref>
          {video.video.video?.duration && (
            <div className={styles['track-duration']}>
              {formatSeconds(video.video.video?.duration)}
            </div>
          )}
          {video?.video?.limitSupply && (
            <div style={{textShadow: '#c8ff00 1.5px 0.5px 12px'}} className="absolute rounded uppercase font-heading top-0 left-0  m-3 rounded text-[16px] bg-[#7E2CDD] px-[6px] py-[2px] text-[#FFF] ">
            Limited release
          </div>
          )}

          {membersOnly && thumbnailOverlay('Members only')}

          {unpaid && thumbnailOverlay(`Unlock for $${video.video.price}`)}
        </Link>
      </div>
    </div>
  );

  const thumbnailVideo = () => {
    return (
      <div className={styles['new-track-thumb']}>
        <div className={styles['new-track-bg']} style={backgroundImageStyle}>
          <Link href={`/${video?.video?.trackType === 'video' ? 'video' : 'track'}?id=${video.video.slug}`} passHref>
            <HoverVideoPlayer
              videoSrc={video.video.video.url}
              restartOnPaused
              playbackRangeEnd={5}
              loop={false}
              muted={false}
              // unloadVideoOnPaused
              playbackStartDelay={300}
            />
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div key={video.video._id} className={styles.componentVideoModule}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <div
        className={styles['new-track-link']}
      >
        {hover == false || (membersOnly || unpaid) ? thumbnailImage() : thumbnailVideo()}

        <div className={styles['track-info-wrapper']} style={{ marginTop: video.isProfileGrid && '5px' }}>
          {!video.isProfileGrid && (
            <Link href={`/${video?.video?.trackType === 'video' ? 'video' : 'track'}?id=${video.video.slug}`} passHref className='w-full'>
              <div className={styles['track-title-related']}>
                <ScrollingText text={video?.video?.title}/>
              </div>
            </Link>
          )}

          <div className={styles['track-info']}>
            {/* <Link href={`/artist/profile/?id=${video.video?.performer?.username}`} passHref className={styles['track-avatar']}>
                {video.video?.performer?.avatar ? (
                  <Avatar className='size-10' src={video.video?.performer?.avatar || '/static/no-avatar-dark-mode.png'} />
                ) : (
                  <UserCircleIcon className='size-10' />
                )}
              </Link> */}
            {!video.isProfileGrid && (
              <CollaboratorList isFromRelatedList={true} video={video.video} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
