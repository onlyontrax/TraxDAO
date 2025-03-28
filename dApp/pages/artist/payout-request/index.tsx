import { getResponseError } from '@lib/utils';
import { payoutRequestService } from '@services/index';
import { message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { formatDateNoTime } from 'src/lib';
import { IUIConfig } from 'src/interfaces';
import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface IProps {
  ui: IUIConfig;
}

interface IPayoutRequest {
  _id: string;
  updatedAt: Date;
  amount: number;
  requestTokens: number;
  status: string;
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
        <div className="">
          <InfiniteScroll

            dataLength={items.length}
            next={() => this.getData()}
            hasMore={hasMore}
            loader={<div>Loading...</div>}
          >
            <div>
              {items.map((item, index) => (
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.06,
                  ease: "easeOut"
                }} key={item._id} className="flex justify-between items-center py-2 px-4 text-sm bg-[#1F1F1FB2] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className='flex flex-col'>
                      <span className='text-trax-white font-heading font-bold text-lg'>
                        {formatDateNoTime(item.updatedAt)}
                      </span>
                      <span className='text-trax-gray-500 '>
                      {item?.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-custom-green">
                    - ${item?.amount?.toFixed(2) || (item?.requestTokens ? item?.requestTokens?.toFixed(2) : 0) || 0}
                  </div>
                </motion.div>
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
