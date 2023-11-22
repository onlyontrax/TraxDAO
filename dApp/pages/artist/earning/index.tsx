/* eslint-disable react/no-unused-prop-types */
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { TableListEarning } from '@components/performer/table-earning';
import { getResponseError } from '@lib/utils';
import { SearchFilter } from 'src/components/common/search-filter';
import {
  IEarning, IPerformer, IPerformerStats, IUIConfig
} from 'src/interfaces';
import { earningService } from 'src/services';
import styles from './index.module.scss';

interface IProps {
  performer: IPerformer;
  ui: IUIConfig;
  onGetStats: Function;
}
interface IStates {
  loading: boolean;
  earning: IEarning[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
  stats: IPerformerStats;
  sortBy: string;
  sort: string;
  type: string;
  dateRange: any;
}

const initialState = {
  loading: true,
  earning: [],
  pagination: { total: 0, current: 1, pageSize: 10 },
  stats: {
    totalGrossPrice: 0,
    totalSiteCommission: 0,
    totalNetPrice: 0,
    totalGrossPriceICP: 0,
    totalSiteCommissionICP: 0,
    totalNetPriceICP: 0,
    totalReferralCommission: 0,
    totalAgentCommission: 0
  },
  sortBy: 'createdAt',
  sort: 'desc',
  type: '',
  dateRange: null
};

class EarningPage extends PureComponent<IProps, IStates> {
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
    const { dateRange } = this.state;
    await this.setState({
      type: data.type,
      dateRange: {
        ...dateRange,
        fromDate: data.fromDate,
        toDate: data.toDate
      }
    });
    this.getData();
    this.getPerformerStats();
  }

  async handleTabsChange(data) {
    const { pagination } = this.state;
    await this.setState({
      pagination: { ...pagination, current: data.current }
    });
    this.getData();
  }

  async getData() {
    const {
      pagination, sort, sortBy, type, dateRange
    } = this.state;
    try {
      const { current, pageSize } = pagination;
      const earning = await earningService.performerSearch({
        limit: pageSize,
        offset: (current - 1) * pageSize,
        sort,
        sortBy,
        type,
        ...dateRange
      });
      this.setState({
        earning: earning.data.data,
        pagination: { ...pagination, total: earning.data.total },
        loading: false
      });
    } catch (error) {
      message.error(getResponseError(await error));
      this.setState({ loading: false });
    }
  }

  async getPerformerStats() {
    const { dateRange, type } = this.state;
    const { onGetStats } = this.props;
    const resp = await earningService.performerStarts({
      type,
      ...dateRange
    });
    resp.data && this.setState({ stats: resp.data });
    resp.data && onGetStats(resp.data);
  }

  render() {
    const { loading, earning, pagination } = this.state;

    const { ui } = this.props;
    return (
      <Layout className={styles.pagesEarningModule}>
        <Head>
          <title>{`${ui?.siteName} | Earnings`}</title>
        </Head>

        <div className="main-container-table">
          <div className="table-responsive">
            <TableListEarning
              dataSource={earning}
              rowKey="_id"
              pagination={pagination}
              loading={loading}
              onChange={this.handleTabsChange.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui },
  performer: { ...state.user.current }
});
export default connect(mapStates)(EarningPage);
