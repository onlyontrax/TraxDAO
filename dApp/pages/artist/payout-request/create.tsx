import PayoutRequestForm from '@components/payout-request/form';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import React from 'react';
import { connect } from 'react-redux';
import { ISettings, IUIConfig, IUser } from 'src/interfaces/index';
import { payoutRequestService } from 'src/services';

interface Props {
  ui: IUIConfig;
  user: IUser;
  settings: ISettings;
}

interface States {
  submiting: boolean;
  statsPayout: {
    totalEarnedTokens: number;
    previousPaidOutTokens: number;
    remainingUnpaidTokens: number;
  };
}

class PayoutRequestCreatePage extends React.PureComponent<Props, States> {
  static authenticate = true;

  static onlyPerformer = true;

  constructor(props: Props) {
    super(props);
    this.state = {
      submiting: false,
      statsPayout: {
        totalEarnedTokens: 0,
        previousPaidOutTokens: 0,
        remainingUnpaidTokens: 0
      }
    };
  }

  componentDidMount() {
    this.calculateStatsPayout();
  }

  calculateStatsPayout = async () => {
    const resp = await payoutRequestService.calculate();
    resp?.data && this.setState({ statsPayout: resp.data });
  };

  async submit(data) {
    const { user } = this.props;
    if (data.requestTokens > user.balance) {
      message.error('Requested amount must be less than or equal your wallet balance');
      return;
    }
    try {
      await this.setState({ submiting: true });
      const body = { ...data, source: 'performer' };
      await payoutRequestService.create(body);
      message.success('Your payout request was sent!');
      Router.push('/artist/payout-request');
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message || 'Error occured, please try again later');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting, statsPayout } = this.state;
    const { ui, settings } = this.props;
    return (
      <>
        <Head>
          <title>{`${ui?.siteName} | New Payout Request`}</title>
        </Head>
        <div className="main-container">
          <PayoutRequestForm
            payout={{
              requestNote: '',
              requestTokens: 1,
              status: 'pending'
            }}
            statsPayout={statsPayout}
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

export default connect(mapStateToProps)(PayoutRequestCreatePage);
