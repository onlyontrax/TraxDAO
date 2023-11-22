import { connect } from 'react-redux';
import { PureComponent } from 'react';
import { message, Layout } from 'antd';
import Head from 'next/head';
import { UserAddOutlined } from '@ant-design/icons';
import PageHeading from '@components/common/page-heading';
import { TableListSubscription } from '@components/subscription/user-table-list-subscription';
import { ISubscription, IUIConfig } from 'src/interfaces';
import { subscriptionService } from '@services/subscription.service';
import { getResponseError } from '@lib/utils';
import { SearchFilter } from '@components/common/search-filter';

interface IProps {
  ui: IUIConfig;
}
interface IStates {
  subscriptionList: ISubscription[];
  loading: boolean;
  pagination: {
    pageSize: number;
    current: number;
    total: number;
  };
  sort: string;
  sortBy: string;
  filter: {};
}

class SubscriberPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      subscriptionList: [],
      loading: false,
      pagination: {
        pageSize: 10,
        current: 1,
        total: 0
      },
      sort: 'desc',
      sortBy: 'updatedAt',
      filter: {}
    };
  }

  componentDidMount() {
    this.getData();
  }

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.getData();
  }

  async handleTabChange(data) {
    const { pagination } = this.state;
    await this.setState({
      pagination: { ...pagination, current: data.current }
    });
    this.getData();
  }

  async getData() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      this.setState({ loading: true });
      const resp = await subscriptionService.search({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      this.setState({
        subscriptionList: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (error) {
      message.error(
        getResponseError(await error) || 'An error occured. Please try again.'
      );
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { subscriptionList, pagination, loading } = this.state;
    const { ui } = this.props;
    const statuses = [
      {
        key: '',
        text: 'All Statuses'
      },
      {
        key: 'active',
        text: 'Active'
      },
      {
        key: 'deactivated',
        text: 'Inactive'
      }
    ];
    const types = [
      {
        key: '',
        text: 'All Types'
      },
      {
        key: 'free',
        text: 'Free Subscription'
      },
      {
        key: 'monthly',
        text: 'Monthly Subscription'
      },
      {
        key: 'yearly',
        text: 'Yearly Subscription'
      }
    ];
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | My Subscribers`}</title>
        </Head>
        <div className="main-container">
          <PageHeading title="My Subscribers" icon={<UserAddOutlined />} />
          <SearchFilter
            subscriptionTypes={types}
            statuses={statuses}
            dateRange
            onSubmit={this.handleFilter.bind(this)}
          />
          <div className="table-responsive">
            <TableListSubscription
              dataSource={subscriptionList}
              pagination={pagination}
              loading={loading}
              onChange={this.handleTabChange.bind(this)}
              rowKey="_id"
            />
          </div>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({ ui: state.ui });
const mapDispatch = {};
export default connect(mapState, mapDispatch)(SubscriberPage);
