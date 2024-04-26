import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IVideo } from 'src/interfaces';
import { PerformerListVideo } from './performer-list';

interface IProps {
  items: IVideo[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  notFoundText?: string;
}

export class ScrollListVideo extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      items = [], loadMore, loading = false, canLoadmore = false, notFoundText
    } = this.props;
    return (
      <InfiniteScroll
        dataLength={items.length}
        hasMore={canLoadmore}
        loader={null}
        next={loadMore}
        endMessage={null}
        scrollThreshold={0.9}
      >
        <PerformerListVideo videos={items} />
        {!items.length && !loading && <div className="main-container custom"><div><Alert className="no-object-found" message={notFoundText || 'This artist has no music available'} type="info" /></div></div>}
        {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
    );
  }
}

ScrollListVideo.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
