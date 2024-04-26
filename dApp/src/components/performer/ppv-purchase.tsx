/* eslint-disable no-nested-ternary */
import { PureComponent } from 'react';
// import { Row, Col, Button, Layout, Form, Input, Select, message, DatePicker, Divider } from 'antd';

import {
  Button, Avatar, Form, Select, message, InputNumber
} from 'antd';
import {
  LoadingOutlined
} from '@ant-design/icons';
import {
  IPerformer, IUser, ISettings, IVideo
} from 'src/interfaces';
import { connect } from 'react-redux';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import styles from './performer.module.scss';
import { idlFactory as idlFactoryPPV } from '../../smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV, Content } from '../../smart-contracts/declarations/ppv/ppv2.did';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { paymentService } from '@services/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import { getResponseError } from '@lib/utils';

const { Option } = Select;
interface IProps {
  type: string;
  performer: IPerformer;
  onFinish(ticker: string, paymentOption?: string): Function;
  submiting: boolean;
  settings: ISettings;
  user: IUser;
  video: IVideo;
  contentPriceICP: string;
  contentPriceCKBTC: string;
  contentPriceTRAX: string;
  isPriceICPLoading: boolean;
}

class PPVPurchaseModal extends PureComponent<IProps> {
  state = {
    price: 0,
    btnText: 'SEND TIP',
    btnTipDisabled: false,
    subscriptionType: 'monthly',
    currencies: [
      { name: 'USD', imgSrc: '/static/usd-logo.png', key: 'USD' },
      { name: 'ICP', imgSrc: '/static/icp-logo.png', key: 'ICP' },
      { name: 'ckBTC', imgSrc: '/static/ckbtc_nobackground.svg', key: 'ckBTC' }
    ],
    selectedCurrency: 'USD',
    isContentICP: false,
    custom: false,
    cards: [],
    loading: false,
    paymentOption: 'noPayment',
  }

  async componentDidMount() {
    const { video } = this.props;
    await this.getData()
    await this.checkContentExistsICP();
  }


