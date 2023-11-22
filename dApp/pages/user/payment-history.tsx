/* eslint-disable no-param-reassign */
import { SearchFilter } from '@components/common/search-filter';
import PaymentTableList from '@components/payment/table-list';
import { getResponseError } from '@lib/utils';
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';
import { paymentService } from 'src/services';

interface IProps {
  ui: IUIConfig;
}

class PaymentHistoryPage extends PureComponent<IProps> {
  state = {
    loading: true,
    paymentList: [],
    pagination: {
      total: 0,
      pageSize: 10,
      current: 1
    },
    sortBy: 'updatedAt',
    sort: 'desc',
    filter: {},
    stage: 1
  };

  componentDidMount() {
    this.userSearchTransactions();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    await this.setState({
      pagination: { ...paginationVal, current: pagination.current },
      sortBy: sorter.field || 'updatedAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.userSearchTransactions();
  };

  async handleFilter(filter) {
    const { filter: values } = this.state;
    await this.setState({ filter: { ...values, ...filter } });
    this.userSearchTransactions();
  }

  async userSearchTransactions() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      const resp = await paymentService.userSearch({
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
    const statuses = [
      {
        key: '',
        text: 'All Statuses'
      },
      {
        key: 'created',
        text: 'Created'
      },
      {
        key: 'processing',
        text: 'Processing'
      },
      {
        key: 'require_authentication',
        text: 'Require authentication'
      },
      {
        key: 'fail',
        text: 'Fail'
      },
      {
        key: 'success',
        text: 'Success'
      },
      {
        key: 'canceled',
        text: 'Cancelled'
      }
    ];
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Payment History`}</title>
        </Head>

        <div className="main-container">
          <SearchFilter statuses={statuses} onSubmit={this.handleFilter.bind(this)} searchWithPerformer dateRange />
          <PaymentTableList
            dataSource={paymentList}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
            loading={loading}
            rowKey="_id"
          />
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(PaymentHistoryPage);
