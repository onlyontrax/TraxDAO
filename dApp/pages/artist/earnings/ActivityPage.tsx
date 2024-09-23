/* eslint-disable react/no-unused-prop-types */
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getResponseError } from '@lib/utils';
import {
  IEarning, IPerformer, IPerformerStats, IUIConfig, ISubscription, ITransaction
} from 'src/interfaces';
import { earningService, subscriptionService } from 'src/services';
import InfiniteScroll from 'react-infinite-scroll-component';

interface IProps {
  performer: IPerformer;
  ui: IUIConfig;
  onGetStats: Function;
}
interface IStates {
  loading: boolean;
  transactions: (IEarning | ISubscription | ITransaction)[];
  hasMore: boolean;
  currentOffset: number;
  stats: IPerformerStats;
  sortBy: string;
  sort: string;
  type: string;
}

const initialState = {
  loading: true,
  transactions: [],
  hasMore: true,
  currentOffset: 0,
  stats: {
    totalGrossPrice: 0,
    totalSiteCommission: 0,
    totalNetPrice: 0,
    totalGrossPriceICP: 0,
    totalGrossPriceTRAX: 0,
    totalGrossPriceCKBTC: 0,
    totalSiteCommissionICP: 0,
    totalSiteCommissionTRAX: 0,
    totalSiteCommissionCKBTC: 0,
    totalNetPriceICP: 0,
    totalNetPriceTRAX: 0,
    totalNetPriceCKBTC: 0,
    totalReferralCommission: 0,
    totalAgentCommission: 0
  },
  sortBy: 'createdAt',
  sort: 'desc',
  type: '',
};

class ActivityPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  constructor(props: IProps) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.getData();
    this.getPerformerStats();
  }

  async handleFilter(data) {
    await this.setState({
      type: data.type,
      currentOffset: 0,
      hasMore: true,
      transactions: [],
    });
    this.getData();
    this.getPerformerStats();
  }

  async getData() {
    const {
      currentOffset, sort, sortBy, type, transactions
    } = this.state;
    const pageSize = 10;
    try {
      this.setState({ loading: true });
      const [earningResp, subscriberResp, referralResp] = await Promise.all([
        earningService.performerSearch({
          limit: pageSize,
          offset: currentOffset,
          sort,
          sortBy,
          type,
        }),
        subscriptionService.search({
          limit: pageSize,
          offset: currentOffset,
          sort,
          sortBy,
          type,
        }),
        earningService.performerReferralSearch({
          limit: pageSize,
          offset: currentOffset,
          sort,
          sortBy,
          type,
        }),
      ]);

      const newTransactions = [
        ...earningResp.data.data,
        ...subscriberResp.data.data.filter((subscriber) =>
          ['monthly', 'yearly', 'free'].includes(subscriber.subscriptionType)),
        ...referralResp.data.data,
      ];

      const totalTransactions = Math.max(earningResp.data.total, subscriberResp.data.total);

      this.setState({
        loading: false,
        transactions: [...transactions, ...newTransactions],
        currentOffset: currentOffset + pageSize,
        hasMore: currentOffset + pageSize < totalTransactions,
      });
    } catch (error) {
      message.error(getResponseError(await error));
      this.setState({ loading: false });
    }
  }

  async getPerformerStats() {
    const { type } = this.state;
    const { onGetStats } = this.props;
    const resp = await earningService.performerStarts({
      type,
    });
    resp.data && this.setState({ stats: resp.data });
    resp.data && onGetStats(resp.data);
  }

  loadMoreEarnings = () => {
    this.getData();
  };

  render() {
    const { loading, transactions, hasMore, stats } = this.state;
    const { ui } = this.props;



    const paymentType = (type, item) => {
      switch (type) {
        case 'monthly':
          return <span className="text-trax-gray-500">Monthly subscription</span>;
        case 'yearly':
          return <span className="text-trax-gray-500">Yearly subscription</span>;
        case 'free':
          return <span className="text-trax-gray-500">Free subscription</span>;
        case 'tip':
          return (
            <span className="text-trax-gray-500">
              {item.isCrypto ? 'Crypto' : ''}
              {' '}
              You received a tip
              {' '}
            </span>
          );
        case 'video':
          return <span className="text-trax-gray-500">Purchased your video</span>;
        case 'referral':
          return <span className="text-trax-gray-500">You earned via a referral</span>;
      }
      return <span>{type}</span>;
    };

    const renderTransaction = (transaction) => {
      const type = transaction.sourceType === 'referral' ? 'referral' : transaction.subscriptionType || transaction.type;
      const userInfo = transaction.performerInfo || transaction.userInfo;
      return userInfo && (
        <div key={transaction._id} style={{maxWidth: '50rem'}} className="flex justify-between items-center p-2 text-sm">
          <div className="flex items-center space-x-3">
            <img
              className="w-9 h-9 rounded-full"
              src={userInfo?.avatar || '/static/no-avatar.png'}
              alt="avatar"
            />
            <div>
              <span className='text-trax-white'>
                {userInfo?.name || userInfo?.username || 'N/A'}
              </span>
              <div>{paymentType(type, transaction)}</div>
            </div>
          </div>
          {transaction.netPrice && (
            <div className="text-trax-white">
              {transaction.isCrypto ? `${transaction.tokenSymbol} ` : '$'}
              {transaction.netPrice.toFixed(2)}
            </div>
          )}
        </div>
      );
    };

    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Earnings`}</title>
        </Head>

        <div className="lg:w-5/6 md:pl-6 pl-4">
          <InfiniteScroll
            dataLength={transactions.length}
            next={() => this.loadMoreEarnings()}
            hasMore={hasMore}
            loader={<div>Loading...</div>}
          >
            <div>
            {transactions.map((transaction) => renderTransaction(transaction))}
            </div>
          </InfiniteScroll>
          {(transactions.length === 0 && !loading) && (
            <div style={{maxWidth: '50rem'}} className="text-center text-trax-gray-500 mt-4">No earnings found.</div>
          )}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui },
  performer: { ...state.user.current }
});
export default connect(mapStates)(ActivityPage);
