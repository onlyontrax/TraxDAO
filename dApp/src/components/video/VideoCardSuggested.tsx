import { useState } from 'react';
import { videoDuration } from '@lib/index';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import HoverVideoPlayer from 'react-hover-video-player';
import { IVideo } from 'src/interfaces';

interface IProps {
  video: IVideo;
}

export default function VideoCardSuggested({ video }: IProps) {
  const [hover, setHover] = useState(false);

  const membersOnly = video.isSale === 'subscription' && !video.isSubscribed;
  const unpaid = video.isSale === 'pay' && !video.isBought && !video.isSchedule;
  const soldOut = video.limitSupply && video.supply === 0;
  const canView = (video.isSale === 'subscription' && video.isSubscribed) || (video.isSale === 'pay' && video.isBought) || video.isSale === 'free';

  const thumbUrl = (canView ? video?.thumbnail?.url : video?.thumbnail?.thumbnails && video?.thumbnail?.thumbnails[0])
    || (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0])
    || (video?.video?.thumbnails && video?.video?.thumbnails[0])

  const thumbnailOverlay = (message: string) => (
    <div className='w-full flex relative justify-center items-center h-full inset-0'>
      <div className='absolute m-auto justify-center items-center bg-[#0e0e0e] rounded-full flex flex-row py-0.5 px-3 gap-1'>
        {!soldOut && (<LockClosedIcon className='text-trax-white mt-[-1px]' width={11} height={11} />)}
        <span className='text-trax-white text-xs'>{message}</span>
      </div>
    </div>
  );

  const thumbnailImage = () => (
    <>
      {membersOnly && thumbnailOverlay('Members only')}

      {(unpaid && !soldOut) && thumbnailOverlay(`Unlock for $${video.price}`)}

      {(unpaid && soldOut) && thumbnailOverlay('Sold out')}

      <div className="absolute bottom-0 right-0 px-1 py-0 m-1 text-trax-white bg-[#000000b2] font-medium text-[10px] rounded-md">
        {videoDuration(video.video?.duration)}
      </div>
    </>
  );

  const thumbnailVideo = () => (
    <HoverVideoPlayer
      videoSrc={video.video.url}
      restartOnPaused
      playbackRangeEnd={15}
      loop={false}
      muted={true}
      playbackStartDelay={300}
    />
  );

  return (
    <Link href={`/${video?.trackType === 'video' ? 'video' : 'track'}?id=${video.slug || video._id}`} passHref>
      <div className="flex flex-row">
        <div className="prd-card-suggested"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}>
          <div className="prd-card-overlay-suggested" style={{ backgroundImage: `url(${thumbUrl})` }}>
            {hover === false || (membersOnly || unpaid) ? thumbnailImage() : thumbnailVideo()}
          </div>
        </div>
        <div>
          <div className="prd-info-suggested">
            <span className="text-[0.95rem]">{video.title}</span>
            <Link href={`/artist/profile/?id=${video.performer.username || video.performer._id}`} className="prd-info-name">
              <span>{video.performer.name}</span>
            </Link>
            {video.limitSupply && (
              <div className="limited-release-label">
                Limited release
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};