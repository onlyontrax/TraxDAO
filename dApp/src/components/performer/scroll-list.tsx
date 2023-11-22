import PerformerCard from '@components/performer/grid-card';
import {
  Alert, Col, Row, Spin
} from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ICountry, IPerformer } from 'src/interfaces';

interface IProps {
  performers: IPerformer[];
  total: number;
  loadMore(): Function;
  loading: boolean;
  // eslint-disable-next-line react/require-default-props
  notFoundText?: string;
  countries: ICountry[];
}

export function ScrollListPerformers({
  loadMore, performers, total, loading, notFoundText, countries
}: IProps) {
  return (
    <>
      <InfiniteScroll
        dataLength={performers.length}
        hasMore={performers && performers.length < total}
        loader={null}
        next={loadMore}
        endMessage={null}
        scrollThreshold={0.9}
      >
        <Row>
          {performers.length > 0
            && performers.map((p: any) => (
              <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
                <PerformerCard performer={p} countries={countries} />
              </Col>
            ))}
        </Row>
      </InfiniteScroll>
      {!performers.length && !loading && (
        <div className="main-container custom text-center">
          <Alert type="info" message={notFoundText || 'No profile was found'} />
        </div>
      )}
      {loading && (
        <div className="text-center">
          <Spin />
        </div>
      )}
    </>
  );
}

export default ScrollListPerformers;
