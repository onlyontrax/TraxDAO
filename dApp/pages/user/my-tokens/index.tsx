/* eslint-disable react/no-unused-prop-types */
import { Layout, message, Button, Modal, InputNumber, Form, Input, Avatar, Progress } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
// import { TokenListEarning } from '@components/performer/tokens';
import { getResponseError } from '@lib/utils';
import { SearchFilter } from 'src/components/common/search-filter';
import {
  IEarning, IUser, IPerformerStats, IUIConfig, ISearch, ISettings
} from 'src/interfaces';
import { earningService } from 'src/services';
// import styles from './index.module.scss';
import { DepositICP } from '@components/user/deposit-icp';
import {
  LoadingOutlined
} from '@ant-design/icons';
import { paymentService, tokenTransctionService } from '@services/index';
import Router from 'next/router';
import Loader from '@components/common/base/loader';
import { CurrencyDollarIcon } from '@heroicons/react/solid';
import { SiBitcoin } from 'react-icons/si';
import Image from 'next/image';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { createLedgerActor } from '../../../src/crypto/ledgerActor';
import { Tokens } from '../../../src/smart-contracts/declarations/ledger/ledger2.did';
import styles from './index.module.scss';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
interface IProps {
  user: IUser;
  balanceICPUSD: number;
  balanceCKBTCUSD: number;
  balanceICP: number;
  balanceCKBTC: number;
  balanceTRAX: number;
  balanceTRAXUSD: number;
  settings: ISettings;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const currencies = [
  { name: 'USD', imgSrc: '/static/usd-logo.png', symbol: 'USD' },
  { name: 'ICP', imgSrc: '/static/icp-logo.png', symbol: 'ICP' },
  { name: 'ckBTC', imgSrc: '/static/ckbtc_nobackground.svg', symbol: 'ckBTC' }
]

class MyTokens extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    submiting: false,
    couponCode: '',
    coupon: null,
    amount: 10,
    openTopupModal: false,
    openDepositICPModal: false,
    totalWalletBalance: 0,
    isBalanceLoading: true,
    icpPrice: 0,
    ckbtcPrice: 0,
    traxPrice: 0,
    openTipProgressModal: false

  };

  async componentDidMount() {
  }

  addFund = async ({ amount }) => {
    const { user, settings } = this.props;
    const { couponCode, coupon  } = this.state;
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
    const { user, balanceICPUSD, balanceCKBTCUSD, balanceTRAXUSD,  balanceTRAX, balanceICP, balanceCKBTC  } = this.props;
    const {submiting, couponCode, coupon, amount, openTopupModal, openDepositICPModal, icpPrice, ckbtcPrice, openTipProgressModal} = this.state;
    const couponAmount = (amount - (amount * (coupon?.value || 0)));
    return (
      <Layout>

        <div className="main-container-table">

          <div className="table-responsive">
            <div className='tokens-container'>
                <div className='tokens-wrapper'>
                    <img src="/static/usd-logo.png" alt="dollars" className='tokens-img'/>
                    <div className='tokens-split'>
                        <div className='tokens-data'>
                            <span className='tokens-symbol'>US Dollars</span>
                            <span className='tokens-balance'>{(user && user?.balance && user?.balance.toFixed(2)) || 0} USD</span>
                        </div>
                        <div className='tokens-ex-rate'>
                            <span>${(user && user?.balance && user?.balance.toFixed(2)) || 0}</span>
                        </div>
                    </div>
                    <Button className="withdraw-button" onClick={() => this.setState({ openTopupModal: true })}>
                        Buy credit
                    </Button>
                </div>
                <div className='tokens-wrapper'>
                    <img src="/static/icp-logo.png" alt="icp" className='tokens-img' />
                    <div className='tokens-split'>
                        <div className='tokens-data'>
                            <span className='tokens-symbol'>ICP</span>
                            <span className='tokens-balance'>{(balanceICP && balanceICP.toFixed(3)) || 0} ICP</span>
                        </div>
                        <div className='tokens-ex-rate'>
                            <span>${(balanceICP && balanceICPUSD.toFixed(2)) || 0}</span>
                        </div>
                        
                    </div>
                    
                    <Button className="withdraw-button" onClick={() => this.setState({ openDepositICPModal: true })}>
                        Deposit
                    </Button>
                </div>
                <div className='tokens-wrapper'>
                    <img src="/static/ckbtc_nobackground.svg" alt="ckbtc" className='tokens-img' />
                    <div className='tokens-split'>
                        <div className='tokens-data'>
                            <span className='tokens-symbol'>ckBTC</span>
                            <span className='tokens-balance'>{balanceCKBTC || 0} ckBTC</span>
                        </div>
                        <div className='tokens-ex-rate'>
                            <span>${(balanceCKBTCUSD && balanceCKBTCUSD.toFixed(2)) || 0}</span>
                        </div>
                        
                    </div>
                    <Button className="withdraw-button"  onClick={() => this.setState({ openDepositICPModal: true })}>
                        Deposit
                    </Button>
                </div>
                <div className='tokens-wrapper'>
                    <img src="/static/trax-token.png" alt="trax" className='tokens-img' />
                    <div className='tokens-split'>
                        <div className='tokens-data'>
                            <span className='tokens-symbol'>TRAX</span>
                            <span className='tokens-balance'>{balanceTRAX.toFixed(3) || 0} TRAX</span>
                        </div>
                        <div className='tokens-ex-rate'>
                            <span>${(balanceTRAXUSD && balanceTRAXUSD.toFixed(2)) || 0}</span>
                        </div>
                        
                    </div>
                    <Button className="withdraw-button" onClick={() => this.setState({ openDepositICPModal: true })}>
                        Deposit
                    </Button>
                </div>
                <div>

                </div>
            </div>
          </div>
          
        </div>

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
                <h1>Purchase credit</h1>
                <p>The payment will be taken from your connected payment method via Stripe.</p>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{ required: false, message: 'Amount is required!' }]}
                >
                  <InputNumber placeholder='$0.00' prefix='$' onChange={(val) => this.setState({ amount: val })} style={{ width: '100%' }} min={1} />
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
                <div className='flexbox-2'>
                <Form.Item className="total-price">
                  Total:
                  <span className="amount">
                    $
                    {(couponAmount && couponAmount.toFixed(2))}
                  </span>
                </Form.Item>
                <Form.Item className="text-center">
                  <Button htmlType="submit" className="form-bottom-right-button" disabled={submiting} loading={submiting}>
                    Purchase
                  </Button>
                </Form.Item>
                </div>
              </Form>
            </Modal>
        <Modal
          key="purchase_post"
          className="purchase-modal ppv-modal"
          title={null}
          open={openDepositICPModal}
          footer={null}
          width={500}
          destroyOnClose
          onCancel={() => this.setState({ openDepositICPModal: false })}
        >
          {user?.wallet_icp ? (
                <DepositICP user={user} />
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

const mapStates = (state) => ({
  performer: { ...state.user.current },
  settings: { ...state.settings }
});
export default connect(mapStates)(MyTokens);
