import React from 'react';
import { Alert, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PerformerListVideo } from './performer-list';
import styles from './video.module.scss';
import { ExpandableCardLarge } from '@components/ui/expandable-cards-lg';
import { IUser, IPerformer } from "src/interfaces";
import VideoComponent from './Searched_video_component';

interface IProps {
  items: any[];
  canLoadmore: boolean;
  loadMore: () => void;
  loading: boolean;
  notFoundText?: string;
  isProfileGrid?: boolean;
  isDesktop?: boolean;
  user?: IUser;
}

export const ScrollListVideo: React.FC<IProps> = ({
  items = [],
  loadMore,
  loading = false,
  canLoadmore = false,
  notFoundText = '',
  isProfileGrid = false,
  isDesktop = false,
  user,
}) => {
  return (
    <div className={styles.componentVideoModule}>
      <InfiniteScroll
        dataLength={items.length}
        hasMore={canLoadmore}
        loader={null}
        next={loadMore}
        endMessage={null}
        scrollThreshold={0.9}
        style={{
          padding: isProfileGrid
            ? (isDesktop ? "" : "1rem")
            : (isDesktop ? "1rem 0rem" : "0rem")
        }}
      >
        <PerformerListVideo
          videos={items}
          isProfileGrid={false}
        />

        {(!items.length && !loading) && (
          <div className="main-container custom">
            <div className='flex blur-[1.2px] opacity-50 mx-auto flex max-w-[400px] mt-12'>
              {user?.isPerformer ? (
                <a href={"/artist/studio/"} className='text-4xl text-trax-white font-heading font-semibold uppercase flex m-auto'>
                  Click here to upload a video
                </a>
              ):(
                <span className='text-3xl text-trax-white font-heading font-semibold uppercase flex m-auto'>
                  {notFoundText || 'No available videos yet'}
                </span>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center">
            <img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/>
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

ScrollListVideo.defaultProps = {
  notFoundText: '',
  isProfileGrid: false,
  isDesktop: false
};