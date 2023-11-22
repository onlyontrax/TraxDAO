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
import {BsFillCreditCardFill} from 'react-icons/bs'
import {RiTeamFill} from 'react-icons/ri'
import ReferralEarnings from './referral-earnings';
import {BsCheckCircleFill} from 'react-icons/bs'
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { createLedgerActor } from '../../../src/crypto/ledgerActor';
import { Tokens } from '../../../src/smart-contracts/declarations/ledger/ledger.did';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import { tokenTransctionService } from '@services/index';
import MyTokens from '../my-tokens';
import { SendCrypto } from '@components/user/send-crypto';

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
    balanceICP: 0,
    balanceCKBTC: 0,
    totalWalletBalance: 0,
    isBalanceLoading: true,
    openSendModal: false,
    icpPrice: 0,
    ckbtcPrice: 0,
    isMobile: false
  };

  async componentDidMount() {
    const { currentUser } = this.props;
    let ledgerActor;
    let ledgerCanID;
    let ckBTCLedgerCanID;
    let ledgerActorCKBTC;
    let host;
    let agent;

    this.checkScreenSize();

    const icpPrice = (await tokenTransctionService.getExchangeRate()).data.rate;
    const ckbtcPrice = (await tokenTransctionService.getExchangeRateBTC()).data.rate;

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
      if ((process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic') {
    
        ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID_LOCAL as string;
        ckBTCLedgerCanID = process.env.NEXT_PUBLIC_CKBTC_MINTER_CANISTER_ID_LOCAL as string;

        host = process.env.NEXT_PUBLIC_HOST_LOCAL as string;
        agent = new HttpAgent({
          host
        });

        await agent.fetchRootKey();

        ledgerActor = await createLedgerActor(agent, ledgerCanID);
        ledgerActorCKBTC = IcrcLedgerCanister.create({
          agent,
          canisterId: ckBTCLedgerCanID
        });
     
      } else {

        ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID as string;
        ckBTCLedgerCanID = process.env.NEXT_PUBLIC_CKBTC_MINTER_CANISTER_ID as string;
 
        host = process.env.NEXT_PUBLIC_HOST as string;
        agent = new HttpAgent({
          host
        });
      
        ledgerActor = await createLedgerActor(agent, ledgerCanID);
        ledgerActorCKBTC = IcrcLedgerCanister.create({
          agent,
          canisterId: ckBTCLedgerCanID
        });
      }

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
      const formattedBalance = Number(bal.e8s) / 100000000;
      const ckbtcFormattedBalance = Number(ckbtcBal) / 100000000;

      const amountICPUSD = icpPrice * formattedBalance;
      const amountCKBTCUSD = ckbtcPrice * ckbtcFormattedBalance;
      const total = amountCKBTCUSD + amountICPUSD + ((currentUser && currentUser.balance) || 0);

      this.setState({ 
        balanceICPUSD: amountICPUSD,
        balanceCKBTCUSD: amountCKBTCUSD,
        balanceICP: formattedBalance,
        balanceCKBTC: ckbtcFormattedBalance,
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
    const { stage, isCopied, totalWalletBalance,openSendModal, balanceICPUSD, balanceCKBTCUSD, balanceICP, balanceCKBTC, isBalanceLoading, icpPrice, ckbtcPrice, isMobile } = this.state;
    const { ui, user, currentUser, settings } = this.props;
    return (
      <Layout className="added-padding">
        <div className="main-container">
        <div className='earnings-heading-user'>
            <div className='avatar-wrapper-earnings'>
              <Avatar src={currentUser?.avatar || '/static/no-avatar.png'} alt="avatar" />
            </div>
            <span className='performer-name-earnings'>{currentUser?.name}</span>
        </div>

          <div className="stats-earning">
            <Statistic prefix="$" value={(totalWalletBalance || 0)} precision={2} />
          </div>
          <div className='earnings-btn-wrapper'>

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

          </div>
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
          </div>
          {stage === 0 && <MyTokens settings={settings} user={currentUser} balanceICPUSD={balanceICPUSD} balanceCKBTCUSD={balanceCKBTCUSD} balanceICP={balanceICP} balanceCKBTC={balanceCKBTC}  />}
          {stage === 1 && <SubscriptionPage user={user} />}
          {stage === 2 && <PaymentHistoryPage />}
          {stage === 3 && <OrderHistoryPage />}
          {stage === 4 && <WalletTransaction />}
          {stage === 5 && <ReferralEarnings />}
        </div>
        <Modal
          key="tip_topup"
          className="subscription-modal"
          open={openSendModal}
          centered
          onOk={() => this.setState({ openSendModal: false })}
          footer={null}
          width={600}
          title={null}
          onCancel={() => this.setState({ openSendModal: false })}
        >
          <SendCrypto user={user} icpBalance={balanceICP} ckbtcBalance={balanceCKBTC} icpPrice={icpPrice} ckbtcPrice={ckbtcPrice}/>
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
