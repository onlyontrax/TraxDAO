import { useEffect, useRef, useState } from 'react';
import {
  Button, Form, Input, message, InputNumber, Select, Image, Avatar
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ICountry, ITicket, IPerformer, IAddress, IUser } from '@interfaces/index';
import { shippingAddressService, tokenTransctionService } from 'src/services';
// import { ShippingAddressForm } from './shipping-address-form';
import styles from './ticket.module.scss';
import { performerService } from 'src/services';
import { TbBorderRadius } from 'react-icons/tb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import { paymentService } from '@services/index';
import { getResponseError } from '@lib/utils';
import { icpPrice } from 'src/crypto/live-price-oracle';

const { Option } = Select;
interface IProps {
  submiting: boolean;
  ticket: ITicket;
  onFinish: Function;
  countries: ICountry[];
  user: IUser;
  performer: IPerformer
};

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const currencies = [
  { name: 'USD', imgSrc: '/static/usd-logo.png', symbol: 'USD' },
  { name: 'ICP', imgSrc: '/static/icp-logo.png', symbol: 'ICP' },
  { name: 'ckBTC', imgSrc: '/static/ckbtc_nobackground.svg', symbol: 'ckBTC' }
]

export function PurchaseTicketForm({
  submiting, ticket, onFinish, countries, user, performer
}: IProps) {
  const image = ticket?.image || '/static/no-image.jpg';
  const [quantity, setQuantity] = useState(1);
  const [addresses, setAddresses] = useState<any>([]);
  const [isNewAddress, setNewAddress] = useState(false);
  const [loading, setSubmiting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedShipping, setSelectedShipping] = useState('');
  const [price, setPrice] = useState(0);
  const [icpRate, setIcpRate] = useState(0);
  const [ckbtcRate, setCkbtcRate] = useState(0);
  const [traxRate, setTRAXRate] = useState(0);
  const [selectedTier, setSelectedTier] = useState({name: '', supply: 0, price: 0});
  const [paymentOption, setPaymentOption] = useState('')
  const [cards, setCards] = useState([]);


  const formRef = useRef() as any;

  const handleChangeQuantity = (q: number) => {
    if (q < 1) return;

   if(selectedCurrency === 'ICP'){
    setPrice(Number((selectedTier.price / icpRate).toFixed(4)) * q);
   }
   if(selectedCurrency === 'ckBTC'){
    setPrice(Number((selectedTier.price / ckbtcRate).toFixed(8)) * q);
   }
   if(selectedCurrency == 'USD'){
    setPrice(selectedTier.price * q);
   }
   if(selectedCurrency == 'TRAX'){
    setPrice(Number((selectedTier.price / traxRate).toFixed(5)) * q);
   }
    setQuantity(q);
  };

  useEffect(() => {
    onLoadHandleTierSelection();

    async function fetchCardData(){
      await getData();
    }

    const getRates = async () =>{

      const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
      const ckbtc = (await tokenTransctionService.getExchangeRateBTC()).data.rate;
      const trax = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;

      // const icp = 15;
      // const ckbtc = 70000;
      // const trax = 0.028;


      setIcpRate(icp);
      setCkbtcRate(ckbtc);
      setTRAXRate(trax);
    };

    fetchCardData().catch(console.error);
    getRates().catch(console.error);

  }, []);


  const onLoadHandleTierSelection = () => {
    for(let i = 0; i < ticket.tiers.length; i++){
      if(Number(ticket.tiers[i].supply) > 0){
        setSelectedTier(ticket.tiers[i]);
        break;
      }
    }
  }

  const changeTicker = (val: string) => {
    setSelectedCurrency(val);
    if(val === 'USD'){
      setPaymentOption('card');
      setPrice(selectedTier.price * quantity);
    }
    if(val === 'ICP'){
      setPaymentOption('plug');
      setPrice(Number((selectedTier.price / icpRate).toFixed(4)) * quantity);
    }
    if(val === 'ckBTC'){
      setPaymentOption('plug');
      setPrice(Number((selectedTier.price / ckbtcRate).toFixed(8)) * quantity);
    }
    if(val === 'TRAX'){
      setPaymentOption('plug');
      setPrice(Number((selectedTier.price / traxRate).toFixed(5)) * quantity);
    }
  }

  const changePaymentOption = (val) => {
    setPaymentOption(val);
    // val !== 'card' ? setSelectedCurrency('ICP') : setSelectedCurrency('USD');


    if(val === 'card'){
      setSelectedCurrency('USD');
      setPrice(selectedTier.price * quantity);
    }
    if(val !== 'card'){
      setSelectedCurrency('ICP');
      setPrice(Number((selectedTier.price / icpRate).toFixed(4)) * quantity);
    }
  }


  const getData = async () => {

    try {
      setSubmiting(true);
      const resp = await paymentService.getStripeCards();
      if(resp.data.data.length > 0){
        setPaymentOption('card');
        setSelectedCurrency('USD');
        for(let i = 0; i < ticket.tiers.length; i++){
          //@ts-ignore
          if(Number(ticket.tiers[i].totalSupply) > 0){
            setPrice(ticket.tiers[i].price);
            break;
          }
        }

      }else if(user.account?.wallet_icp){
        setPaymentOption('plug');
        setSelectedCurrency('ICP');

        for(let i = 0; i < ticket.tiers.length; i++){
          if(Number(ticket.tiers[i].supply) > 0){
            setPrice(Number((selectedTier.price / icpRate).toFixed(3)));
            break;
          }
        }
      }else{
        setPaymentOption('onPayment');
      }

      setCards(resp.data.data.map((d) => {
          if (d.card) return { ...d.card, id: d.id };
          if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
          return d;
        })
      );
    } catch (error) {
      message.error(getResponseError(await error) || 'An error occured. Please try again.');
    } finally {
      setSubmiting(false);
    }
  }

  const handleSelectTier = (val) => {
    ticket.tiers.map((t)=>{
      if(t.name === val){
        setSelectedTier(t)
        selectedCurrency === 'ICP' && setPrice(Number((t.price / icpRate).toFixed(3)) * quantity);
        selectedCurrency === 'ckBTC' && setPrice(Number((t.price / ckbtcRate).toFixed(8)) * quantity);
        selectedCurrency === 'TRAX' && setPrice(Number((t.price / traxRate).toFixed(5)) * quantity);
        selectedCurrency === 'USD' && setPrice(t.price * quantity);
      }
    })
  };

  return (
    <div className={styles.componentsticketModule}>


      <div className='send-tip-container'>
        <div className='tip-header-wrapper'>
          <span>Purchase ticket</span>
          {/* <p>Support this creator on their journey</p> */}
        </div>
      <Form
        ref={formRef}
        {...layout}
        onFinish={(values) => {
          let data = values;
          data.currency = selectedCurrency;
          data.tier = selectedTier;
          data.quantity = quantity;
          data.paymentOption = paymentOption;
          data.price = price;
          data.wallet_address = performer.account?.wallet_icp;

          onFinish.bind(this)({ ...data})
        }}
        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-order"
        initialValues={{
          quantity: 1,
          price: price,
          currencyOption: selectedCurrency
        }}
        className=""
      >



        <div className='payment-details'>
          {/* <span>Payment details</span> */}
          <div className='payment-recipient-wrapper'>
              <div className='payment-recipient-avatar-wrapper'>
                <Avatar src={performer?.avatar || '/static/no-avatar.png'} />
              </div>
              <div className='payment-recipient-info'>
                <p>Pay to</p>
                <span>{performer?.name}</span>
                  <p style={{color: '#c8ff02'}}>Verified Artist</p>
              </div>
              <a href={`/artist/profile/?id=${performer?.username || performer?._id}`} className='info-icon-wrapper'>
                <FontAwesomeIcon style={{color: 'white'}} icon={faCircleInfo} />
              </a>
            </div>
          <Select onChange={(v) => changePaymentOption(v)} defaultValue={paymentOption} value={paymentOption}  className="payment-type-select" style={{height: '100%'}}>
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
            {(user.account?.wallet_icp && performer.account?.wallet_icp) && (
              <>
                <Option value="plug" key="plug" className="payment-type-option-content">
                  <div className='payment-type-img-wrapper'>
                    <img src='/static/plug-favicon.png' width={40} height={40}/>
                  </div>
                  <div className='payment-type-info'>
                    <span>Plug wallet</span>
                      <p>{`${user.account?.wallet_icp.slice(0, 6)} **** ${user.account?.wallet_icp.slice(-4)}`}</p>
                      <p>Internet Computer</p>
                  </div>
                </Option>


                <Option value="II" key="II" className="payment-type-option-content">
                  <div className='payment-type-img-wrapper'>
                    <img src='/static/icp-logo.png' width={40} height={40}/>
                  </div>
                  <div className='payment-type-info'>
                    <span>Internet Identity</span>
                      <p>{`${user.account?.wallet_icp.slice(0, 6)} **** ${user.account?.wallet_icp.slice(-4)}`}</p>
                      <p>Internet Computer</p>
                  </div>
                </Option>



                <Option value="nfid" key="nfid" className="payment-type-option-content">
                  <div className='payment-type-img-wrapper'>
                    <img src='/static/nfid-logo-og.png' width={40} height={40} style={{borderRadius: 10}}/>

                  </div>
                  <div className='payment-type-info'>
                    <span>NFID</span>
                      <p>{`${user.account?.wallet_icp.slice(0, 6)} **** ${user.account?.wallet_icp.slice(-4)}`}</p>
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

        <div className="ticket-tiers-container" style={{marginTop: '1rem'}}>
          {/* <span className='ticket-tier-header'>Select a ticket</span> */}
          {ticket.tiers.map((t, i) => (
            <div
              className={t.name === selectedTier.name ? 'ticket-selected' : 'ticket-tiers-wrapper'}
              onClick={() => handleSelectTier(t.name)}
              style={{borderTopRightRadius: `${i == 0 ? '7px' : '0px'}`, borderTopLeftRadius: `${i == 0 ? '7px' : '0px'}`, borderBottomRightRadius: `${i == ticket.tiers.length -1 ? '7px' : '0px'}`, borderBottomLeftRadius: `${i == ticket.tiers.length -1 ? '7px' : '0px'}`}}>

                <div className={Number(t.supply) === 0 ? 'ticket-tier-name-sold-out' : 'ticket-tier-name'}>
                    <span>{t.name}</span>
                </div>
                {/* <div className={Number(t.supply) === 0 ? 'ticket-tier-supply-sold-out' : 'ticket-tier-supply'}>
                    <span>{t.supply}</span>
                </div> */}
                <div className={Number(t.supply) === 0 ? 'ticket-tier-price-sold-out' : 'ticket-tier-price'}>
                    <span>${t.price}</span>
                </div>
            </div>
          ))}
        </div>

        <div className='currency-picker-btns-container' style={{marginTop: '1rem'}}>
          {/* <span>Select a currency</span> */}
          <div className='currency-picker-btns-wrapper'>
            {cards.length > 0 && (
            <div className='currency-picker-btn-wrapper' onClick={(v)=> changeTicker('USD')}>
              <img src='/static/usd-logo.png' width={40} height={40} style={{border: selectedCurrency === 'USD' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
            </div>
            )}
            {(user.account?.wallet_icp && performer.account?.wallet_icp) && (
              <>
                <div className='currency-picker-btn-wrapper' onClick={()=> changeTicker('ICP')}>
                  <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                </div>
                <div className='currency-picker-btn-wrapper' onClick={()=> changeTicker('ckBTC')}>
                  <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                </div>
                <div className='currency-picker-btn-wrapper' onClick={()=> changeTicker('TRAX')}>
                  <img src='/static/trax-token.png' width={40} height={40} style={{border: selectedCurrency === 'TRAX' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                </div>
              </>
            )}
          </div>
        </div>

        <div className='select-quantity-container' style={{marginTop: '1rem'}}>
          <span>Select quantity</span>
          <InputNumber
                type="number"
                value={quantity}
                max={Number(selectedTier.supply)}
                placeholder="1"
                className='quantity-input'
                stringMode
                step="1"
                onChange={(e) => handleChangeQuantity(e)}
              />
        </div>



        <div className='tip-input-number-container' style={{marginTop: '1rem'}}>
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
              {selectedCurrency === 'TRAX' && (
                <img src='/static/trax-token.png' width={40} height={40}/>
              )}
              <InputNumber
                disabled={true}
                type="number"
                value={price}
                placeholder="0.00"
                className='tip-input-number'
                stringMode
                step="0.01"
              />
              {selectedCurrency === 'ICP' && (
                <span className='usd-conversion'>~${(price * icpRate).toFixed(2)}</span>
              )}
              {selectedCurrency === 'ckBTC' && (
                <span className='usd-conversion'>~${(price * ckbtcRate).toFixed(2)}</span>
              )}
              {selectedCurrency === 'TRAX' && (
                <span className='usd-conversion'>~${(price * traxRate).toFixed(2)}</span>
              )}
            </div>
          </div>

          <Button
            htmlType="submit"
            className="tip-button"
            disabled={loading || paymentOption === 'noPayment' || (Number(selectedTier.supply) < quantity)}
            loading={loading}
          >
            <span>Confirm</span>

          </Button>

      </Form>
      </div>
    </div>
  );
}
