/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import { PureComponent } from 'react';
// import PlugConnect from '@psychedelic/plug-connect';
// import { payments_backend } from "../../smart-contracts/payments_backend";
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { IPerformer, IUser } from '@interfaces/index';
import { tokenTransctionService } from '@services/index';
import {
  InputNumber, Button, Avatar, Select, Image, message
} from 'antd';
import styles from './performer.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import { paymentService } from '@services/index';
import { getResponseError } from '@lib/utils';
import { icpPrice } from 'src/crypto/live-price-oracle';
// import { useInternetIdentity } from '@internet-identity-labs/react-ic-ii-auth';

const { Option } = Select;

// const {
//   signout, authenticate, isAuthenticated
// } = useInternetIdentity();

interface IProps {
  performer: IPerformer;
  onFinish(price: any, ticker: string, paymentOption: string): Function;
  submiting: boolean;
  participants?: any[];
  isProfile: boolean;
  user?: IUser;
}

export class TipPerformerForm extends PureComponent<IProps> {
  state = {
    price: 1.00,
    type: 'fiat',
    btnText: 'Send',
    btnTipDisabled: false,
    currencies: [
      { name: 'USD', imgSrc: '/static/usd-logo.png', key: 'USD' },
      { name: 'ICP', imgSrc: '/static/icp-logo.png', key: 'ICP' },
      { name: 'ckBTC', imgSrc: '/static/ckbtc_nobackground.svg', key: 'ckBTC' }
    ],
    selectedCurrency: 'USD',
    icpPrice: 0,
    ckbtcPrice: 0,
    custom: false,
    cards: [],
    loading: false,
    paymentOption: 'noPayment',
    ckbtcBal: 0,
    icpBal: 0,
    priceBtn: 1.00,
    plugConnected: false,
    iiConnected: false,
    nfidConnected: false

    // senderID: window.ic.plug.agent.getPrincipal()
  };

  async componentDidMount() {
    const {user} = this.props

    const icpPrice = (await tokenTransctionService.getExchangeRate()).data.rate;
    const ckbtcPrice = (await tokenTransctionService.getExchangeRateBTC()).data.rate;
    // const icpPrice = 3.50;
    // const ckbtcPrice = 30000;

    

    this.setState({icpPrice: icpPrice, ckbtcPrice: ckbtcPrice})
    await this.getData();

    if(!user.wallet_icp){
      message.info("You do not have a wallet connected. If you would like to pay with crypto please navigate to settings and connect your preferred wallet. ")
    }


    // if(typeof window !== 'undefined' && 'ic' in window){
    //     //@ts-ignore
    //     const result = await window?.ic?.plug?.isConnected();
    //     this.setState({plugConnected: result});
    //     console.log(`Plug connection is ${result}`);
    // }

    // if(isAuthenticated){
    //  this.setState({nfidConnected: true});
    // }
  }


