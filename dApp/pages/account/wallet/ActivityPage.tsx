/* eslint-disable react/no-unused-prop-types */
import { Layout, message, Tag } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getResponseError } from '@lib/utils';
import {
  IEarning, IPerformer, IPerformerStats, IUIConfig, ISubscription, ITransaction,
  IAccount
} from 'src/interfaces';
import { earningService, payoutRequestService, subscriptionService, tokenTransctionService, paymentService } from 'src/services';
import InfiniteScroll from 'react-infinite-scroll-component';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@lib/date';

interface IProps {
  user: IPerformer;
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
    this.getAccountStats();
  }

  async handleFilter(data) {
    await this.setState({
      type: data.type,
      currentOffset: 0,
      hasMore: true,
      transactions: [],
    });
    this.getData();
    this.getAccountStats();
  }

  async getData() {
    const {
      currentOffset, sort, sortBy, type, transactions
    } = this.state;
    const { user } = this.props;
    const pageSize = 10;

    try {
      this.setState({ loading: true });
      const [earningResp, subscriberResp, payoutRequestResp, tokenPackageResp] = await Promise.all([
        earningService.accountSearch({
          limit: pageSize,
          offset: currentOffset,
          sort,
          sortBy,
          type,
        }),
        user?.account?.performerId ? subscriptionService.search({
          limit: pageSize,
          offset: currentOffset,
          sort,
          sortBy,
          type,
        }) : { data: { data: [] } },
        payoutRequestService.search({
          limit: pageSize,
          offset: currentOffset,
          sort,
          sortBy,
        }),
        paymentService.userSearch({ sort, sortBy, limit: pageSize, offset: currentOffset, type: 'token_package' })
        //tokenTransctionService.userSearch({ sort, sortBy, limit: pageSize, offset: currentOffset }),// change earnings to this later
      ]);

      const formattedEarnings = earningResp?.data?.data?.map(e => ({ ...e, activityType: 'earning' }));
      const formattedSubscribers = subscriberResp?.data?.data?.filter(subscriber => ['monthly', 'yearly', 'free'].includes(subscriber.subscriptionType))
        .map(s => ({ ...s, activityType: 'subscription' }));
      const formattedPayouts = payoutRequestResp?.data?.data?.map(p => ({ ...p, activityType: 'payout' }));
      const formattedtokenPackages = tokenPackageResp?.data?.data?.map(p => ({ ...p, activityType: 'tokenPackage' }));

      const newTransactions = [...formattedEarnings, ...formattedSubscribers, ...formattedPayouts, ...formattedtokenPackages];

      // Get the total number of transactions
      const totalTransactions = Math.max(earningResp?.data?.total, subscriberResp?.data?.total, payoutRequestResp?.data?.total, tokenPackageResp?.data?.total);

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

  async getAccountStats() {
    const { type } = this.state;
    const { onGetStats } = this.props;
    const resp = await earningService.accountStats({
      type,
    });
    resp.data && this.setState({ stats: resp.data });
    resp.data && onGetStats(resp.data);
  }

  sortedItems = (uniqueItems) => uniqueItems.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  loadMoreEarnings = () => {
    this.getData();
  };

  getNameFromAccount(account: IAccount) {
    if (!account) return '';
    if (account?.performerId) {
      return account?.performerInfo?.name || account?.performerInfo?.userName || 'N/A';
    }
    return account?.userInfo?.name || account?.userInfo?.userName || 'N/A';
  }

  referralType = (type) => {
    switch (type) {
      case 'feed':
        return <span color="blue">Post</span>;
      case 'video':
        return <span color="pink">Video</span>;
      case 'product':
        return <span color="orange">Product</span>;
      case 'gallery':
        return <span color="violet">Gallery</span>;
      case 'message':
        return <span color="red">Message</span>;
      case 'tip':
        return <span color="red">Artist Tip</span>;
      case 'stream_tip':
        return <span color="red">Streaming Tip</span>;
      case 'public_chat':
        return <span color="pink">Paid Streaming</span>;
      default: return <span color="default">{type}</span>;
    }
  };

  render() {
    const { loading, transactions, hasMore, stats } = this.state;
    const { ui } = this.props;

   

    const paymentType = (type, item) => {
      if (item.activityType === 'payout') {
        return <span className="text-trax-gray-500">Payout request (status: {item.status})</span>;
      }
      if (item.activityType === 'tokenPackage') {
        return <span className="text-trax-gray-500">Purchased a {item?.products[0]?.tokens} token package (status: {item.status})</span>;
      }
      switch (type) {
        case 'monthly':
          return <span className="text-trax-gray-500">Monthly subscription</span>;
        case 'monthly_subscription':
          return <span className="text-trax-gray-500">Monthly subscription</span>;
        case 'yearly':
          return <span className="text-trax-gray-500">Yearly subscription</span>;
        case 'yearly_subscription':
          return <span className="text-trax-gray-500">Yearly subscription</span>;
        case 'free_subscription':
          return <span className="text-trax-gray-500">Free subscription</span>;
        case 'free':
          return <span className="text-trax-gray-500">Free subscription</span>;
        case 'tip':
          return (
            <span className="text-trax-gray-500">
              You {parseFloat(item.netPrice) < 0 ? 'sent' : 'recieved'} a tip {parseFloat(item.netPrice) < 0 ? `to ${this.getNameFromAccount(item?.accountReceiverInfo) || 'N/A'}` : `from ${this.getNameFromAccount(item?.accountSenderInfo) || 'N/A'}`}
            </span>
          );
        case 'video':
          return <span className="text-trax-gray-500">Purchased {parseFloat(item.netPrice) < 0 ? 'a' : 'your'} video {parseFloat(item.netPrice) < 0 ? `from ${this.getNameFromAccount(item?.accountReceiverInfo) || 'N/A'}` : ``}</span>;
        case 'referral':
          return <span className="text-trax-gray-500"><span>You earned via a referral {parseFloat(item.netPrice) < 0 ? `` : `from ${this.getNameFromAccount(item?.accountSenderInfo) || 'N/A'}`}</span><span> ({this.referralType(item.type)})</span></span>;
      }
      return <span>{type}</span>;
    };
    const renderTransaction = (transaction, index) => {
      const { user } = this.props;
      console.log(transaction.isCrypto);
      const type = transaction.sourceType === 'referral' ? 'referral' : transaction.subscriptionType || transaction.type;
      let userInfo = transaction?.performerInfo || transaction?.userInfo;
      if (transaction.activityType === 'payout' || transaction.activityType === 'tokenPackage') {
        userInfo = user;// transaction?.sourceInfo?.performerInfo || transaction?.sourceInfo?.userInfo;
      }

      return userInfo && (
        <motion.div
          key={transaction._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.06,
            ease: "easeOut"
          }}
          className="flex justify-between items-center py-2 px-4 text-sm bg-[#1F1F1FB2] rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <img
              className="w-12 h-12 rounded-full"
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

          <div className='flex flex-col justify-end'>
            {transaction.activityType === 'earning' && transaction.grossPrice && (
              <div className="flex justify-end text-custom-green">
                {transaction.isCrypto ? `${transaction.tokenSymbol} ` : '$'}
                {transaction?.grossPrice?.toFixed(2)}
              </div>
            )}
            {transaction.activityType === 'subscription' && transaction.netPrice && (
              <div className="flex justify-end text-custom-green">
                {transaction.isCrypto ? `${transaction.tokenSymbol} ` : '$'}
                {transaction?.netPrice?.toFixed(2)}
              </div>
            )}
            {transaction.activityType === 'payout' && transaction.requestTokens && (
              <div className="flex justify-end text-custom-green">
                {transaction?.requestTokens?.toFixed(2)}
              </div>
            )}
            {transaction.activityType === 'tokenPackage' && transaction.originalPrice && (
              <div className="flex justify-end text-custom-green">
                {transaction?.originalPrice?.toFixed(2)}
              </div>
            )}
            <div className='flex text-trax-gray-500'>
              {formatDate(transaction.createdAt)}
            </div>
          </div>
        </motion.div>
      );
    };


    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Earnings`}</title>
        </Head>

        <div className="">
          <InfiniteScroll
            dataLength={transactions.length}
            next={() => this.loadMoreEarnings()}
            hasMore={hasMore}
            loader={<div>Loading...</div>}
          >
            <div className='flex flex-col gap-2 '>
            {transactions.map((transaction, index ) => renderTransaction(transaction, index))}
            </div>
          </InfiniteScroll>
          {(transactions.length === 0 && !loading) && (
            <div  className="text-center text-trax-gray-500 mt-4">No earnings found.</div>
          )}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});
export default connect(mapStates)(ActivityPage);
