import { shortenLargeNumber, videoDuration } from '@lib/index';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces';
import {FaPlay, FaLock} from 'react-icons/fa'
import { CheckBadgeIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import styles from './video.module.scss';
interface IProps {
  video: IVideo;
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
    const { video } = this.props;
    const canView = (video.isSale === 'subscription' && video.isSubscribed)
      || (video.isSale === 'pay' && video.isBought)
      || video.isSale === 'free';
    const thumbUrl = (canView ? video?.thumbnail?.url : video?.thumbnail?.thumbnails && video?.thumbnail?.thumbnails[0])
      || (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0])
      || (video?.video?.thumbnails && video?.video?.thumbnails[0])
      || '/static/no-image.jpg';

    return (
      <div key={video._id} className={styles.componentVideoModule}>
        <Link href={`/video?id=${video.slug}`} passHref>
          <div
            className={styles['new-track-link']}
          >
            <div className={styles['new-track-thumb']}>
              <div className={styles['new-track-bg']} style={{ backgroundImage: `url(${thumbUrl})` }}>
                {video.video?.duration ? (
                  <div className={styles['track-duration']}>
                    {this.formatSeconds(video.video?.duration)}
                  </div>
                ) : null}
                {video?.limitSupply && (
                <div className={styles['track-limited']}>
                  Limited Edition
                </div>
              )}


              {video.isSale === 'subscription' && !video.isSubscribed && (
                    <div className='w-full flex relative justify-center items-center h-full inset-0'>
                      <div className='absolute m-auto flex justify-center items-center bg-[#0e0e0e] rounded-full flex flex-row py-2 px-3 gap-1'>
                        <LockClosedIcon className='text-trax-white mt-[-2px]' width={14} height={14}/>
                        <span className='text-trax-white text-xs font-heading'>Members only</span>
                      </div>
                    </div>
                  )}


                  {/* {video.isSale === 'pay' && !video.isBought && !video.isSchedule  && (
                    <div className='w-full flex relative justify-center items-center h-full inset-0'>
                      <div className='absolute m-auto flex justify-center items-center bg-[#0e0e0e] rounded-full flex flex-row py-2 px-3 gap-1'>
                      <LockClosedIcon className='text-trax-white mt-[-2px]' width={14} height={14}/>
                        <span className='text-trax-white text-xs'>Unlock for ${video.price}</span>
                      </div>
                    </div>
                  )} */}

                  {video.isSale === 'pay' && !video.isBought && !video.isSchedule  && (
                    <>
                      {(video.limitSupply && video.supply === 0)  ? (
                        <div className='w-full flex relative justify-center items-center h-full inset-0'>
                          <div className='absolute m-auto flex justify-center items-center bg-trax-black rounded-full flex flex-row py-2 px-3 gap-1'>
                            {/* <LockClosedIcon className='text-trax-white text-sm' width={18} height={18}/> */}
                            <span className='text-trax-white '>Sold out</span>
                          </div>
                        </div>
                      ):(
                        <div className='w-full flex relative justify-center items-center h-full inset-0'>
                          <div className='absolute m-auto flex justify-center items-center bg-trax-black rounded-full flex flex-row py-2 px-3 gap-1'>
                            <LockClosedIcon className='text-trax-white font-heading text-sm' width={18} height={18}/>
                            <span className='text-trax-white font-heading'>Unlock for ${video.price}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  </div>
            </div>
            <div className={styles['track-info-wrapper']}>
              <div className={styles['track-info']}>
                <Link href={`/video?id=${video.slug}`} passHref>
                  <div className={styles['track-title']}>{video.title}</div>
                </Link>
                <Link href={`/${video.performer.username}`} passHref>
                <div className={styles['track-artist']}>{video.performer.name}</div>
              </Link>
              </div>

            </div>
          </div>
        </Link>
      </div>









      // <div className="tracks-wrapper">
      //   <div className='tracks-wrapper-overlay'>
      //   <Link
      //     href={`/video?id=${video.slug || video._id}`}
      //     as={`/video?id=${video.slug || video._id}`}
      //     legacyBehavior
      //   >
      //     <div className="tracks-tab-stats">
      //       <div className="track-image" style={{ backgroundImage: `url(${thumbUrl})` }} />
      //       <div className="track-name">{video.title}</div>
      //       <div className="track-views">{shortenLargeNumber(video?.stats?.views || 0)}</div>

      //       <div className="track-length">{videoDuration(video?.video?.duration || 0)}</div>

      //       <span className="track-price">
      //         {video.isSale === 'pay' && (
      //         <div className="price-badge">
      //           $
      //           {(video.price || 0).toFixed(2)}
      //         </div>
      //         )}
      //         {video.isSale === 'free' && <div className="free-badge">Free</div>}
      //         {video.isSale === 'subscription' && <div className="sub-badge">Subs</div>}
      //       </span>
      //       {/* )} */}
      //     </div>
      //   </Link>
      //   </div>
      // </div>
    );
  }
}
