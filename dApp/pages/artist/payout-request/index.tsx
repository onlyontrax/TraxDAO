import { getResponseError } from '@lib/utils';
import { payoutRequestService } from '@services/index';
import { message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { formatDateNoTime } from 'src/lib';
import { IUIConfig } from 'src/interfaces';
import InfiniteScroll from 'react-infinite-scroll-component';

interface IProps {
  ui: IUIConfig;
}

interface IPayoutRequest {
  _id: string;
  updatedAt: Date;
  amount: number;
}

interface IState {
  items: IPayoutRequest[];
  loading: boolean;
  hasMore: boolean;
}

class PayoutRequest extends PureComponent<IProps, IState> {
  static onlyPerformer = true;

  state: IState = {
    items: [],
    loading: false,
    hasMore: true,
  };

  componentDidMount() {
    this.getData();
  }

  async getData() {
    const { items } = this.state;
    const pageSize = 10;
    try {
      this.setState({ loading: true });
      const resp = await payoutRequestService.search({
        limit: pageSize,
        offset: items.length,
      });

      this.setState({
        loading: false,
        items: [...items, ...resp.data.data],
        hasMore: items.length + resp.data.data.length < resp.data.total,
      });
    } catch (error) {
      message.error(getResponseError(await error) || 'An error occured. Please try again.');
      this.setState({ loading: false });
    }
  }

  render() {
    const { hasMore, items, loading } = this.state;

    return (
      <>
        <Head>
          <title>Payout Requests</title>
        </Head>
        <div className="lg:w-5/6 md:pl-6 pl-4">
          <InfiniteScroll
          
            dataLength={items.length}
            next={() => this.getData()}
            hasMore={hasMore}
            loader={<div>Loading...</div>}
          >
            <div>
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <div>
                      <span className='text-trax-white'>
                        {formatDateNoTime(item.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-trax-white">
                    - ${item?.amount?.toFixed(2) || 0}
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
          
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui
});
export default connect(mapStateToProps)(PayoutRequest);