  async getData() {
    const {user, video, contentPriceICP} = this.props
    try {
      this.setState({ loading: true });
      const resp = await paymentService.getStripeCards();
  
      if(resp.data.data.length > 0){
        this.setState({paymentOption: 'card'});
        this.setState({selectedCurrency: 'USD'})
        this.setState({ price: video.price.toFixed(2) });
      }else if(user?.wallet_icp){
        this.setState({paymentOption: 'plug'});
        this.setState({selectedCurrency: 'ICP'})
        this.setState({ price: contentPriceICP });
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

  async checkContentExistsICP(){
    const { video, settings } = this.props;
    let identity;
    const authClient = await AuthClient.create();
    const ppvCanID = settings.icPPV;
    const host = settings.icHost;
    let agent;
    let ppvActor;

    if (settings.icNetwork !== true) {
      identity = authClient.getIdentity();
      agent = new HttpAgent({
        identity,
        host
      });

      await agent.fetchRootKey();
      ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
        agent,
        canisterId: ppvCanID
      });
      let result: Array<Content> = await ppvActor.getContent(video?._id);
      if (result.length > 0 && result[0].price) {
        // message.error('This content has not been registered on-chain. Crypto purchases for this content are not available. Purchase with USD instead.');
        this.setState({ isContentICP: true });
      }

    } else {
      identity = authClient.getIdentity();
      agent = new HttpAgent({
        identity,
        host
      });

      ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
        agent,
        canisterId: ppvCanID
      });

      let result: Content = await ppvActor.getContent(video?._id);
      if(result[0].price){
        // message.error('This content has not been registered on-chain. Crypto purchases for this content are not available. Purchase with USD instead.');
        this.setState({ isContentICP: true });
      }else{
        message.info("This artist has disabled crypto payments for this piece of content.")
      }
    }
  }

  changeTicker(val: string){
    const {isContentICP} = this.state;
    const { video, contentPriceICP, contentPriceCKBTC, contentPriceTRAX } = this.props;

    this.setState({selectedCurrency: val})
    val !== 'USD' ? this.setState({paymentOption: 'plug'}) : this.setState({paymentOption: 'card'});

    if (val === 'USD') {
      this.setState({ price: video.price.toFixed(2) });
      
    } else if (val === 'ICP') {
      if(!isContentICP){
        message.info("This artist has disabled crypto payments for this piece of content.")
      }
      this.setState({ price: contentPriceICP });
      
    } else if (val === 'ckBTC') {
      if(!isContentICP){
        message.info("This artist has disabled crypto payments for this piece of content.")
      } 
      this.setState({ price: contentPriceCKBTC });
    } else if (val === 'TRAX') {
      if(!isContentICP){
        message.info("This artist has disabled crypto payments for this piece of content.")
      } 
      this.setState({ price: contentPriceTRAX });
    }
  }

  changePaymentOption(val: string){
    const {selectedCurrency} = this.state;
    this.setState({paymentOption: val})
    val !== 'card' ?this.setState({selectedCurrency: 'ICP'}) : this.setState({selectedCurrency: 'USD'});
  }

  changeShortcut(val: number, custom: boolean){
    const {selectedCurrency} = this.state;
    this.setState({priceBtn: val});
    this.setState({custom: custom});
  }

  render() {
    const {
      onFinish, submiting = false, performer, video, isPriceICPLoading, contentPriceICP, user
    } = this.props;
    const {
      currencies, selectedCurrency, price, cards, loading, paymentOption, isContentICP
    } = this.state;

    return (
      <div className={styles.componentsPerformerVerificationFormModule}>

        <div className='send-tip-container'>
          <div className='tip-header-wrapper'>
            <span>Unlock content</span>
          </div>
          
          <div className='payment-details'>
         
          <div className='payment-recipient-wrapper'>
              <div className='payment-recipient-avatar-wrapper'>
                <Avatar src={performer?.avatar || '/static/no-avatar.png'} />
              </div>
              <div className='payment-recipient-info'>
                <p>Pay to</p>
                <span>{performer?.name}</span>
                  <p style={{color: '#FFFFFF50', marginTop:'-0.125rem'}}>Verified Artist</p>
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
            {user.wallet_icp && isContentICP &&(
              <>
            <Option value="plug" key="plug" className="payment-type-option-content">
              <div className='payment-type-img-wrapper'>
                <img src='/static/plug-favicon.png' width={40} height={40}/>
              </div>
              <div className='payment-type-info'>
                <span>Plug wallet</span>
                  <p>{`**** **** **** -a3eio`}</p>
                  <p>Internet Computer</p>
              </div>
            </Option>

            <Option value="II" key="II" className="payment-type-option-content">
              <div className='payment-type-img-wrapper'>
                <img src='/static/icp-logo.png' width={40} height={40}/>
              </div>
              <div className='payment-type-info'>
                <span>Internet Identity</span>
                  <p>{`**** **** **** -****`}</p>
                  <p>Internet Computer</p>
              </div>
            </Option>

            <Option value="nfid" key="nfid" className="payment-type-option-content">
              <div className='payment-type-img-wrapper'>
                <img src='/static/nfid-logo-og.png' width={40} height={40} style={{borderRadius: 10}}/>
              </div>
              <div className='payment-type-info'>
                <span>NFID</span>
                  <p>{`**** **** **** -****`}</p>
                  <p>Internet Computer</p>
              </div>
            </Option>
            </>
            )}

            {paymentOption === "noPayment" && (
              <Option value="noPayment" key="noPayment" className="payment-type-option-content">
                <div className='payment-type-img-wrapper'>
                <FontAwesomeIcon style={{width: '2.5rem', height: '2.5rem', color:'orangered'}} icon={faXmark} />
                </div>
                <div className='payment-type-info'>
                  <span style={{marginTop: '0.125rem'}}>Connect payment method</span>
                    <p>Visit the <a style={{color:'#FFF'}}>Settings</a> page to connect</p>
                    {/* <p>Click to add crypto wallet</p> */}
                </div>
              </Option>
            )}
          </Select>
            
            
          </div>
          <div className='currency-picker-btns-container'>
            
            <div className='currency-picker-btns-wrapper'>
            {cards.length > 0 && (
              <div className='currency-picker-btn-wrapper' onClick={(v)=> this.changeTicker('USD')}>
                <img src='/static/usd-logo.png' width={40} height={40} style={{border: selectedCurrency === 'USD' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
            )}
              {(isContentICP && user.wallet_icp) &&(
                <>
                
                  <div className='currency-picker-btn-wrapper' onClick={(v)=> this.changeTicker('ICP')}>
                    <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                  </div>
                  {/* className={`${isContentICP ? 'currency-picker-btn-wrapper' : 'currency-picker-btn-wrapper-disabled'} `} */}
                  <div className='currency-picker-btn-wrapper' onClick={(v)=> this.changeTicker('ckBTC')}>
                    <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                  </div>
                  <div className='currency-picker-btn-wrapper' onClick={(v)=> this.changeTicker('TRAX')}>
                    <img src='/static/trax-token.png' width={40} height={40} style={{border: selectedCurrency === 'TRAX' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                  </div>
                </>
              )}
              
            </div>
          </div>
          <div className='tip-input-number-container'>
            <span>Total</span>
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
                stringMode
                step="0.01"
                value={price}
                placeholder="0.00"
                className='tip-input-number'
              />
            </div>
          </div>
          <Button
              className="tip-button"
              disabled={submiting || (selectedCurrency === 'ICP' && !video.isCrypto) || (selectedCurrency === 'ckBTC' && !video.isCrypto) || paymentOption === 'noPayment'}
              loading={submiting}
              onClick={() => onFinish(selectedCurrency, paymentOption)}
            >
              Unlock
            </Button>
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  settings: { ...state.settings }
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(PPVPurchaseModal);
