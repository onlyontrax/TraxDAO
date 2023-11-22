import { SearchFilter } from '@components/common/search-filter';
import { ReferralsTableList } from '@components/user/referrals-table';
import { getResponseError } from '@lib/utils';
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ITransaction, IUIConfig } from 'src/interfaces';
import { earningService } from 'src/services';

interface IProps {
  ui: IUIConfig;
}
interface IStates {
  loading: boolean;
  paymentList: ITransaction[];
  pagination: {
    total: number;
    pageSize: number;
    current: number;
  };
  sortBy: string;
  sort: string;
  filter: {};
}

class ReferralEarningsPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  state = {
    loading: true,
    paymentList: [],
    pagination: {
      total: 0,
      pageSize: 10,
      current: 1
    },
    sortBy: 'createdAt',
    sort: 'desc',
    filter: {}
  };

  componentDidMount() {
    this.userSearchEarnings();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    await this.setState({
      pagination: { ...paginationVal, current: pagination.current },
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.userSearchEarnings();
  };

  handleFilter(values) {
    const { filter } = this.state;
    this.setState({ filter: { ...filter, ...values } }, () => this.userSearchEarnings());
  }

  async userSearchEarnings() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      await this.setState({ loading: true });
      const resp = await earningService.userSearch({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      this.setState({
        loading: false,
        paymentList: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (error) {
      message.error(getResponseError(await error));
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, paymentList, pagination } = this.state;
    const { ui } = this.props;
    const type = [
      {
        key: '',
        text: 'All types'
      },
      {
        key: 'feed',
        text: 'Post'
      },
      {
        key: 'product',
        text: 'Product'
      },
      {
        key: 'gallery',
        text: 'Gallery'
      },
      {
        key: 'video',
        text: 'Video'
      },
      {
        key: 'tip',
        text: 'Artist Tip'
      },
      {
        key: 'stream_tip',
        text: 'Streaming Tip'
      },
      {
        key: 'public_chat',
        text: 'Paid Streaming'
      }
    ];
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Artist Referral Earnings`}</title>
        </Head>
        <div className="main-container">
          {/* <PageHeading title="Wallet Transactions" icon={<HistoryOutlined />} /> */}
          <SearchFilter type={type} onSubmit={this.handleFilter.bind(this)} dateRange />
          <ReferralsTableList
            dataSource={paymentList}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
            rowKey="_id"
            loading={loading}
          />
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(ReferralEarningsPage);
