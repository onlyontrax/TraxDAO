import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IVideo } from 'src/interfaces';
import { ExpandableCards } from '@components/ui/expandable-cards';
import styles from './video.module.scss';
interface IProps {
  items: IVideo[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  notFoundText?: string;
  isProfileGrid?: boolean;
}

export class ScrollListMusic extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;


  render() {
    const {
      items = [], loadMore, loading = false, canLoadmore = false, notFoundText, isProfileGrid
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

        <ExpandableCards cards={items}/>

        {!items.length && !loading && <div className="main-container custom"><div><Alert className="no-object-found" message={notFoundText || 'This artist has no available music'} type="info" /></div></div>}
        {loading && <div className="text-center"><Spin /></div>}

      </InfiniteScroll>

      </div>

    );
  }
}

ScrollListMusic.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
