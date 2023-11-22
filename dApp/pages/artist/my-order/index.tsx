import { connect } from 'react-redux';
import { OrderSearchFilter } from '@components/order';
import { OrderTableList } from '@components/order/table-list';
import { orderService } from '@services/index';
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';

import { IUIConfig, IUser } from 'src/interfaces';

interface IProps {
  user: IUser;
  ui: IUIConfig;
}

class ArtistOrderPage extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  async componentDidMount() {
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationState } = this.state;
    const pager = { ...paginationState };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    try {
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      await this.setState({ searching: true });
      const resp = await orderService.performerSearch({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const { ui, user } = this.props;

    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | My Orders`}</title>
        </Head>
        <div className="main-container-table">
          <OrderTableList
            user={user}
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
          />
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui,
  user: state.user.current
});
export default connect(mapStates)(ArtistOrderPage);
