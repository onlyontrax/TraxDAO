/* eslint-disable react/no-unused-prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { Layout, Statistic, Button, Avatar } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer,
  IPerformerStats, ISettings, IUIConfig, IUser
} from 'src/interfaces';
import Earning from '../earning';
import Orders from '../my-order';
import PayoutRequest from '../payout-request';
import Tokens from '../my-tokens';
import Router from 'next/router';
import {BsFillCreditCardFill} from 'react-icons/bs'
import {RiTeamFill} from 'react-icons/ri'
import ReferralEarnings from './referral-earnings';
import {BsCheckCircleFill} from 'react-icons/bs'
import {TbCopy} from 'react-icons/tb'
import { PlusIcon } from '@heroicons/react/solid';
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
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | My Earnings`}</title>
        </Head>
        <div className="main-container">
          <h1 className="content-heading"></h1>
          <div className='earnings-heading flex items-center'>
            <div className='avatar-wrapper-earnings'>
              <Avatar src={currentUser?.avatar || '/static/no-avatar.png'} alt="avatar" />
            </div>
            <span className='performer-name-earnings'>{currentUser.name}</span>
            <div className='earnings-btn-wrapper'>
              <Button
                className="earnings-page-btns"
                onClick={() => Router.push('/artist/payout-request/create')}
              >
                < PlusIcon style={{marginRight: '10px', width: '20px', height: '20px' }} /> New withdrawal
              </Button>
            </div>
          </div>


          <div className='stats-earning-wrapper'>
          <div className="stats-earning">
            <span className='ant-statistic-subtitle'>Balance</span>
            <Statistic  prefix="$" value={(stats?.totalNetPrice || 0) + (stats?.totalNetPriceICP || 0)} precision={2} />
          </div>

          {/* <div className="stats-earning-points">
            <span className="ant-statistic-subtitle">TRAX points</span>
            <Statistic  prefix="✧" value={(stats?.totalNetPrice || 0) + (stats?.totalNetPriceICP || 0)} precision={2} />
          </div> */}
          <div className="stats-earning-referral">
            <span className='ant-statistic-subtitle'></span>
            <h2 className="stats-earning-referral-h1">
              Refer artists to TRAX.
             <br />
              Get 5% of their earnings*
          </h2>
          <Button
              className="referral-link-btn"
              onClick={this.handleCopyClick}
            >
              {isCopied ? <BsCheckCircleFill style={{marginRight: '10px', width: '20px', height: '20px' }} className='copied-icon-refer' /> : < RiTeamFill style={{marginRight: '10px', width: '20px', height: '20px' }} />}
              {' '}
              {isCopied ? 'Link Copied!' : 'Copy referral link'}
            </Button>
          </div>
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
              <h1 className={`${stage === 2 ? 'selected-btn' : ''}`}>Orders</h1>
              <div className={`${stage === 2 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(3)} className="tab-btn-wrapper">
              <h1 className={`${stage === 3 ? 'selected-btn' : ''}`}>Withdrawals</h1>
              <div className={`${stage === 3 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(4)} className="tab-btn-wrapper">
              <h1 className={`${stage === 4 ? 'selected-btn' : ''}`}>Referrals</h1>
              <div className={`${stage === 4 ? 'active' : ''} tab-btn`} />
            </div>
          </div>
          {stage === 0 && <Tokens onGetStats={this.getPerformerStats.bind(this)} />}
          {stage === 1 && <Earning onGetStats={this.getPerformerStats.bind(this)} />}
          {stage === 2 && <Orders />}
          {stage === 3 && <PayoutRequest />}
          {stage === 4 && <ReferralEarnings />}
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
