import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ITicket } from 'src/interfaces';
import { PerformerListTicket } from './performer-list-ticket';

interface IProps {
  items: ITicket[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  notFoundText?: string;
}

export class ScrollListTicket extends PureComponent<IProps> {
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
        <PerformerListTicket tickets={items} />
        {!loading && !items?.length && (
          <div className="main-container custom">
            <Alert className="text-center" type="info" message={notFoundText || 'No ticket was found'} />
          </div>
        )}
        {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
    );
  }
}

ScrollListTicket.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
