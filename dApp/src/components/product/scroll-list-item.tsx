import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IProduct } from 'src/interfaces';
import { PerformerListProduct } from './performer-list-product';

interface IProps {
  items: IProduct[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  notFoundText?: string;
}

export class ScrollListProduct extends PureComponent<IProps> {
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
        <PerformerListProduct products={items} />
        {!loading && !items?.length && (
          <div className="main-container custom">
            <Alert className="text-center" type="info" message={notFoundText || 'No product was found'} />
          </div>
        )}
        {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
    );
  }
}

ScrollListProduct.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
