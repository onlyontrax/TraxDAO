import { IFeed, ISettings } from '@interfaces/index';
import {
  Avatar, Button, Form, Select, InputNumber, Input, message
} from 'antd';
import { connect } from 'react-redux';
import {
  LoadingOutlined
} from '@ant-design/icons';
import { PureComponent } from 'react';
import { TickIcon } from 'src/icons';
import styles from './index.module.scss';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { paymentService } from '@services/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import { getResponseError } from '@lib/utils';
import {
  tokenTransctionService
} from '@services/index';
const { Option } = Select;

interface IProps {
  feed: IFeed;
  settings: ISettings;
  onFinish: Function;
  submiting: boolean;
}

class PurchaseFeedForm extends PureComponent<IProps> {
  state = {
    price: 0,
    // currency: 'fiat',
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
    ckbtcPrice: 0,
    amountICPToDisplay: '',
    amountICP: '',
    isPriceICPLoading: true,
    priceBtn: 1,
    custom: false,
    cards: [],
    loading: false,
    paymentOption: 'noPayment'
  }

  async componentDidMount() {
    const { feed, settings } = this.props;
    await this.getData()
    let identity;
    const authClient = await AuthClient.create();
    const host = settings.icHost;
    let agent;

    if (settings.icNetwork !== true) {
      identity = authClient.getIdentity();
      agent = new HttpAgent({
        identity,
        host
      });

      await agent.fetchRootKey();
    } else {
      identity = await authClient.getIdentity();
      agent = new HttpAgent({
        identity,
        host
      });
    }

    const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
    const amountToSendICP = feed.price / parseFloat(icp);

    this.setState({
      priceICP: icp,
      amountICPToDisplay: amountToSendICP.toFixed(2).toString(),
      amountICP: amountToSendICP,
      isPriceICPLoading: false
    });
    this.setState({ price: feed.price.toFixed(2) });
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
  }

  render() {
    const { onFinish, submiting = false, feed } = this.props;
    const { currencies, selectedCurrency, isPriceICPLoading, amountICPToDisplay, icpPrice, price, custom, cards, loading, paymentOption, priceBtn } = this.state;

    return (
      <div className={styles.componentsPostConfirmPurchaseModule}>

          <div className='send-tip-container'>
          <div className='tip-header-wrapper'>
            <span>Unlock content</span>
          </div>
          
          <div className='payment-details'>
          
          <div className='payment-recipient-wrapper'>
              <div className='payment-recipient-avatar-wrapper'>
                <Avatar src={feed?.performer?.avatar || '/static/no-avatar.png'} />
              </div>
              <div className='payment-recipient-info'>
                <p>Pay to</p>
                <span>{feed?.performer?.name}</span>
                  <p style={{color: '#c8ff02'}}>Verified Artist</p>
              </div>
              <a href={`/artist/profile?id=${feed?.performer?.username || feed?.performer?._id}`} className='info-icon-wrapper'>
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
                  <p>{`**** **** **** -****`}</p>
                  <p>Internet Computer</p>
              </div>
            </Option>
            <Option disabled={true} value="nfid" key="nfid" className="payment-type-option-content">
              <div className='payment-type-img-wrapper'>
                <img src='/static/nfid-logo-og.png' width={40} height={40} style={{borderRadius: 10}}/>
              </div>
              <div className='payment-type-info'>
                <span>NFID</span>
                  <p>{`**** **** **** -****`}</p>
                  <p>Internet Computer</p>
              </div>
            </Option> */}

            {paymentOption === "noPayment" && (
              <Option value="noPayment" key="noPayment" className="payment-type-option-content">
                <div className='payment-type-img-wrapper'>
                <FontAwesomeIcon style={{width: 40, height: 40}} icon={faXmark} />
                </div>
                <div className='payment-type-info'>
                  <span style={{}}>Connect payment method</span>
                    <p>Visit the Settings page to connect</p>
                    {/* <p>Click to add crypto wallet</p> */}
                </div>
              </Option>
            )}
          </Select>
            
            
          </div>
          <div className='currency-picker-btns-container'>
            
            <div className='currency-picker-btns-wrapper'>
            {cards.length > 0 && (
              <div className='currency-picker-btn-wrapper' onClick={()=> this.changeTicker('USD')}>
                <img src='/static/usd-logo.png' width={40} height={40} style={{border: selectedCurrency === 'USD' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
            )}
              {/* <div className='currency-picker-btn-wrapper-disabled' >
                <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper-disabled' >
                <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper-disabled' >
                <img src='/static/trax-token.png' width={40} height={40} />
              </div> */}
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
                value={feed?.price}
                placeholder="0.00"
                className='tip-input-number'
              />
            </div>
          </div>
          <Button
              className="tip-button"
              disabled={submiting || paymentOption === 'noPayment'}
              loading={submiting}
              onClick={() => {
                selectedCurrency === 'USD' ? onFinish(false) : onFinish(true);
              }}
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
export default connect(mapStates, mapDispatch)(PurchaseFeedForm);
