import { shortenLargeNumber, videoDuration } from '@lib/index';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces';
import { Avatar } from 'antd';
import {FaPlay, FaLock} from 'react-icons/fa'
import { CheckBadgeIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { PlayIcon, SpeakerWaveIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import styles from './video.module.scss';
import TruncateText from '@components/common/truncate-text';
import ScrollingText from '@components/common/layout/scrolling-text';
import CollaboratorList from './collaborator-list';

interface IProps {
  video: IVideo;
  isFromRelatedList: boolean;
  showStatusTags?: boolean;
}

export class VideoCard extends PureComponent<IProps> {
  formatSeconds(seconds) {
    if (!seconds) {
      return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  }

  render() {
    const { video, showStatusTags } = this.props;
    const canView = (video.isSale === 'subscription' && video.isSubscribed)
      || (video.isSale === 'pay' && video.isBought)
      || video.isSale === 'free';


  const calcBackgroundStyle = () => {
    const thumbnails = video?.thumbnail?.thumbnails;
    const fallbackUrl = video?.thumbnail?.url;
    
    return thumbnails?.length ? thumbnails[0] : fallbackUrl ?? '/static/no-image.jpg';
  }; 

  const backgroundImageStyle = {
    backgroundImage: `url("${calcBackgroundStyle()}")`
  };
    

    return (
      <div key={video._id} className={styles.componentVideoModule}>
        <div className={`min-w-[240px] min-h-[150px] md:min-w-[310px] md:min-h-[200px]`}>
          <Link href={`/${video?.trackType === 'video' ? 'video' : 'track'}?id=${video.slug}`} passHref>
            <div className={styles['new-track-link']}>
              <div className={styles['new-track-thumb']}>
                <div className={styles['new-track-bg']} style={backgroundImageStyle}>
                  {video.video?.duration ? (
                    <div className={styles['track-duration']}>
                      {this.formatSeconds(video.video?.duration)}
                    </div>
                  ) : null}
                  {video?.limitSupply && (
                    <div style={{textShadow: '#c8ff00 1.5px 0.5px 12px'}} className=" absolute rounded uppercase font-heading top-0 left-0  m-3 font-bold rounded text-[16px] bg-[#7E2CDD] px-[6px] py-[2px] text-[#FFF] ">
                    Limited release
                  </div>
                  )}
                  <div className={styles['track-type']}>
                    {showStatusTags && (video.isBought || video.isBookmarked) ? (
                      video.isBought ? 'purchased' : 'saved'
                    ) : (
                      <>
                        {video.trackType === 'audio' ? <SpeakerWaveIcon className='w-[19px] h-[19px] mt-[2px]'/> : <PlayIcon className='w-[19px] h-[19px] mt-[2px]'/>}
                        {video.trackType === 'audio' ? 'track' : 'video'}
                      </>
                    )}
                  </div>

                  {video.isSale === 'subscription' && !video.isSubscribed && (
                    <div className='w-full flex relative justify-center items-center h-full inset-0'>
                      <div className='absolute m-auto justify-center items-center bg-slaps-gray rounded-md backdrop-blur uppercase flex flex-row py-2 px-3 gap-1'>
                        <LockClosedIcon className='text-trax-white font-heading -mt-[2px]' width={18} height={18}/>
                        <span className='text-trax-white text-[16px] font-heading'>Members only</span>
                      </div>
                    </div>
                  )}

                  {video.isSale === 'pay' && !video.isBought && !video.isSchedule && (
                    <>
                      {(video.limitSupply && video.supply === 0) ? (
                        <div className='w-full flex relative justify-center items-center h-full inset-0'>
                          <div className='absolute m-auto justify-center items-center bg-slaps-gray rounded-md backdrop-blur uppercase flex flex-row py-2 px-3 gap-1'>
                            <span className='text-trax-white font-heading'>Sold out</span>
                          </div>
                        </div>
                      ) : (
                        <div className='w-full flex relative justify-center items-center h-full inset-0'>
                          <div className='absolute m-auto justify-center items-center bg-slaps-gray rounded-md backdrop-blur uppercase flex flex-row py-2 px-3 gap-1'>
                            <LockClosedIcon className='text-trax-white font-heading -mt-[2px]' width={18} height={18}/>
                            <span className='text-trax-white uppercase text-xs'>Unlock for ${video.price}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className={styles['track-info-wrapper']}>
                <Link href={`/${video?.trackType === 'video' ? 'video' : 'track'}?id=${video.slug}`} passHref className='w-full'>
                  <div className={styles['track-title-related']}>
                    <ScrollingText text={video?.title}/>
                  </div>
                </Link>

                <div className={styles['track-info']}>
                  {/* <Link href={`/artist/profile/?id=${video?.performer?.username}`} passHref className={styles['track-avatar']}>
                    {video?.performer?.avatar ? (
                      <Avatar className='size-11' src={video?.performer?.avatar || '/static/no-avatar-dark-mode.png'} />
                    ) : (
                      <UserCircleIcon className='size-10' />
                    )}
                  </Link> */}
                  <CollaboratorList isFromRelatedList={true} video={video} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }
}