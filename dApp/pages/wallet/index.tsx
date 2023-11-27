import Head from 'next/head';
import {
  Layout, message, InputNumber, Form, Input, Button, Modal
} from 'antd';

import { DepositICP } from '@components/user/deposit-icp';
import { SendCrypto } from '@components/user/send-crypto';
import {
  LoadingOutlined
} from '@ant-design/icons';
import { PureComponent } from 'react';
import { paymentService, tokenTransctionService } from '@services/index';
import {
  IUIConfig, IUser, ISettings
} from '@interfaces/index';
import { connect } from 'react-redux';
import Router from 'next/router';
import Loader from '@components/common/base/loader';
import { CurrencyDollarIcon } from '@heroicons/react/solid';
import { SiBitcoin } from 'react-icons/si';
import Image from 'next/image';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { createLedgerActor } from '../../src/crypto/ledgerActor';
import { Tokens } from '../../src/smart-contracts/declarations/ledger/ledger.did';
import styles from './index.module.scss';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";

interface IProps {
  ui: IUIConfig;
  user: IUser;
  settings: ISettings
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

class TokenPackages extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    submiting: false,
    couponCode: '',
    coupon: null,
    amount: 10,
    openTopupModal: false,
    openDepositICPModal: false,
    balanceICP: 0,
    balanceICPUSD: 0,
    balanceCKBTC: 0,
    balanceCKBTCUSD: 0,
    totalWalletBalance: 0,
    isBalanceLoading: true,
    openSendModal: false,
    icpPrice: 0,
    ckbtcPrice: 0,

  };

  async componentDidMount() {
    const { user } = this.props;
    let ledgerActor;
    let ledgerCanID;
    let ckBTCLedgerCanID;
    let ledgerActorCKBTC;
    let host;
    let agent;

    const icpPrice = (await tokenTransctionService.getExchangeRate()).data.rate;
    const ckbtcPrice = (await tokenTransctionService.getExchangeRateBTC()).data.rate;

    this.setState({ icpPrice: icpPrice, ckbtcPrice: ckbtcPrice})

    if (!user.wallet_icp) {
      this.setState({
        balanceICP: 0,
        isBalanceLoading: false,
        balanceICPUSD: 0,
        totalWalletBalance: user.balance,
        balanceCKBTC: 0,
        balanceCKBTCUSD: 0
       });

      // message.info('You do not have a NFID connected. Therefore, you cannot deposit ICP.');

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
        principal: Principal.fromText(user.wallet_icp)
      });

      // @ts-ignore
      const fanBytes = fanAI.bytes;

      const balArgs: AccountBalanceArgs = {
        account: fanBytes
      };

      const bal: Tokens = await ledgerActor.account_balance(balArgs);
      const ckbtcBal = await await ledgerActorCKBTC.balance({
        owner: Principal.fromText(user.wallet_icp),
        certified: false,
      });
      const formattedBalance = Number(bal.e8s) / 100000000;
      const ckbtcFormattedBalance = Number(ckbtcBal) / 100000000;

      const amountICPUSD = icpPrice * formattedBalance;
      const amountCKBTCUSD = ckbtcPrice * ckbtcFormattedBalance;
      const total = amountCKBTCUSD + amountICPUSD + user.balance;

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

  addFund = async ({ amount }) => {
    const { user, settings } = this.props;
    const {
      couponCode, coupon
    } = this.state;
    if (settings.paymentGateway === 'stripe' && !user?.stripeCardIds?.length) {
      message.error('Please add a payment card to complete your purchase');
      Router.push('/user/account');
      return;
    }
    try {
      this.setState({ submiting: true });
      const resp = await paymentService.addFunds({
        paymentGateway: settings.paymentGateway,
        amount,
        couponCode: coupon ? couponCode : ''
      });
      if (settings.paymentGateway === '-ccbill') {
        window.location.href = resp?.data?.paymentUrl;
      }

      message.success('Payment successful! Your wallet has been topped up.');
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
      this.setState({ submiting: false });
    } finally {
      this.setState({ submiting: false });
    }
  }

  applyCoupon = async () => {
    const { couponCode } = this.state;
    if (!couponCode) return;
    try {
      const resp = await paymentService.applyCoupon(couponCode);
      this.setState({ coupon: resp.data });
      message.success('Coupon is applied');
    } catch (error) {
      const e = await error;
      message.error(e?.message || 'Error occured, please try again later');
    }
  }

  render() {
    const { ui, user } = this.props;
    const {
      submiting, couponCode, coupon, amount, openTopupModal, openDepositICPModal, balanceICP, balanceICPUSD, totalWalletBalance,
      isBalanceLoading, balanceCKBTC, balanceCKBTCUSD, openSendModal, icpPrice, ckbtcPrice
    } = this.state;
    return (
      <Layout className={styles.pagesWalletModule}>
        <Head>
          <title>{`${ui?.siteName} | Wallet`}</title>
        </Head>
        <div className="main-container">
          <div className="purchase-form">
            <div style={{ marginTop: '8rem', fontWeight: 'bold', fontFamily: 'Inter' }} className="current-balance">
              <div style={{ fontSize: '4rem' }} className="balance">

                <span className="amount">
                  $
                  {(totalWalletBalance || 0).toFixed(2)}
                </span>
              </div>

            </div>
            <div className="assets-wrapper">
              <div className="assets-text-wrapper">
                <p>Assets</p>
              </div>

              <div className="asset-item-wrapper">
                <div>
                  <CurrencyDollarIcon style={{ height: '2rem', width: '2rem' }} />
                </div>
                <div className="wallet-currency-bal-wrapper">
                  <p style={{ marginBottom: '-0.125rem', fontWeight: 'bolder' }}>US Dollar</p>
                  <span>{(user.balance || 0).toFixed(2)}</span>
                </div>
                <div className="price-usd-wallet-wrapper">
                  <span>
                    $
                    {(user.balance || 0).toFixed(2)}
                  </span>
                </div>
                <Button className="withdraw-button" onClick={() => this.setState({ openTopupModal: true })}>
                  Buy credit
                </Button>
              </div>
              <div className="asset-item-wrapper-btc">
                <div>
                <Image alt="btc-logo" src='/static/ckbtc_nobackground.svg' width="30" height="30" />
                </div>
                <div className="wallet-currency-bal-wrapper">
                  <p style={{ marginBottom: '-0.125rem', fontWeight: 'bolder' }}>ckBTC</p>
                  {isBalanceLoading
                    ? <LoadingOutlined />
                    : <span>{(balanceCKBTC || 0)}</span>}
                </div>
                <div className="price-usd-wallet-wrapper">
                {isBalanceLoading
                    ? <LoadingOutlined />
                    : (
                      <span>
                        $
                        {(balanceCKBTCUSD || 0).toFixed(2)}
                      </span>
                    )}
                </div>
                <Button className="withdraw-button" disabled={!user.wallet_icp} onClick={() => this.setState({ openDepositICPModal: true })}>
                  Deposit
                </Button>
              </div>
              <div className="asset-item-wrapper-icp">
                <div>
                  <Image alt="icp-logo" src="/static/icp-logo.png" width="24" height="24" />
                </div>
                <div className="wallet-currency-bal-wrapper">
                  <p style={{ marginBottom: '-0.125rem', fontWeight: 'bolder' }}>ICP</p>
                  {isBalanceLoading
                    ? <LoadingOutlined />
                    : <span>{(balanceICP || 0).toFixed(2)}</span>}
                </div>
                <div className="price-usd-wallet-wrapper">
                  {isBalanceLoading
                    ? <LoadingOutlined />
                    : (
                      <span>
                        $
                        {(balanceICPUSD || 0).toFixed(2)}
                      </span>
                    )}

                </div>
                <Button className="withdraw-button" disabled={!user.wallet_icp} onClick={() => this.setState({ openDepositICPModal: true })}>
                  Deposit
                </Button>
              </div>
            </div>

            <div className='send-container'>
                <div className='send-wrapper'>
                    <Button className='withdraw-button' onClick={()=> this.setState({openSendModal: true})}>
                      Send
                    </Button>
                </div>
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

            <Modal
              key="tip_topup"
              className="subscription-modal"
              open={openTopupModal}
              centered
              onOk={() => this.setState({ openTopupModal: false })}
              footer={null}
              width={600}
              title={null}
              onCancel={() => this.setState({ openTopupModal: false })}
            >
              <Form
                onFinish={this.addFund}
                onFinishFailed={() => message.error('Please complete the required fields')}
                name="form-upload"
                scrollToFirstError
                initialValues={{
                  amount: 10
                }}
                {...layout}
              >
                <Form.Item
                  name="amount"
                  label="Enter Amount"
                  rules={[{ required: true, message: 'Amount is required!' }]}
                >
                  <InputNumber onChange={(val) => this.setState({ amount: val })} style={{ width: '100%' }} min={1} />
                </Form.Item>
                <Form.Item help={coupon && (
                <small style={{ color: 'red' }}>
                  Discount
                  {' '}
                  {coupon.value * 100}
                  %
                </small>
                )}
                >
                  <Button.Group className="coupon-dc">
                    <Input disabled={!!coupon} placeholder="Enter coupon code here" onChange={(e) => this.setState({ couponCode: e.target.value })} />
                    {!coupon ? <Button disabled={!couponCode} onClick={this.applyCoupon.bind(this)} className="withdraw-button" style={{ marginLeft: '10px' }}>Apply!</Button>
                      : <Button type="primary" onClick={() => this.setState({ couponCode: '', coupon: null })}>Use Later!</Button>}

                  </Button.Group>
                </Form.Item>
                <Form.Item className="total-price">
                  Total:
                  <span className="amount">
                    $
                    {(amount - (amount * (coupon?.value || 0))).toFixed(2)}
                  </span>
                </Form.Item>
                <Form.Item className="text-center">
                  <Button htmlType="submit" className="primary" disabled={submiting} loading={submiting}>
                    BUY NOW
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
          {submiting && <Loader customText="We are processing your payment, please do not reload this page until it's done." />}
        </div>
        <Modal
          key="purchase_post"
          className="purchase-modal ppv-modal"
          title={null}
          open={openDepositICPModal}
          footer={null}
          width={600}
          destroyOnClose
          onCancel={() => this.setState({ openDepositICPModal: false })}
        >
          <DepositICP user={user} />
        </Modal>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui },
  user: { ...state.user.current },
  settings: { ...state.settings }
});

export default connect(mapStates)(TokenPackages);
