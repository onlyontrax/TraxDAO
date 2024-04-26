import Loader from '@components/common/base/loader';
import ConfirmSubscriptionPerformerForm from '@components/performer/confirm-subscription';
import { TableListSubscription } from '@components/subscription/table-list-subscription';
import { getResponseError } from '@lib/utils';
import { paymentService, subscriptionService } from '@services/index';
import { Layout, Modal, message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ISettings, ISubscription, IUIConfig, IUser
} from 'src/interfaces';
import { Principal } from '@dfinity/principal';
/*import { subscriptions } from '../../../src/smart-contracts/declarations/subscriptions';
import { SubType } from '../../../src/smart-contracts/declarations/subscriptions/subscriptions.did';*/

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
  settings: ISettings;
  user: IUser;
}

class SubscriptionPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    subscriptionList: [],
    loading: false,
    submiting: false,
    pagination: {
      pageSize: 10,
      current: 1,
      total: 0
    },
    sort: 'desc',
    sortBy: 'updatedAt',
    filter: {},
    openSubscriptionModal: false,
    selectedSubscription: null
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
      const resp = await subscriptionService.userSearch({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      await this.setState({
        subscriptionList: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (error) {
      message.error(getResponseError(error) || 'An error occured. Please try again.');
    } finally {
      this.setState({ loading: false });
    }
  }

  async cancelSubscription(subscription: ISubscription) {
    if (!window.confirm('Are you sure you want to cancel this subscription!')) return;
    try {
      await subscriptionService.cancelSubscription(subscription._id, subscription.paymentGateway);
      message.success('Subscription cancelled successfully');
      this.getData();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Error occured, please try again later');
    }
  }

  async activeSubscription(subscription: ISubscription) {
    const { currentUser } = this.props;
    const { performerInfo: performer } = subscription;
    if (currentUser.isPerformer || !performer) return;
    this.setState({ openSubscriptionModal: true, selectedSubscription: subscription });
  }

  async subscribe(currency: string, subType: string) {
    currency === 'USD' ? await this.subscribeFiat(subType) : await this.subscribeFiat(subType); //await this.subscribeCrypto(currency, subType);
  }

  async subscribeFiat(subType: string) {
    const { selectedSubscription } = this.state;
    const { performerInfo: performer } = selectedSubscription;
    const { currentUser, settings } = this.props;
    if (!currentUser._id) {
      message.error('Please log in!');
      Router.push('/login');
      return;
    }
    if (settings.paymentGateway === 'stripe' && !currentUser.stripeCardIds.length) {
      message.error('Please add a payment card');
      Router.push('/user/account');
      return;
    }
    try {
      await this.setState({ submiting: true });
      const resp = await paymentService.subscribePerformer({
        type: subType,
        performerId: performer._id,
        paymentGateway: settings.paymentGateway
      });
      if (resp?.data?.stripeConfirmUrl) {
        window.location.href = resp?.data?.stripeConfirmUrl;
      }
      if (settings.paymentGateway === '-ccbill') {
        window.location.href = resp?.data?.paymentUrl;
      } else {
        this.setState({ openSubscriptionModal: false });
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
      this.setState({ submiting: false, openSubscriptionModal: false });
    }
  }

  /*async subscribeCrypto(currency: string, subType: string) {
    const { selectedSubscription } = this.state;
    const { performerInfo: performer } = selectedSubscription;
    const { currentUser } = this.props;
    if (!currentUser._id) {
      message.error('Please log in!');
      Router.push('/login');
      return;
    }
    try {
      let type: SubType;
      let amount: number;

      if (subType === 'monthly') {
        type = { monthly: null };
        amount = performer?.monthlyPrice;
      } else if (subType === 'yearly') {
        type = { yearly: null };
        amount = performer?.yearlyPrice;
      } else {
        // if subType === free
        type = { monthly: null };
        amount = performer?.monthlyPrice;
      }
      this.setState({ submiting: true });
      await subscriptions.subscribe(
        Principal.fromText(performer?.wallet_icp),
        Principal.fromText(currentUser.wallet_icp),
        amount,
        currency,
        type
      );

      this.setState({ openSubscriptionModal: false });
      message.success(`Payment successfull! You are now a subscriber to ${performer?.username}`);
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
      this.setState({ openSubscriptionModal: false, submiting: false });
    } finally {
      this.setState({ submiting: false });
    }
  }*/

  render() {
    const {
      subscriptionList, pagination, loading, submiting, openSubscriptionModal, selectedSubscription
    } = this.state;
    const { ui, settings, user } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | My Subscriptions`}</title>
        </Head>
        <div className="main-container">
          <div className="table-responsive">
            <TableListSubscription
              dataSource={subscriptionList}
              pagination={pagination}
              loading={loading}
              onChange={this.handleTabChange.bind(this)}
              rowKey="_id"
              cancelSubscription={this.cancelSubscription.bind(this)}
              activeSubscription={this.activeSubscription.bind(this)}
            />
          </div>

          <Modal
            key="subscribe_performer"
            className="subscription-modal"
            width={420}
            centered
            title={null}
            open={openSubscriptionModal}
            footer={null}
            onCancel={() => this.setState({ openSubscriptionModal: false })}
            destroyOnClose
          >
            <ConfirmSubscriptionPerformerForm
              type={selectedSubscription?.subscriptionType || 'monthly'}
              performer={selectedSubscription?.performerInfo}
              submiting={submiting}
              onFinish={this.subscribe.bind(this)}
              user={user}
            />
          </Modal>
          {submiting && (
            <Loader customText="We are processing your payment, please do not reload this page until it's done." />
          )}
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  ui: { ...state.ui },
  currentUser: { ...state.user.current },
  settings: { ...state.settings }
});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(SubscriptionPage);
