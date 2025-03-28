import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IVideo } from 'src/interfaces';
import { ExpandableCards } from '@components/ui/expandable-cards';
import styles from './video.module.scss';
import { IUser, IPerformer } from "src/interfaces";
import TrackListItem from '@components/common/layout/music-track';


interface IProps {
  items: IVideo[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  notFoundText?: string;
  isProfileGrid?: boolean;
  user?: IUser;
  performerThemeColor?: string;
}

export class ScrollListMusic extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;


  render() {
    const {
      items = [], loadMore, loading = false, canLoadmore = false, notFoundText, isProfileGrid, user, performerThemeColor
    } = this.props;
    return (
      <div className={styles.componentVideoModule}>

      <InfiniteScroll
        dataLength={items.length}
        hasMore={canLoadmore}
        loader={null}
        next={loadMore}
        endMessage={null}
        scrollThreshold={0.9}
      >
        {items.length > 0 && (
          <div className='grid grid-cols-1 xl:grid-cols-1'>
            {items.map((track, index) =>(
              <TrackListItem track={track} index={index} key={index} themeColor={performerThemeColor} />
            ))}
          </div>
        )}
        {(!items.length && !loading) && (
          <div className="main-container custom">
            <div className='flex blur-[1.2px] opacity-50 mx-auto flex max-w-[400px] mt-12'>
              {user?.isPerformer ? (
                <a href={"/artist/studio/"} className='text-4xl text-trax-white font-heading font-semibold uppercase flex m-auto'>Click here to upload music</a>
              ):(
                <span className='text-3xl text-trax-white font-heading font-semibold uppercase flex m-auto'>
                  {notFoundText || 'No available music yet'}
                </span>
              )}
            </div>
          </div>
        )}
        {loading && <div className="text-center"><Spin /></div>}

      </InfiniteScroll>

      </div>

    );
  }
}

ScrollListMusic.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
