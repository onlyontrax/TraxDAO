/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { Layout, Avatar, Button, message, Statistic, Modal } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ISettings, IUIConfig, IUser } from 'src/interfaces';
import SubscriptionPage from '../my-subscription';
import OrderHistoryPage from '../orders';
import PaymentHistoryPage from '../payment-history';
import WalletTransaction from '../wallet-transaction';
import MyTickets from '../my-tickets';
import {BsFillCreditCardFill} from 'react-icons/bs';
import {RiTeamFill} from 'react-icons/ri';
import ReferralEarnings from './referral-earnings';
import {BsCheckCircleFill} from 'react-icons/bs';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { createLedgerActor } from '../../../src/crypto/ledgerActor';
import { Tokens } from '../../../src/smart-contracts/declarations/ledger/ledger2.did';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import { tokenTransctionService } from '@services/index';
import SendCrypto from '@components/user/send-crypto';
import MyTokens from '../my-tokens';

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
  settings: ISettings;
  user: IUser;
}

class MyPaymentsPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    stage: 0,
    isCopied: false,
    balanceICPUSD: 0,
    balanceCKBTCUSD: 0,
    balanceTRAXUSD: 0,
    balanceICP: 0,
    balanceTRAX: 0,
    balanceCKBTC: 0,
    totalWalletBalance: 0,
    isBalanceLoading: true,
    openSendModal: false,
    icpPrice: 0,
    ckbtcPrice: 0,
    isMobile: false
  };

  async componentDidMount() {
    const { currentUser, settings } = this.props;
    let ledgerActor;
    let ledgerActorCKBTC;
    let ledgerActorTRAX;
    let agent;

    const host = settings.icHost;
    const ledgerCanID = settings.icLedger;
    const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);
    const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);

    this.checkScreenSize();

    const icpPrice = (await tokenTransctionService.getExchangeRate()).data.rate;
    const ckbtcPrice = (await tokenTransctionService.getExchangeRateBTC()).data.rate;
    const traxPrice = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;

    this.setState({ icpPrice: icpPrice, ckbtcPrice: ckbtcPrice})

    if (!currentUser.wallet_icp) {
      this.setState({
        balanceICP: 0,
        isBalanceLoading: false,
        balanceICPUSD: 0,
        totalWalletBalance: (currentUser && currentUser.balance) || 0,
        balanceCKBTC: 0,
        balanceCKBTCUSD: 0
       });
    } else {
      
      agent = new HttpAgent({   host    });
      if (settings.icNetwork !== true) {
        await agent.fetchRootKey();
      };
      
      ledgerActor = await createLedgerActor(agent, ledgerCanID);
      ledgerActorCKBTC = IcrcLedgerCanister.create({    agent,  canisterId: ckBTCLedgerCanID    });
      ledgerActorTRAX = IcrcLedgerCanister.create({   agent,  canisterId: TRAXLedgerCanID   });

      const fanAI = AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(currentUser.wallet_icp)
      });

      // @ts-ignore
      const fanBytes = fanAI.bytes;

      const balArgs: AccountBalanceArgs = {
        account: fanBytes
      };

      const bal: Tokens = await ledgerActor.account_balance(balArgs);
      const ckbtcBal = await await ledgerActorCKBTC.balance({
        owner: Principal.fromText(currentUser.wallet_icp),
        certified: false,
      });
      const traxBal = await await ledgerActorTRAX.balance({
        owner: Principal.fromText(currentUser.wallet_icp),
        certified: false,
      });

      const formattedBalance = Number(bal.e8s) / 100000000;
      const ckbtcFormattedBalance = Number(ckbtcBal) / 100000000;
      const traxFormattedBalance = Number(traxBal) / 100000000;

      const amountICPUSD = icpPrice * formattedBalance;
      const amountCKBTCUSD = ckbtcPrice * ckbtcFormattedBalance;
      const amountTRAXUSD = traxPrice * traxFormattedBalance;
      const total = amountTRAXUSD + amountCKBTCUSD + amountICPUSD + ((currentUser && currentUser.balance) || 0);

      this.setState({
        balanceICPUSD: amountICPUSD,
        balanceCKBTCUSD: amountCKBTCUSD,
        balanceTRAXUSD: amountTRAXUSD,
        balanceICP: formattedBalance,
        balanceCKBTC: ckbtcFormattedBalance,
        balanceTRAX: traxFormattedBalance,
        totalWalletBalance: total,
        isBalanceLoading: false
      });
    }
  }

  checkScreenSize(){
    this.setState({ isMobile: window.innerWidth < 500 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 500 });
  };

  changeStage(val: number) {
    this.setState({ stage: val });
  };

  handleCopyClick = () => {
    const { currentUser} = this.props;
    const { protocol, hostname, port } = window.location;
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const referralLink = `${baseUrl}/register?referralCode=${currentUser.userReferral}`;

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
    const { stage, isCopied, totalWalletBalance,openSendModal, balanceICPUSD, balanceTRAXUSD, balanceCKBTCUSD, balanceICP, balanceTRAX, balanceCKBTC, isBalanceLoading, icpPrice, ckbtcPrice, isMobile } = this.state;
    const { ui, user, currentUser, settings } = this.props;
    return (
      <Layout className="added-padding">
        <div className="main-container">
        <div className='earnings-heading-user'>
             <div className='avatar-wrapper-earnings'>
              <Avatar src={currentUser?.avatar || '/static/no-avatar.png'} alt="avatar" />
            </div> 
            <span className='performer-name-earnings'>{currentUser?.username}</span>
        </div>
          
          <div className='stats-earning-wrapper'>
          <div className="stats-earning">
            <span className='ant-statistic-subtitle'>Balance</span>
            <Statistic prefix="$" value={(totalWalletBalance || 0)} precision={2} />
          </div>
          
          {/* <div className="stats-earning-points">
            <span className="ant-statistic-subtitle">TRAX points</span>
            <Statistic prefix="" value={(totalWalletBalance || 0)} precision={2} />
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
          {/* <div className='earnings-btn-wrapper'>

            <Button
              className="earnings-page-btns"
        
              onClick={()=> this.setState({openSendModal: true})}
            >
              < BsFillCreditCardFill style={{marginRight: '10px', width: '20px', height: '20px' }} /> Send Crypto
            </Button>

            <Button
              className="earnings-page-btns"
              onClick={this.handleCopyClick}
            >
              {isCopied ? <BsCheckCircleFill style={{marginRight: '10px', width: '20px', height: '20px' }} className='copied-icon-refer' /> : < RiTeamFill style={{marginRight: '10px', width: '20px', height: '20px' }} />}
              {' '}
              {isCopied ? 'Link Copied!' : 'Refer'}
            </Button>

            <Button className="earnings-page-btns">
              <Link style={{display: 'flex'}}  href="/user/purchased"><BsFillCreditCardFill style={{marginRight: '10px', width: '20px', height: '20px'}} />Purchased items</Link>
            </Button>

          </div> */}
          <div className="tab-bar">
            <div onClick={() => this.changeStage(0)} className="tab-btn-wrapper">
              <h1 className={`${stage === 0 ? 'selected-btn' : ''}`}>Tokens</h1>
              <div className={`${stage === 0 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(1)} className="tab-btn-wrapper">
              <h1 className={`${stage === 1 ? 'selected-btn' : ''}`}>{isMobile ? "Subs" : "Subscriptions" }</h1>
              <div className={`${stage === 1 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(2)} className="tab-btn-wrapper">
              <h1 className={`${stage === 2 ? 'selected-btn' : ''}`}>Payments</h1>
              <div className={`${stage === 2 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(3)} className="tab-btn-wrapper">
              <h1 className={`${stage === 3 ? 'selected-btn' : ''}`}>Orders</h1>
              <div className={`${stage === 3 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(4)} className="tab-btn-wrapper">
              <h1 className={`${stage === 4 ? 'selected-btn' : ''}`}>{isMobile ? "Txs" : "Transactions" }</h1>
              <div className={`${stage === 4 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(5)} className="tab-btn-wrapper">
              <h1 className={`${stage === 5 ? 'selected-btn' : ''}`}>Referrals</h1>
              <div className={`${stage === 5 ? 'active' : ''} tab-btn`} />
            </div>
            {/* <div onClick={() => this.changeStage(6)} className="tab-btn-wrapper">
              <h1 className={`${stage === 6 ? 'selected-btn' : ''}`}>Tickets</h1>
              <div className={`${stage === 6 ? 'active' : ''} tab-btn`} />
            </div> */}
            
          </div>
          {stage === 0 && <MyTokens user={currentUser} balanceICPUSD={balanceICPUSD} balanceCKBTCUSD={balanceCKBTCUSD} balanceTRAXUSD={balanceTRAXUSD} balanceICP={balanceICP} balanceTRAX={balanceTRAX} balanceCKBTC={balanceCKBTC} />}
          {stage === 1 && <SubscriptionPage user={user} />}
          {stage === 2 && <PaymentHistoryPage />}
          {stage === 3 && <OrderHistoryPage />}
          {stage === 4 && <WalletTransaction />}
          {stage === 5 && <ReferralEarnings />}
          {/* {stage === 6 && <MyTickets />} */}
        </div>
        <Modal
          key="tip_topup"
          className="subscription-modal"
          open={openSendModal}
          centered
          onOk={() => this.setState({ openSendModal: false })}
          footer={null}
          width={500}
          title={null}
          onCancel={() => this.setState({ openSendModal: false })}
        >
          {currentUser?.wallet_icp ? (
                <SendCrypto user={user} icpBalance={balanceICP} ckbtcBalance={balanceCKBTC} icpPrice={icpPrice} ckbtcPrice={ckbtcPrice}/>
              ):(
                <div className='no-send-crypto-container'>
                  <h1 style={{color: 'white'}} className=''>Unable to send crypto.</h1>
                  <span style={{color: '#f2f2f2d9', fontSize: 15}}>You must connect a web3 wallet in order to be able to send crypto. Please visit settings connect.</span>
                </div>
              )}
          
        </Modal>
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
export default connect(mapState, mapDispatch)(MyPaymentsPage);
