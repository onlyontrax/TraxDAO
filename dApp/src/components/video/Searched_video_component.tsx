import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from 'antd';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import styles from './video.module.scss';
import { CheckBadgeIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import HoverVideoPlayer from 'react-hover-video-player';

export default function VideoComponent(video) {

  const [hover, setHover] = useState(false);

  const membersOnly = video.video.isSale === 'subscription' && !video.video.isSubscribed;

  const unpaid = video.video.isSale === 'pay' && !video.video.isBought && !video.video.isSchedule;

  // const getUrl = (videoProp) => {
  //   const { thumbnail, video, teaser } = videoProp;
  //   const url = (video?.thumbnail?.url ? video?.thumbnail?.url : video?.teaser?.thumbnails.url)
  //     || (thumbnail?.thumbnails && thumbnail?.thumbnails[0])
  //     || (teaser?.thumbnails && teaser?.thumbnails[0])
  //     || (video?.thumbnails && video?.thumbnails[0])
  //     || '/static/no-image.jpg';
  //   return url;
  // };

  // useEffect(()=>{
  //   const url = new URL(window.location.href);
  //   if(url.pathname === `/${video.performer.username}`){

  //   };

  // }, [])

  const backgroundImageStyle = {
    backgroundImage: `url("${(video.video?.thumbnail?.url ? video.video?.thumbnail?.url : video.video?.video.thumbnails[0])}")`
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
      <div className='absolute m-auto justify-center items-center bg-[#0e0e0e] rounded-full flex flex-row py-2 px-3 gap-1'>
        <LockClosedIcon className='text-trax-white mt-[-2px]' width={14} height={14} />
        <span className='text-trax-white text-xs'>{message}</span>
      </div>
    </div>
  );

  const thumbnailImage = () => (
    <div className={styles['new-track-thumb']}>
      <div className={styles['new-track-bg']} style={backgroundImageStyle}>
        <Link href={`/video?id=${video.video.slug}`} passHref>
          {video.video.video?.duration && (
            <div className={styles['track-duration']}>
              {formatSeconds(video.video.video?.duration)}
            </div>
          )}
          {video?.video?.limitSupply && (
            <div className={styles['track-limited']}>
              Limited Edition
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
          <Link href={`/video?id=${video.video.slug}`} passHref>
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
            <Link href={`/${video.video.performer.username}`} passHref>
              <div className={styles['track-avatar']}>
                {video.video.performer.avatar ? (
                  <Avatar className='size-11' src={video.video.performer.avatar || '/static/no-avatar.png'} />
                ) : (
                  <UserCircleIcon className='size-10' />
                )}
              </div>
            </Link>
          )}

          <div className={styles['track-info']}>
            <Link href={`/video?id=${video.video.slug}`} passHref>
              <div className={styles['track-title']}>{video.video.title}</div>
            </Link>
            {!video.isProfileGrid && (
              <Link href={`/${video.video.performer.username}`} passHref>
                <div className={styles['track-artist']}>{video.video.performer.name}</div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