  async getData() {
    const {user} = this.props
    try {
      this.setState({ loading: true });
      const resp = await paymentService.getStripeCards();
  
      if(resp.data.data.length > 0){
        this.setState({paymentOption: 'card'});
        this.setState({selectedCurrency: 'USD'})
      }else if(user?.wallet_icp){
        this.setState({paymentOption: 'plug'});
        this.setState({selectedCurrency: 'ICP'})
      }else{
        this.setState({paymentOption: 'noPayment'});
      }

      console.log(resp.data.data.length)
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

  onChangeValue(price) {
    this.setState({ price });
  }

  changeTicker(val: string){
    const {priceBtn} = this.state;
    this.setState({selectedCurrency: val})
    val !== 'USD' ? this.setState({paymentOption: 'plug'}) : this.setState({paymentOption: 'card'});
    this.correctInput(priceBtn, val);
  }

  changePaymentOption(val: string){
    const {priceBtn, selectedCurrency} = this.state;
    this.setState({paymentOption: val})
    val !== 'card' ?this.setState({selectedCurrency: 'ICP'}) : this.setState({selectedCurrency: 'USD'});
    this.correctInput(priceBtn, selectedCurrency)
  }

  changeShortcut(val: number, custom: boolean){
    const {selectedCurrency} = this.state;
    this.setState({priceBtn: val});
    this.setState({custom: custom});
    this.correctInput(val, selectedCurrency)
  }

  correctInput(val: number, selectedCurrency: string){
    const {icpPrice, ckbtcPrice} = this.state;
    if(selectedCurrency === 'ICP'){
      val === 1 && this.setState({price: (1 / icpPrice).toFixed(3) });
      val === 3 && this.setState({price: (3 / icpPrice).toFixed(3) });
      val === 5 && this.setState({price: (5 / icpPrice).toFixed(3) });
    } 
    if(selectedCurrency === 'ckBTC'){
      val === 1 && this.setState({price: (1 / ckbtcPrice).toFixed(9) });
      val === 3 && this.setState({price: (3 / ckbtcPrice).toFixed(9) });
      val === 5 && this.setState({price: (5 / ckbtcPrice).toFixed(9) });
    }
    selectedCurrency === 'USD' && this.setState({price: val });
  }

  render() {
    const {
      onFinish, submiting = false, performer, participants, isProfile, user
    } = this.props;
    const {
      price, selectedCurrency, btnText, icpPrice, ckbtcPrice, custom, cards, loading, paymentOption, ckbtcBal, icpBal, priceBtn, plugConnected, iiConnected, nfidConnected
    } = this.state;

    return (
      <div className={styles.componentsPerformerVerificationFormModule}>
        <div className='send-tip-container'>
          <div className='tip-header-wrapper'>
            <span>Send a tip</span>
            <p>Support this creator on their journey</p>
          </div>

          <div className='tip-amount-shortcut-container'>
            <div className={`amount-shortcut-btn ${priceBtn === 1 ? 'active' : '' }`} onClick={()=> this.changeShortcut( 1, false)}>
              <span>$1.00</span>
            </div>
            <div className={`amount-shortcut-btn ${priceBtn === 3 ? 'active' : '' }`} onClick={()=>  this.changeShortcut( 3, false)}>
              <span>$3.00</span>
            </div>
            <div className={`amount-shortcut-btn ${priceBtn === 5 ? 'active' : '' }`} onClick={()=>  this.changeShortcut( 5, false)}>
              <span>$5.00</span>
            </div>
            <div className={`amount-shortcut-btn ${custom === true ? 'active' : '' }`} onClick={()=>  this.changeShortcut(null, true)}>
              <span>Custom</span>
            </div>
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
            {user.wallet_icp && (
              <>
                <Option value="plug" key="plug" className="payment-type-option-content">
                  <div className='payment-type-img-wrapper'>
                    <img src='/static/plug-favicon.png' width={40} height={40}/>
                  </div>
                  <div className='payment-type-info'>
                    <span>Plug wallet</span>
                      <p>{`${user.wallet_icp.slice(0, 6)} **** ${user.wallet_icp.slice(-4)}`}</p>
                      <p>Internet Computer</p>
                  </div>
                </Option>
              
              
                <Option value="II" key="II" className="payment-type-option-content">
                  <div className='payment-type-img-wrapper'>
                    <img src='/static/icp-logo.png' width={40} height={40}/>
                  </div>
                  <div className='payment-type-info'>
                    <span>Internet Identity</span>
                      <p>{`${user.wallet_icp.slice(0, 6)} **** ${user.wallet_icp.slice(-4)}`}</p>
                      <p>Internet Computer</p>
                  </div>
                </Option>



                <Option value="nfid" key="nfid" className="payment-type-option-content">
                  <div className='payment-type-img-wrapper'>
                    <img src='/static/nfid-logo-og.png' width={40} height={40} style={{borderRadius: 10}}/>

                  </div>
                  <div className='payment-type-info'>
                    <span>NFID</span>
                      <p>{`${user.wallet_icp.slice(0, 6)} **** ${user.wallet_icp.slice(-4)}`}</p>
                      <p>Internet Computer</p>
                  </div>
                </Option>
              </>
            )}
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
              {user.wallet_icp && (
                <>
              <div className='currency-picker-btn-wrapper' onClick={(v)=> this.changeTicker('ICP')}>
                <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper' onClick={(v)=> this.changeTicker('ckBTC')}>
                <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper-disabled' >
                <img src='/static/trax-token.png' width={40} height={40} />
              </div>
              </>
              )}
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
                disabled={custom !== true} 
                type="number"
                min={0.000001}
                onChange={this.onChangeValue.bind(this)}
                value={price}
                placeholder="0.00"
                className='tip-input-number'
                stringMode
                step="0.01"
              />
              {selectedCurrency === 'ICP' && (
                <span className='usd-conversion'>~${(price * icpPrice).toFixed(2)}</span>
              )}
              {selectedCurrency === 'ckBTC' && (
                <span className='usd-conversion'>~${(price * ckbtcPrice).toFixed(2)}</span>
              )}
            </div>
          </div>
            <Button
                className="tip-button"
                disabled={submiting || paymentOption === 'noPayment'}
                loading={submiting}
                onClick={() => onFinish(price, selectedCurrency, paymentOption)}
              >
                {btnText}
            </Button>
        </div>
      </div>
    );
  }
}
