import { getResponseError } from '@lib/utils';
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ITransaction, IUIConfig } from 'src/interfaces';
import { tokenTransctionService, paymentService, earningService } from 'src/services';
import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';

interface IProps {
  ui: IUIConfig;
}
interface IStates {
  loading: boolean;
  paymentList: ITransaction[];
  referralList: ITransaction[];
  paymentOffset: number,
  referralOffset: number,
  hasMorePayment: boolean,
  hasMoreReferral: boolean,
  sortBy: string;
  sort: string;
  filter: {};
  limit: number;
}

class ActivityHistoryPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  state = {
    loading: true,
    paymentList: [],
    referralList: [],
    paymentOffset: 0,
    referralOffset: 0,
    hasMorePayment: true,
    hasMoreReferral: true,
    sortBy: 'createdAt',
    sort: 'desc',
    filter: {},
    limit: 10
  };

  componentDidMount() {
    this.loadMoreTransactions();
    this.loadMoreEarnings();
  }

  async loadMoreTransactions() {
    const { filter, sort, sortBy, paymentOffset, limit, paymentList } = this.state;

    try {
      this.setState({ loading: true });
      const [tokenResp, paymentResp] = await Promise.all([
        tokenTransctionService.userSearch({ ...filter, sort, sortBy, limit, offset: paymentOffset }),
        paymentService.userSearch({ ...filter, sort, sortBy, limit, offset: paymentOffset })
      ]);

      const newTransactions = [
        ...tokenResp.data.data,
        ...paymentResp.data.data.filter((payment) =>
          ['monthly_subscription', 'yearly_subscription', 'free_subscription'].includes(payment.type))
      ];
      const totalTransactions = Math.max(tokenResp.data.total, paymentResp.data.total);

      this.setState({
        loading: false,
        paymentList: [...paymentList, ...newTransactions],
        paymentOffset: paymentOffset + limit,
        hasMorePayment: paymentOffset + limit < totalTransactions,
      });
    } catch (error) {
      message.error(getResponseError(await error));
      this.setState({ loading: false });
    }
  };

  async loadMoreEarnings() {
    const { filter, sort, sortBy, referralOffset, limit, referralList } = this.state;

    try {
      this.setState({ loading: true });
      const resp = await earningService.userSearch({
        ...filter,
        sort,
        sortBy,
        limit,
        offset: referralOffset
      });

      this.setState((prevState) => ({
        loading: false,
        referralList: [...prevState.referralList, ...resp.data.data],
        referralOffset: prevState.referralOffset + limit,
        hasMoreReferral: prevState.referralOffset + limit < resp.data.total,
      }));
    } catch (error) {
      message.error(getResponseError(await error));
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, paymentList, referralList, hasMorePayment, hasMoreReferral } = this.state;
    const { ui } = this.props;

    const paymentType = (type) => {
      switch (type) {
        case 'video':
          return <span className="text-trax-gray-500">You purchased a new video</span>;
        case 'tip':
          return <span className="text-trax-gray-500">You sent a tip</span>;
        case 'token_package':
          return <span className="text-trax-gray-500">You purchased a credit</span>;
        case 'monthly_subscription':
          return <span className="text-trax-gray-500">Monthly subscription</span>;
        case 'yearly_subscription':
          return <span className="text-trax-gray-500">Yearly subscription</span>;
        case 'free_subscription':
          return <span className="text-trax-gray-500">Free subscription</span>;
        case 'referral':
          return <span className="text-trax-gray-500">You earned via a referral</span>;
        default:
          return <span className="text-trax-gray-500">{type}</span>;
      }
    };

    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Activity History`}</title>
        </Head>
        <div className="lg:w-5/6 md:pl-6 pl-4">
          <InfiniteScroll
            dataLength={paymentList.length + referralList.length}
            next={() => {
              this.loadMoreTransactions();
              this.loadMoreEarnings();
            }}
            hasMore={hasMorePayment || hasMoreReferral}
            loader={<div>Loading...</div>}
          >
            <div>
              {paymentList.map((transaction) => (
                <div key={transaction._id} style={{maxWidth: '50rem'}} className="flex justify-between items-center p-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <Link href={`/${transaction.performerInfo?.username}`}>
                      <img
                        className="w-9 h-9 rounded-full"
                        src={transaction.performerInfo?.avatar || '/static/no-avatar.png'}
                        alt="avatar"
                      />
                    </Link>
                    <div>
                      <Link href={`/${transaction.performerInfo?.username}`}>
                        <span className='text-trax-white hover:text-trax-lime-500'>
                          {transaction.performerInfo?.name || transaction.performerInfo?.username || 'N/A'}
                        </span>
                      </Link>
                      <div>{paymentType(transaction.type)}</div>
                    </div>
                  </div>
                  <div className="text-trax-white">
                    - {transaction.isCrypto ? `${transaction.tokenSymbol} ` : '$'}
                    {transaction.originalPrice.toFixed(2)}
                  </div>
                </div>
              ))}

              {referralList.map((earning) => (
                <div key={earning._id} style={{maxWidth: '50rem'}} className="flex justify-between items-center p-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <Link href={`/${earning.performerInfo?.username}`}>
                      <img
                        className="w-9 h-9 rounded-full"
                        src={earning.performerInfo?.avatar || '/static/no-avatar.png'}
                        alt="avatar"
                      />
                    </Link>
                    <div>
                      <Link href={`/${earning.performerInfo?.username}`}>
                        <span className="text-trax-white cursor-pointer hover:text-trax-lime-500">
                          {earning.performerInfo?.name || earning.performerInfo?.username || 'N/A'}
                        </span>
                      </Link>
                      <div>{paymentType(earning.sourceType)}</div>
                    </div>
                  </div>
                  <div className="text-trax-white">
                    + {earning.isCrypto ? `${earning.tokenSymbol} ` : '$'}
                    {earning.netPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
          {(paymentList.length === 0 && referralList.length === 0 && !loading) && (
            <div style={{maxWidth: '50rem'}} className="text-center text-trax-gray-500 mt-4">No activities found.</div>
          )}
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(ActivityHistoryPage);
