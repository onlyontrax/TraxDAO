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
        {!items.length && !loading && <div className="main-container custom"><Alert className="text-center" message={notFoundText || 'No video was found'} type="info" /></div>}
        {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
    );
  }
}

ScrollListVideo.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
