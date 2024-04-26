import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { INft } from 'src/interfaces';
import { PerformerListNft } from './performer-list-nft';

interface IProps {
  items: INft[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  notFoundText?: string;
}

export class ScrollListNft extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      items = [], loadMore, canLoadmore = false, loading = false, notFoundText
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
        <PerformerListNft items={items} />
        {!loading && !items.length && (
          <div className="">
                  <Alert className="no-object-found" message={notFoundText || 'This artist has not created any NFTs'} type="info" />
                </div>
        )}
        {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
    );
  }
}

ScrollListNft.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
