import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IVideo } from 'src/interfaces';
import { PerformerListVideo } from './performer-list';
import styles from './video.module.scss';
import { ExpandableCardLarge } from '@components/ui/expandable-cards-lg';
interface IProps {
  items: IVideo[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  notFoundText?: string;
  isProfileGrid?: boolean;
  isDesktop?: boolean;
}

export class ScrollListVideo extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;


  render() {
    const {
      items = [], loadMore, loading = false, canLoadmore = false, notFoundText, isProfileGrid, isDesktop
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
            style={{padding: isProfileGrid ? (isDesktop ? "1rem 2rem" : "1rem") : (isDesktop ? "1rem 4rem" : "0rem")}}
          >
        {isProfileGrid ? (
          <>
            <ExpandableCardLarge cards={items}/>

          </>
        ) : (


            <PerformerListVideo videos={items} isProfileGrid={isProfileGrid}/>




        ) }
         {!items.length && !loading && <div className="main-container custom"><div><Alert className="no-object-found" message={notFoundText || 'This artist has no available videos'} type="info" /></div></div>}
         {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
      </div>
    );
  }
}

ScrollListVideo.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
