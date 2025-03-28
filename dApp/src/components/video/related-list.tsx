import React from 'react';
import { motion } from 'framer-motion';
import { VideoCard } from './video-card';
import styles from './video.module.scss';
import { SnapScrollProvider, useSnapScroll } from './snap-scroll-context';
import CountHeading from '@components/common/count-heading';

interface IProps {
  videos: any[];
  title?: string;
  total?: number;
  isHomePage?: boolean;
  showStatusTags?: boolean;
  displayType?: 'grid' | 'scroll';
}

const VideoListContent: React.FC<IProps> = ({
  videos,
  title,
  total = videos?.length,
  isHomePage = false,
  showStatusTags = false,
  displayType = 'scroll'
}) => {
  const { scrollContainerRef, handleScroll } = useSnapScroll();

  // Determine wrapper className based on display type
  const wrapperClassName = displayType === 'grid'
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    : `flex-row flex overflow-x-auto gap-4 pr-3 ${isHomePage ? 'scroll-pl-6 sm:scroll-pl-10 pl-6 sm:pl-10' : ''} snap-x snap-mandatory`;

  return (
    <div className={`w-full ${styles.componentVideoModule}`}>
      <div className="flex flex-col gap-4">
        {title && (
          <CountHeading isLarge={isHomePage} title={title} count={total} />
        )}

        <div 
          ref={scrollContainerRef}
          className={wrapperClassName}
          onScroll={handleScroll}
          style={{
            scrollbarWidth: 'none',  /* Firefox */
            msOverflowStyle: 'none',  /* IE and Edge */
          }}
        >
          {videos.map((video, index) => (
            <motion.div
              key={video._id || index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2 + (index * 0.08),
                ease: "easeOut"
              }}
              className={`${displayType === 'scroll'
                ? `${isHomePage
                    ? 'min-w-[350px] w-[350px] min-h-[210px]'
                    : 'min-w-[310px] min-h-[200px] lg:min-w-[360px] lg:min-h-[200px] [&::-webkit-scrollbar]:hidden'
                  } snap-start`
                : ''
              }`}
            >
              <VideoCard
                video={video}
                isFromRelatedList={true}
                showStatusTags={showStatusTags}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RelatedList: React.FC<IProps> = (props) => {
  return (
    <SnapScrollProvider>
      <VideoListContent {...props} />
    </SnapScrollProvider>
  );
};

export default RelatedList;