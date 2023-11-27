/* eslint-disable no-nested-ternary, react/sort-comp */
import { PureComponent } from 'react';
// import { Row, Col, Button, Layout, Form, Input, Select, message, DatePicker, Divider } from 'antd';

import { LoadingOutlined } from '@ant-design/icons';
import {
  Actor, HttpAgent
} from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import {
  Avatar, Button, Form, Image, Select, InputNumber, message
} from 'antd';
import { IPerformer, ISettings, IUser } from 'src/interfaces';
import { tokenTransctionService } from 'src/services';
import { idlFactory as idlFactoryPPV } from '../../smart-contracts/declarations/ppv';
import type { _SERVICE as _SERVICE_PPV } from '../../smart-contracts/declarations/ppv/ppv.did';
import styles from './performer.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import { paymentService } from '@services/index';
import { getResponseError } from '@lib/utils';

const { Option } = Select;
interface IProps {
  type: string;
  performer: IPerformer;
  onFinish(selectedCurrency: string, subscriptionType: string): Function;
  submiting: boolean;
  settings: ISettings;
  user: IUser;
}

export class ConfirmSubscriptionPerformerForm extends PureComponent<IProps> {
  state = {
    price: '1',
    btnText: 'SEND TIP',
    btnTipDisabled: false,
    subscriptionType: 'monthly',
    currencies: [
      { name: 'USD', imgSrc: '/static/usd-logo.png', key: 'USD' },
      { name: 'ICP', imgSrc: '/static/icp-logo.png', key: 'ICP' },
      { name: 'ckBTC', imgSrc: '/static/ckbtc_nobackground.svg', key: 'ckBTC' }
    ],
    selectedCurrency: 'USD',
    icpPrice: 0,
    btcPrice: 0,
    isPriceLoading: true,
    cards: [],
    loading: false,
    paymentOption: 'noPayment'
  };

