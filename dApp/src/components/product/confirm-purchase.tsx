import { useEffect, useRef, useState } from 'react';
import {
  Button, Form, Input, message, InputNumber, Select, Image, Avatar, Tooltip
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ICountry, IProduct, IPerformer, IAddress, IUser } from '@interfaces/index';
import { shippingAddressService, tokenTransctionService } from 'src/services';
import { ShippingAddressForm } from './shipping-address-form';
// import styles from './product.module.scss';
import { performerService } from 'src/services';
import { TbBorderRadius } from 'react-icons/tb';
import { paymentService } from '@services/index';
import { getResponseError } from '@lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faXmark , faArrowLeft} from '@fortawesome/free-solid-svg-icons'

const { Option } = Select;
interface IProps {
  submiting: boolean;
  product: IProduct;
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

export function PurchaseProductForm({
  submiting, product, onFinish, countries, user, performer
}: IProps) {
  const image = product?.image || '/static/no-image.jpg';
  const [quantity, setQuantity] = useState(1);
  const [addresses, setAddresses] = useState<any>([]);
  const [isNewAddress, setNewAddress] = useState(false);
  const [deliveryAddressId, setDeliveryAddressId] = useState('');
  const [loading, setSubmiting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedShipping, setSelectedShipping] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [priceICP, setPriceICP] = useState(0);
  const [priceCKBTC, setPriceCKBTC] = useState(0);
  const [priceTRAX, setPriceTRAX] = useState(0);
  const [priceUSD, setPriceUSD] = useState(0);
  const [price, setPrice] = useState(0);
  const [cards, setCards] = useState([]);
  const [paymentOption, setPaymentOption] = useState('noPayment')
  const [stage, setStage] = useState(1);
  const [shippingOption, setShippingOption] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [comment, setComment] = useState('');


  const changeShipping = async (val: any) => {
    let fee = product.shippingFees.find((fee) => fee.type === val)?.fee;
    setShippingFee(fee);
    
    setShippingOption(val)
    if(selectedCurrency === 'USD'){
      setPrice((product.price * quantity) + fee);
    }else if(selectedCurrency === 'ICP'){
      setPrice(((product.price * quantity) + fee) / priceICP);
    }else if(selectedCurrency === 'ckBTC'){
      setPrice(((product.price * quantity) + fee) / priceCKBTC);
    }else if(selectedCurrency === 'TRAX'){
      setPrice(((product.price * quantity) + fee) / priceTRAX);
    }else{
      
    }
    // setPriceICP((fee / parseFloat(icp)) +  priceICP);
    // setPriceCKBTC((fee / parseFloat(ckbtc)) +  priceCKBTC);
    // setPriceUSD(fee +  priceUSD);
  }

  const formRef = useRef() as any;


  const handleChangeQuantity = (q: number) => {
    if (q < 1){
      // message.error('You must select a quantity');
      return;
    }
    if (product.stock < q) {
      message.error('Quantity is out of product stock!');
      return;
    }

   if(selectedCurrency === 'ICP'){
    setPrice(Number((((product.price * q) + shippingFee) / priceICP).toFixed(3)));
   }
   if(selectedCurrency === 'ckBTC'){
    setPrice(Number((((product.price * q) + shippingFee) / priceCKBTC).toFixed(8)));
   }
   if(selectedCurrency === 'TRAX'){
    setPrice(Number((((product.price * q) + shippingFee) / priceTRAX).toFixed(4)));
   }
   if(selectedCurrency == 'USD'){
    setPrice((product.price * q) + shippingFee);
   }
    setQuantity(q);
  };

  const getAddresses = async () => {
    const resp = await shippingAddressService.search({ limit: 10 });
    setAddresses(resp?.data?.data || []);
  };

  const addNewAddress = async (payload: any) => {
    try {
      setSubmiting(true);
      const country = countries.find((c) => c.code === payload.country);
      const data = { ...payload, country: country.name };
      const resp = await shippingAddressService.create(data);
      addresses.unshift(resp.data);
      setSubmiting(false);
      setNewAddress(false);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later!');
      setSubmiting(false);
      setNewAddress(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      setSubmiting(true);
      await shippingAddressService.delete(id);
      const index = addresses.findIndex((f) => f._id === id);
      addresses.splice(index, 1);
      setSubmiting(false);
      formRef.current.resetFields(['deliveryAddressId']);
    } catch (e) {
      setSubmiting(false);
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later!');
    }
  };

  useEffect(() => {
    getAddresses();
    product.type === 'physical' ? setStage(1) : setStage(2);

    const getRates = async () => {
      await getData();
      const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
      const ckbtc = (await tokenTransctionService.getExchangeRateBTC()).data.rate;
      const trax = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;
      // const icp = '16.5';
      // const ckbtc = '70000';
      // const trax = '0.20';

      setPriceICP(parseFloat(icp));
      setPriceCKBTC(parseFloat(ckbtc));
      setPriceTRAX(parseFloat(trax));
      setPrice(product.price);
    };

    getRates().catch(console.error);
  }, []);




  const getData = async () => {
    try {
      setSubmiting(true);
      const resp = await paymentService.getStripeCards();
  
      if(resp.data.data.length > 0){
        setPaymentOption('card');
        setSelectedCurrency('USD')
      }else if(user?.wallet_icp){
        setPaymentOption('plug');
        setSelectedCurrency('ICP')
      }else{
        setPaymentOption('noPayment');
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

  // const changeTicker = (val: any) => {
  //   for(let i = 0; i < currencies.length; i++){
  //     if(val === currencies[i].name){
  //       setSelectedCurrency(currencies[i].name);
  //     }
  //   }
  // }

  const changeTicker = (val: string) => {
    setSelectedCurrency(val);
    if(val === 'USD'){
      setPaymentOption('card');
      setPrice((product.price * quantity) + shippingFee);
    }
    if(val === 'ICP'){
      setPaymentOption('plug');
      setPrice(Number((((product.price * quantity) + shippingFee) / priceICP).toFixed(4)));
    }
    if(val === 'ckBTC'){
      setPaymentOption('plug');
      setPrice(Number((((product.price * quantity) + shippingFee) / priceCKBTC).toFixed(8)));
    }
    if(val === 'TRAX'){
      setPaymentOption('plug');
      setPrice(Number((((product.price * quantity) + shippingFee) / priceTRAX).toFixed(4)));
    }
  }

  // const changeTicker = (val: string) => {
  //   // const {priceBtn} = this.state;
  //   setSelectedCurrency(val)
  //   val !== 'USD' ? setPaymentOption('plug') : setPaymentOption('card');
  //   // correctInput(priceBtn, val);
  // }

  const changePaymentOption = (val: string) => {
    // const {priceBtn, selectedCurrency} = this.state;
    setPaymentOption(val);
    // val !== 'card' ? setSelectedCurrency('ICP') : setSelectedCurrency('USD');



    if(val === 'card'){
      setSelectedCurrency('USD');
      setPrice((product.price * quantity) + shippingFee);
    }

    if(val !== 'card'){
      setSelectedCurrency('ICP');
      setPrice(Number((((product.price * quantity) + shippingFee) / priceICP).toFixed(4)));
    }
  }


  return (
    <div className='prod-purchase-container'>
      {!isNewAddress && (
        <div className='prod-image-container'>
      <div className='prod-image-wrapper'>
        {/* <div className='prod-image' style={{backgroundImage: product?.image ? `url('${product?.image}')`: '/static/empty_product.svg'}}/> */}
        <img src={product?.image} alt="" />
      </div>
    </div>
      )}
    
    <div className='send-tip-container'>
      {!isNewAddress && (
        <div className='tip-header-wrapper'>
          <span>Purchase: {product?.name}</span>
        </div>
      )}
          
      {!isNewAddress && (
      <Form
        ref={formRef}
        {...layout}
        onFinish={
          (data) => {
            data.quantity = quantity;
            data.shippingOption = shippingOption;
            data.phoneNumber = phoneNumber;
            data.userNote = comment;
            data.currencyOption = selectedCurrency;
            data.price = price;
            data.deliveryAddressId = deliveryAddressId
            data.paymentOption = paymentOption
            onFinish.bind(this)({ ...data, shippingFee: product.shippingFees.find((fee) => fee.type === data.shippingOption)?.fee })
          }
        }

        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-order"
        initialValues={{
          quantity: 1,
          userNote: '',
          phoneNumber: '',
          currencyOption: selectedCurrency
        }}
        className="purchase-prod-form"
      >

        {product.type === 'physical' && (
        <div className={`${stage === 1 ? 'display-contents' : 'no-display'}`}>
          <div className='select-quantity-container' >
          <span>Select quantity</span>
          <InputNumber
                type="number"
                value={quantity}
                max={product.stock}
                placeholder="1"
                className='quantity-input'
                stringMode
                step="1"
                onChange={(e) => handleChangeQuantity(e)}
              />
        </div>
        <div className='select-delivery-address-container' >
          <span>Delivery address</span>
          <Button.Group style={{ width: '100%', overflow: 'auto' }}>
            {/* onChange={(val: string) => formRef.current.setFieldsValue({ deliveryAddressId: val })} */}
              <Select className='delivery-select' defaultActiveFirstOption onChange={(val: string) => setDeliveryAddressId(val)} style={{maxWidth: '242px'}}>
                {addresses.map((a: IAddress) => (
                  <Select.Option value={a._id} key={a._id}>
                    <div className="address-option">
                      <span>{a.name}</span>
                      {' '}
                      -
                      {' '}
                      <span>{`${a.streetNumber} ${a.streetAddress}`}</span>
                      <a aria-hidden className="delete-btn" onClick={() => deleteAddress(a._id)}><DeleteOutlined /></a>
                    </div>
                  </Select.Option>
                ))}
              </Select>
              {addresses.length < 10 && 
              <Tooltip>
                <Button onClick={() => setNewAddress(true)} className="primary add-address-btn">
                  <PlusOutlined />
                </Button>
              </Tooltip>}
              
            </Button.Group>
        </div>

        <div className='select-shipping-container'>
          <span>Shipping method</span>
          <Select className='shipping-select' onChange={(v) => changeShipping(v)} defaultActiveFirstOption>
              {product.shippingFees.map((fee) => (
                <Select.Option className="shipping-option" key={fee.type} value={fee.type}>
                 <span>{ `${fee.type} $${fee.fee}` }</span>
                </Select.Option>
              ))}
            </Select>
        </div>


          <div className='phone-number-container' >
            <span>Phone number (incl country code)</span>
            <Input className='phone-number-input' placeholder="" onChange={(e)=> setPhoneNumber(e.target.value)}/>
          </div>

          <div className='comment-container' >
            <span>Add a comment</span>
            <Input.TextArea className='comment-input' rows={2} onChange={(e)=> setComment(e.target.value)}/>
          </div>
        </div>
        )}


      <div className={`${stage === 2 ? 'display-contents' : 'no-display'}`}>
        <div className='payment-details'>
          
          <div className='payment-recipient-wrapper'>
              <div className='payment-recipient-avatar-wrapper'>
                <Avatar src={performer?.avatar || '/static/no-avatar.png'} />
              </div>
              <div className='payment-recipient-info'>
                <p>Pay</p>
                <span>{performer?.name}</span>
                  <p style={{color: '#FFFFF50', marginTop:'-0.125rem'}}>Verified Artist</p>
              </div>
              <a href={`/artist/profile?id=${performer?.username || performer?._id}`} className='info-icon-wrapper'>
                <FontAwesomeIcon style={{color: 'white'}} icon={faCircleInfo} />
              </a>
            </div>
          <Select onChange={(v) => changePaymentOption(v)} defaultValue={paymentOption} value={paymentOption}  className="payment-type-select">
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
              <div className='currency-picker-btn-wrapper' onClick={(v)=> changeTicker('USD')}>
                <img src='/static/usd-logo.png' width={40} height={40} style={{border: selectedCurrency === 'USD' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              )}
              {user.wallet_icp && (
                <>
              <div className='currency-picker-btn-wrapper' onClick={(v)=> changeTicker('ICP')}>
                <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper' onClick={(v)=> changeTicker('ckBTC')}>
                <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper' onClick={(v)=> changeTicker('TRAX')}>
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
                <span className='usd-conversion'>~${(price * priceICP).toFixed(2)}</span>
              )}
              {selectedCurrency === 'ckBTC' && (
                <span className='usd-conversion'>~${(price * priceCKBTC).toFixed(2)}</span>
              )}
              {selectedCurrency === 'TRAX' && (
                <span className='usd-conversion'>~${(price * priceTRAX).toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className={`${stage === 1 ? 'display-contents' : 'no-display'}`}>
            <Button
              className="primary tip-button"
              type="primary"
              disabled={submiting || (product.type === 'physical' && product.stock < quantity)}
              onClick={()=> setStage(2)}
            >
              <span>Continue</span>
              
            </Button>
          </div>

          <div className={`${stage === 2 ? 'display-contents' : 'no-display'}`} >
            <div style={{display: 'flex', flexDirection: 'row'}}>

            <div className='back-arrow-prod'>
              {product.type === 'physical' && (
                <FontAwesomeIcon className='sign-up-back-arrow' onClick={()=> setStage(1)} icon={faArrowLeft} />
              )}
            </div>

            <Button
              htmlType="submit"
              className="primary tip-button"
              type="primary"
              loading={submiting}
              disabled={submiting || (product.type === 'physical' && product.stock < quantity)}
            >
              <span>Purchase</span>
              {/* {currencies.map((v)=>(
                (v.name === selectedCurrency && (
                  <img alt="currency_flag" className="currency-flag-product" src={v.imgSrc} width="25px" />
                ))
              ))}
              <span>&nbsp;
              {selectedCurrency === "USD" && (quantity * priceUSD).toFixed(2)}
              {selectedCurrency === "ICP" && (quantity * priceICP).toFixed(4)}
              {selectedCurrency === "ckBTC" && quantity * priceCKBTC}
              </span> */}
            </Button>
            </div>
          </div>
          
        </div>
      </Form>
      )}
      {isNewAddress && (
      <div className="new-address-header-wrapper">
        <span>
          Add a new shipping address
        </span>
      </div>
      )}
      {isNewAddress && <ShippingAddressForm onCancel={() => setNewAddress(false)} submiting={loading} onFinish={addNewAddress} countries={countries} />}
    </div>
    </div>
  );
}
