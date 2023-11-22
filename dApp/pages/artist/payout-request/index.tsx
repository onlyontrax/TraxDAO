import { getResponseError } from '@lib/utils';
import { payoutRequestService } from '@services/index';
import { Button, message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PayoutRequestList from 'src/components/payout-request/table';

interface IProps {}

class PerformerPayoutRequestPage extends PureComponent<IProps> {
  static onlyPerformer = true;

  state = {
    items: [],
    loading: false,
    pagination: {
      pageSize: 10,
      current: 1,
      total: 0
    } as any,
    sort: 'desc',
    sortBy: 'updatedAt',
    filter: {}
  };

  componentDidMount() {
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
      await this.setState({ loading: true });
      const resp = await payoutRequestService.search({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      await this.setState({
        loading: false,
        items: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (error) {
      message.error(getResponseError(await error) || 'An error occured. Please try again.');
      this.setState({ loading: false });
    }
  }

  render() {
    const { pagination, items, loading } = this.state;

    return (
      <>
        <Head>
          <title>Payout Requests</title>
        </Head>
        <div className="main-container-table">
          <div className="table-responsive">
            <PayoutRequestList
              payouts={items}
              searching={loading}
              total={pagination.total}
              onChange={this.handleTabChange.bind(this)}
              pageSize={pagination.pageSize}
            />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui
});
export default connect(mapStateToProps)(PerformerPayoutRequestPage);