  async componentDidMount() {
    const { performer } = this.props;
    await this.getData()
    this.setState({ price: (performer?.monthlyPrice || 0).toFixed(2) });

    let ppv;
    let identity;
    const authClient = await AuthClient.create();
    let ppvCanID;
    let host;
    let agent;

    if ((process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic') {
      identity = authClient.getIdentity();
      ppvCanID = process.env.NEXT_PUBLIC_PPV_CANISTER_ID_LOCAL as string;

      host = process.env.NEXT_PUBLIC_HOST_LOCAL as string;
      agent = new HttpAgent({
        identity,
        host
      });

      await agent.fetchRootKey();

      ppv = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
        agent,
        canisterId: ppvCanID
      });
    } else {
      host = process.env.NEXT_PUBLIC_HOST as string;
      identity = authClient.getIdentity();
      agent = new HttpAgent({
        identity,
        host
      });

      ppvCanID = process.env.NEXT_PUBLIC_PPV_CANISTER_ID as string;

      ppv = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
        agent,
        canisterId: ppvCanID
      });
    }

    const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
    const btc = await ppv.getExchangeRate('BTC');

    this.setState({ icpPrice: icp, btcPrice: btc, isPriceLoading: false });
    const { selectedCurrency, subscriptionType } = this.state;
    this.showPrice(selectedCurrency, subscriptionType, icp);
  }

  showPrice(val: any, subType: string, icp: number = -1) {
    let icpval = icp;
    const { performer } = this.props;
    const { icpPrice, btcPrice } = this.state;
    const priceOfSub = (subType === 'monthly' || subType === 'free') ? performer.monthlyPrice : performer.yearlyPrice;
    if (icpval === -1) icpval = icpPrice;

    if (val === 'USD') {
      this.setState({ price: priceOfSub.toFixed(2) });
    } else if (val === 'ICP') {
      const res = (priceOfSub / icpval).toFixed(2);
      this.setState({ price: res });
    } else {
      const res = (priceOfSub / btcPrice).toFixed(2);
      this.setState({ price: res });
    }
  }

  async getData() {
    try {
      this.setState({ loading: true });
      const resp = await paymentService.getStripeCards();
      if(resp.data.data.length > 0){
        this.setState({paymentOption: 'card'});
      }else{
        this.setState({paymentOption: 'noPayment'});
      }
      this.setState({
        cards: resp.data.data.map((d) => {
          if (d.card) return { ...d.card, id: d.id };
          if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
          return d;
        })
      });
    } catch (error) {
      message.error(getResponseError(await error) || 'An error occured. Please try again.');
    } finally {
      this.setState({ loading: false });
    }
  }

  changePaymentOption(val: string){
    const {selectedCurrency} = this.state;
    this.setState({paymentOption: val})
    val !== 'card' ?this.setState({selectedCurrency: 'ICP'}) : this.setState({selectedCurrency: 'USD'});
  }

  async changeTicker(val: any) {
    const {subscriptionType} = this.state;
    this.setState({ selectedCurrency: val });
    val !== 'USD' ? this.setState({paymentOption: 'plug'}) : this.setState({paymentOption: 'card'});
    this.showPrice(val, subscriptionType);
  }

  async handleSwitchPeriod(value: string) {
    const { selectedCurrency } = this.state;
    this.setState({ subscriptionType: value });
    await this.showPrice(selectedCurrency, value);
  }

  render() {
    const {
      onFinish, submiting = false, performer, type
    } = this.props;

    const {
      currencies, selectedCurrency, subscriptionType, price, isPriceLoading, cards, loading, paymentOption
    } = this.state;

    return (
      <div className={styles.componentsPerformerVerificationFormModule}>

        <div className='send-tip-container'>
          <div className='tip-header-wrapper'>
            <span>Subscribe</span>
          </div>

          <div className='sub-type-togal-container'>
            <div className='sub-type-togal-wrapper' style={{background: subscriptionType === 'monthly' ? '#353535' : '#232323'}} onClick={()=> this.setState({subscriptionType: 'monthly'})}>
              <span>Pay monthly</span>
            </div>
            <div className='sub-type-togal-wrapper' style={{background: subscriptionType === 'yearly' ? '#353535' : '#232323'}} onClick={()=> this.setState({subscriptionType: 'yearly'})}>
              <span>Pay yearly</span>
            </div>
          </div>

          <div className='sub-preview-container'>
            <div className='sub-preview-wrapper'>
              <span className='sub-price-preview'>${subscriptionType === 'monthly' ? Number(performer.monthlyPrice).toFixed(2) : Number(performer.yearlyPrice).toFixed(2)}</span>
              <span className='sub-per-type'>{subscriptionType === 'monthly' ? 'per month': 'per year'}</span>
            </div>
            <span className='sub-cancel-note'>Cancel at any time</span>
          </div>
          <div className='payment-details'>
          <span>Payment details</span>
          <div className='payment-recipient-wrapper'>
              <div className='payment-recipient-avatar-wrapper'>
                <Avatar src={performer?.avatar || '/static/no-avatar.png'} />
              </div>
              <div className='payment-recipient-info'>
                <p>Pay to</p>
                <span>{performer?.name}</span>
                  <p style={{color: '#c8ff02'}}>Verified Artist</p>
              </div>
              <a href={`/artist/profile?id=${performer?.username || performer?._id}`} className='info-icon-wrapper'>
                <FontAwesomeIcon style={{color: 'white'}} icon={faCircleInfo} />
              </a>
            </div>
            
          <Select onChange={(v) => this.changePaymentOption(v)} defaultValue={paymentOption} value={paymentOption}  className="payment-type-select">
          {!loading && cards.length > 0 && cards.map((card) => (
            <Option value="card" key="card" className="payment-type-option-content">
              <div className='payment-type-img-wrapper'>
                {card.brand === 'Visa' && ( <img src='/static/visa_logo.png' width={50} height={50}/>)}
                {card.brand === 'Mastercard' && ( <img src='/static/mastercard_logo.png' width={50} height={50}/>)}
                {card.brand === 'AmericanExpress' && ( <img src='/static/amex_logo.png' width={50} height={50}/>)}
                {card.brand === 'Maestro' && ( <img src='/static/maestro_logo.png' width={50} height={50}/>)}
                  
                </div>
                <div className='payment-type-info'>
                  <span>{card.brand}</span>
                    <p>{`**** **** **** ${card.last4}`}</p>
                    <p>{card.exp_month < 10 ? `0${card.exp_month}` : `${card.exp_month}`}/{card.exp_year}</p>
                </div>
            </Option>
            ))}
            
            {/* <Option disabled={true} value="plug" key="plug" className="payment-type-option-content">
              <div className='payment-type-img-wrapper'>
                <img src='/static/plug-favicon.png' width={40} height={40}/>
              </div>
              <div className='payment-type-info'>
                <span>Plug wallet</span>
                  <p>{`**** **** **** -a3eio`}</p>
                  <p>Internet Computer</p>
              </div>
            </Option>

            <Option disabled={true} value="II" key="II" className="payment-type-option-content">
              <div className='payment-type-img-wrapper'>
                <img src='/static/icp-logo.png' width={40} height={40}/>
              </div>
              <div className='payment-type-info'>
                <span>Internet Identity</span>
                  <p>{`**** **** **** -b4aed`}</p>
                  <p>Internet Computer</p>
              </div>
            </Option>

            <Option disabled={true} value="nfid" key="nfid" className="payment-type-option-content">
              <div className='payment-type-img-wrapper'>
                <img src='/static/nfid-logo-og.png' width={40} height={40} style={{borderRadius: 10}}/>
              </div>
              <div className='payment-type-info'>
                <span>NFID</span>
                  <p>{`**** **** **** -b4aed`}</p>
                  <p>Internet Computer</p>
              </div>
            </Option> */}

            {paymentOption === "noPayment" && (
              <Option value="noPayment" key="noPayment" className="payment-type-option-content">
                <div className='payment-type-img-wrapper'>
                <FontAwesomeIcon style={{width: 45, height: 45}} icon={faXmark} />
                </div>
                <div className='payment-type-info'>
                  <span style={{}}>No Payment Method Connected</span>
                    <p>Please visit settings to add a card <br /> or connect a wallet</p>
                    {/* <p>Click to add crypto wallet</p> */}
                </div>
              </Option>
            )}
            
          </Select>
            
            
          </div>
          <div className='currency-picker-btns-container'>
            <span>Select a currency</span>
            <div className='currency-picker-btns-wrapper'>
            {cards.length > 0 && (
              <div className='currency-picker-btn-wrapper' onClick={(v)=> this.changeTicker('USD')}>
                <img src='/static/usd-logo.png' width={40} height={40} style={{border: selectedCurrency === 'USD' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
            )}
              {/* <div className='currency-picker-btn-wrapper-disabled'>
                <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper-disabled'>
                <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper-disabled' >
                <img src='/static/trax-token.png' width={40} height={40} />
              </div> */}
            </div>
          </div>
          <div className='tip-input-number-container'>
            <span>Payment amount</span>
            <div className='tip-input-number-wrapper'>
              {selectedCurrency === 'USD' && (
                <p>$</p>
              )}
              {selectedCurrency === 'ICP' && (
                <img src='/static/icp-logo.png' width={40} height={40}/>
              )}
              {selectedCurrency === 'ckBTC' && (
                <img src='/static/ckbtc_nobackground.png' width={40} height={40}/>
              )}
              <InputNumber 
                disabled={true} 
                type="number"
                // min={0.000001}
                // onChange={this.onChangeValue.bind(this)}
                value={subscriptionType === 'monthly' ? performer.monthlyPrice : performer.yearlyPrice}
                stringMode
                step="0.01"
                placeholder="0.00"
                className='tip-input-number'
              />
            </div>
          </div>
          <Button
              className="tip-button"
              disabled={submiting || paymentOption === "noPayment"}
              loading={submiting}
              onClick={() => onFinish(selectedCurrency, subscriptionType)}
            >
              Subscribe
            </Button>
        </div>
      </div>
    );
  }
}
