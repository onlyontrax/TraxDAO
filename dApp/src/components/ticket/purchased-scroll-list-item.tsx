import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ITicket } from 'src/interfaces';
import { UserListTicket } from './user-list-ticket';

interface IProps {
  items: ITicket[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  notFoundText?: string;
}

export class PurchasedScrollListTicket extends PureComponent<IProps> {
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
        <UserListTicket tickets={items} />
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

PurchasedScrollListTicket.defaultProps = {
  notFoundText: ''
} as Partial<IProps>;
