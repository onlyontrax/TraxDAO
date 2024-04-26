import { IFeed } from '@interfaces/index';
import { Alert, Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FeedExploreGridCard } from './explore-card';
import FeedCard from './post-card';

interface IProps {
  items: IFeed[];
  canLoadmore: boolean;
  loadMore(): Function;
  onDelete(): Function;
  loading?: boolean;
  isGrid?: boolean;
  notFoundText?: string;
  fromExplore?: boolean;
}

export default class ExploreListFeed extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      items = [],
      loadMore,
      onDelete,
      canLoadmore,
      loading = false,
      isGrid = true,
      notFoundText,
      fromExplore
    } = this.props;
    return (
      <InfiniteScroll
        dataLength={items.length}
        hasMore={canLoadmore}
        loader={null}
        next={loadMore}
        endMessage={null}
        scrollThreshold={0.8}
      >
        <div className={isGrid ? 'grid-view' : 'fixed-scroll'}>
          {items.length > 0
            && items.map((item) => {
              if (isGrid) {
                return (
                  <FeedExploreGridCard
                    feed={item}
                    key={!item?._id ? item?.refId : item?._id}
                  />
                );
              }
              return (
                <FeedCard
                  feed={item}
                  key={!item._id ? item.refId : item._id}
                  onDelete={onDelete.bind(this)}
                  fromExplore={fromExplore}
                />
              );
            })}
        </div>
        {!items.length && !loading && (
          <div className="main-container custom">
            <Alert
              className="no-object-found"
              message={notFoundText || 'No post was found'}
              type="info"
            />
          </div>
        )}
        {loading && (
          <div className="text-center">
            <Spin />
          </div>
        )}
      </InfiniteScroll>
    );
  }
}

ExploreListFeed.defaultProps = {
  loading: false,
  isGrid: false,
  notFoundText: '',
  fromExplore: false
} as Partial<IProps>;
