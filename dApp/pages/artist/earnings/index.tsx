/* eslint-disable react/no-unused-prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { Layout, Statistic, Button, Avatar } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer,
  IPerformerStats, ISettings, IUIConfig, IUser
} from 'src/interfaces';
import ActivityPage from './ActivityPage';
import PayoutRequest from '../payout-request';
import Tokens from '../my-tokens';
import Router from 'next/router';
import { ArrowRightCircleIcon, } from '@heroicons/react/24/solid';
interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
  settings: ISettings;
  user: IUser;
  stats: IPerformerStats;
  performer: IPerformer
}

class EarningsPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    stage: 0,
    stats: {
      totalGrossPrice: 0,
      totalSiteCommission: 0,
      totalNetPrice: 0,
      totalGrossPriceICP: 0,
      totalGrossPriceTRAX: 0,
      totalGrossPriceCKBTC: 0,
      totalSiteCommissionICP: 0,
      totalSiteCommissionTRAX: 0,
      totalSiteCommissionCKBTC: 0,
      totalNetPriceICP: 0,
      totalNetPriceTRAX: 0,
      totalNetPriceCKBTC: 0,
      totalReferralCommission: 0,
      totalAgentCommission: 0
    },
    isCopied: false
  };

  getPerformerStats(childStats) {
    this.setState({ stats: childStats });
  }

  changeStage(val: number) {
    this.setState({ stage: val });
  }

  handleCopyClick = () => {
    const { currentUser} = this.props;
    const { protocol, hostname, port } = window.location;
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const referralLink = `${baseUrl}/auth/register?referralCode=${currentUser.userReferral}`;

    const textArea = document.createElement('textarea');
    textArea.value = referralLink;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    this.setState({isCopied: true});
    setTimeout(() => this.setState({isCopied: false}), 3000); // Reset copied status after 2 seconds
  };

  render() {
    const { stage, stats, isCopied } = this.state;
    const { ui, currentUser, performer } = this.props;

    return (
      <Layout className="pl-3">
        <Head>
          <title>{`${ui?.siteName} | My Earnings`}</title>
        </Head>
        <div className="main-container px-2 sm:px-[36px]">
          <div className='earnings-heading-user'>
            {/* <div className='avatar-wrapper-earnings'>
              <Avatar src={currentUser?.avatar || '/static/no-avatar.png'} alt="avatar" />
            </div> */}
            {/* <span className='performer-name-earnings'>{currentUser.name}</span> */}
          </div>
          <Statistic prefix="$" value={(stats?.totalNetPrice || 0) + (stats?.totalNetPriceICP || 0)} precision={2} />
          <div className='wallet-module-buttons'>
            <Button
              className="wallet-module-button hover:bg-trax-lime-600"
              onClick={() => Router.push('/artist/payout-request/create')}
            >
              <ArrowRightCircleIcon className='module-icon' />
              <p className='module-text'>
                Withdraw
              </p>
            </Button>
          </div>

          <div className='stats-earning-wrapper'>
          <div className="stats-earning-referral">
            <h2 className="stats-earning-referral-h1">
              Refer a friend, earn 5%
            </h2>
            <h2 className="stats-earning-referral-h2">
              Invite artists to join trax.so and earn commission on their earnings. 5% for the first year, 1% lifetime.
            </h2>
            <Button
              className="rounded-full bg-trax-lime-500 w-fit h-fit border-none px-6 py-2"
              onClick={this.handleCopyClick}
            >
              {isCopied ? 'Link Copied!' : 'Invite friends'}
            </Button>
          </div>
          {/* <div className="stats-earning-referral">
            <h2 className="stats-earning-referral-h1">
              Refer a friend, earn 5%
            </h2>
            <h2 className="stats-earning-referral-h2">
              Invite artists to join trax.so and earn commission on their earnings. 5% for the first year, 1% lifetime.
            </h2>
            <Button
              className="rounded-full bg-trax-lime-500 w-fit h-fit border-none px-6 py-2"
              onClick={this.handleCopyClick}
            >
              {isCopied ? 'Link Copied!' : 'Invite friends'}
            </Button>
          </div> */}
          </div>

          <div className="tab-bar">
          <div onClick={() => this.changeStage(0)} className="tab-btn-wrapper">
              <h1 className={`${stage === 0 ? 'selected-btn' : ''}`}>Tokens</h1>
              <div className={`${stage === 0 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(1)} className="tab-btn-wrapper">
              <h1 className={`${stage === 1 ? 'selected-btn' : ''}`}>Activity</h1>
              <div className={`${stage === 1 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(2)} className="tab-btn-wrapper">
              <h1 className={`${stage === 2 ? 'selected-btn' : ''}`}>Withdrawals</h1>
              <div className={`${stage === 2 ? 'active' : ''} tab-btn`} />
            </div>
          </div>
          <div style={{maxWidth: 950}}>


          {stage === 0 && <Tokens onGetStats={this.getPerformerStats.bind(this)} />}
          {stage === 1 && <ActivityPage onGetStats={this.getPerformerStats.bind(this)} />}
          {stage === 2 && <PayoutRequest />}
          </div>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  ui: { ...state.ui },
  currentUser: { ...state.user.current },
  settings: { ...state.settings },
  performer: {...state.performer}
});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(EarningsPage);
