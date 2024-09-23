import React from 'react';
import Head from 'next/head';
import PayoutRequestForm from '@components/payout-request/form';
import { message, Spin } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';
import PageHeading from '@components/common/page-heading';
import { authService, payoutRequestService } from 'src/services';
import {
  ISettings, IUIConfig, PayoutRequestInterface, IUser
} from 'src/interfaces';
import nextCookie from 'next-cookies';
import Router from 'next/router';
import { connect } from 'react-redux';

interface Props {
  payout: PayoutRequestInterface;
  ui: IUIConfig;
  settings: ISettings;
  user: IUser;
}

interface States {
  submiting: boolean;
  statsPayout: {
    totalEarnedTokens: number;
    previousPaidOutTokens: number;
    remainingUnpaidTokens: number;
  };
  payout: PayoutRequestInterface;
}

class PayoutRequestUpdatePage extends React.PureComponent<Props, States> {
  static authenticate = true;

  static onlyPerformer = true;
  state = {
    submiting: false,
    statsPayout: {
      totalEarnedTokens: 0,
      previousPaidOutTokens: 0,
      remainingUnpaidTokens: 0
    },
    payout: null
  };

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    const data = url.searchParams.get('data');
    try {
      if (process.browser && data) {
        return {
          payout: JSON.parse(data)
        };
      }

      const resp = await payoutRequestService.detail(id, {
        Authorization: authService.getToken() || ''
      });
      return {
        payout: resp.data
      };
    } catch (e) {
      return {
        payout: null
      };
    }
  }

  constructor(props: Props) {
    super(props);
  }

  async componentDidMount() {
    const { payout } = this.state;
    if (payout === null) {
      const data = await this.getData();

      this.setState({ payout: data.payout }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {
    const { payout } = this.state;
    if (!payout) {
      message.error('Could not find payout request');
      Router.back();
    }
    this.calculateStatsPayout();
  }

  calculateStatsPayout = async () => {
    try {
      const resp = await payoutRequestService.calculate();
      this.setState({ statsPayout: resp.data });
    } catch {
      message.error('Something went wrong. Please try to input date again!');
    }
  };

  async submit(data: {
    paymentAccountType: string;
    requestNote: string;
    requestTokens: number;
  }) {
    const { user } = this.props;
    const { payout } = this.state;
    if (['done', 'approved', 'rejected'].includes(payout.status)) {
      message.error('Please recheck request payout status');
      return;
    }
    if (data.requestTokens > user.balance) {
      message.error('Requested amount must be less than or equal your wallet balance');
      return;
    }
    try {
      await this.setState({ submiting: true });
      const body = {
        paymentAccountType: data.paymentAccountType,
        requestTokens: data.requestTokens,
        requestNote: data.requestNote,
        source: 'performer'
      };
      await payoutRequestService.update(payout._id, body);
      message.success('Changes saved!');
      Router.push('/artist/payout-request');
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message || 'Error occured, please try again later');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { ui, settings } = this.props;
    const { submiting, statsPayout, payout } = this.state;

    if (payout === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    return (
      <>
        <Head>
          <title>{`${ui?.siteName} | Edit Payout Request`}</title>
        </Head>
        <div className="main-container">
          <PageHeading title="Edit Payout Request" icon={<NotificationOutlined />} />
          <PayoutRequestForm
            statsPayout={statsPayout}
            payout={payout}
            submit={this.submit.bind(this)}
            submiting={submiting}
            settings={settings}
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
  user: state.user.current,
  settings: state.settings
});

export default connect(mapStateToProps)(PayoutRequestUpdatePage);
