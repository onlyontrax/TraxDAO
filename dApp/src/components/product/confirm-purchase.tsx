import { useEffect, useRef, useState } from 'react';
import {
  Button, Form, Input, message, InputNumber, Select, Image
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ICountry, IProduct, IPerformer, IAddress, IUser } from '@interfaces/index';
import { shippingAddressService, tokenTransctionService } from 'src/services';
import { ShippingAddressForm } from './shipping-address-form';
import styles from './product.module.scss';
import { performerService } from 'src/services';
import { TbBorderRadius } from 'react-icons/tb';

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
  const [loading, setSubmiting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedShipping, setSelectedShipping] = useState('');
  const [priceICP, setPriceICP] = useState(0);
  const [priceCKBTC, setPriceCKBTC] = useState(0);
  const [priceUSD, setPriceUSD] = useState(0);

  const changeTicker = (val: any) => {

    for(let i = 0; i < currencies.length; i++){
      if(val === currencies[i].name){
        setSelectedCurrency(currencies[i].name);
      }
    }
  }

  const changeShipping = async (val: any) => {
    let fee = product.shippingFees.find((fee) => fee.type === val)?.fee
    const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
    const ckbtc = (await tokenTransctionService.getExchangeRateBTC()).data.rate;
      setPriceICP((fee / parseFloat(icp)) +  priceICP);
      setPriceCKBTC((fee / parseFloat(ckbtc)) +  priceCKBTC);
      setPriceUSD(fee +  priceUSD);
  }

  const formRef = useRef() as any;

  const handleChangeQuantity = (q: number) => {
    if (q < 1) return;
    if (product.stock < q) {
      message.error('Quantity is out of product stock!');
      return;
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

    const getRates = async () =>{
      const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
      const ckbtc = (await tokenTransctionService.getExchangeRateBTC()).data.rate;

      setPriceICP(product.price / parseFloat(icp));
      setPriceCKBTC(product.price / parseFloat(ckbtc));
      setPriceUSD(product.price);

    };

    getRates().catch(console.error);
  }, []);

  return (
    <div className={styles.componentsproductModule}>
      {!isNewAddress && (
      <div className="text-center">
        <h3 className="secondary-color" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>
          {product?.name}
        </h3>
        <img alt="p-avt" src={image} style={{ width: '150px', borderRadius: '5px', marginBottom: '20px' }} />
      </div>
      )}
      {!isNewAddress && (
      <Form
        ref={formRef}
        {...layout}
        onFinish={(data) => onFinish.bind(this)({ ...data, shippingFee: product.shippingFees.find((fee) => fee.type === data.shippingOption)?.fee, amountToSendICP: priceICP, amountToSendCKBTC: priceCKBTC })}
        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-order"
        initialValues={{
          quantity: 1,
          userNote: '',
          phoneNumber: '',
          currencyOption: selectedCurrency
        }}
        className="account-form"
      >
        {product.type === 'physical' && (
        <>
          <Form.Item
            name="quantity"
            rules={[{ required: true, message: 'Please input quantity of product' }]}
            label="Quantity"
          >
            <InputNumber className='register-input' onChange={handleChangeQuantity} min={1} max={product.stock} style={{ width: '100%', background: '#222323' }} />
          </Form.Item>
          <Form.Item
            name="deliveryAddressId"
            rules={[{ required: true, message: 'Please select delivery address!' }]}
            label="Delivery address"
          >

            <Button.Group style={{ width: '100%', overflow: 'auto' }}>
              <Select className='register-switch' defaultActiveFirstOption onChange={(val: string) => formRef.current.setFieldsValue({ deliveryAddressId: val })}>
                {addresses.map((a: IAddress) => (
                  <Select.Option value={a._id} key={a._id}>
                    <div className="address-option">
                      {a.name}
                      {' '}
                      -
                      {' '}
                      <small>{`${a.streetNumber} ${a.streetAddress}`}</small>
                      <a aria-hidden className="delete-btn" onClick={() => deleteAddress(a._id)}><DeleteOutlined /></a>
                    </div>
                  </Select.Option>
                ))}
              </Select>
              {addresses.length < 10 && <Button onClick={() => setNewAddress(true)} className="primary add-address-btn"><PlusOutlined /></Button>}
            </Button.Group>
          </Form.Item>
          <Form.Item
            name="shippingOption"
            label="Shipping Option"
            rules={[
              { required: true, message: 'Please select shipping option' }
            ]}
          >
            <Select className='register-switch' onChange={(v) => changeShipping(v)} defaultActiveFirstOption>
              {product.shippingFees.map((fee) => (
                <Select.Option key={fee.type} value={fee.type}>
                  { `${fee.type} $${fee.fee}` }
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone number (including country code)"
            rules={[
              { required: true, message: 'Please enter your phone number!' },
              {
                pattern: /^([+]\d{2,4})?\d{9,12}$/g, message: 'Please provide valid digit numbers'
              }
            ]}
          >
            <Input className='register-input' placeholder="Phone number (+447101234567)" />
          </Form.Item>
          <Form.Item
            name="userNote"
            label="Comments"
          >
            <Input.TextArea className='register-input' rows={2} />
          </Form.Item>

          {performer?.wallet_icp && user?.wallet_icp && (
            <Form.Item
              name="currencyOption"
              label="Currency"
              rules={[{ required: true}]}
            >
              <Select className='register-switch' onChange={(v) => changeTicker(v)} defaultValue={selectedCurrency}  optionFilterProp="label">
                {currencies.map((c) => (
                  <Option value={c.symbol} key={c.symbol} label={c.name}>
                    <img alt="currency_flag" className="currency-flag" src={c.imgSrc} width="25px" />
                    {' '}
                    <span className="currency-symbol">{c.name}</span>
                  </Option>

                ))}
              </Select>
            </Form.Item>
          )}
        </>
        )}
        {product.type === 'digital' && (
          <>
            <Form.Item
              name="currencyOption"
              label="Currency"
              rules={[{ required: true}]}
            >
              <Select className='register-switch' onChange={(v) => changeTicker(v)} defaultValue={selectedCurrency}  optionFilterProp="label">
                {currencies.map((c) => (
                  <Option value={c.symbol} key={c.symbol} label={c.name} disabled={c.name === "ICP" || c.name === "ckBTC"} >
                    <img alt="currency_flag" className="currency-flag" src={c.imgSrc} width="25px" />
                    {' '}
                    <span className="currency-symbol">{c.name}</span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
        <div className="text-center">
          <Button
            htmlType="submit"
            className="primary tip-button"
            type="primary"
            loading={submiting}
            disabled={submiting || (product.type === 'physical' && product.stock < quantity)}
          >
            <span>Confirm purchase for&nbsp;</span>
            {currencies.map((v)=>(
              (v.name === selectedCurrency && (
                <img alt="currency_flag" className="currency-flag-product" src={v.imgSrc} width="25px" />
              ))
            ))}
            <span>&nbsp;
            {selectedCurrency === "USD" && (quantity * priceUSD).toFixed(2)}
            {selectedCurrency === "ICP" && (quantity * priceICP).toFixed(4)}
            {selectedCurrency === "ckBTC" && quantity * priceCKBTC}
            </span>
          </Button>
        </div>
      </Form>
      )}
      {isNewAddress && (
      <div className="text-center">
        <h3 className="secondary-color">
          Save your address for the future use
        </h3>
      </div>
      )}
      {isNewAddress && <ShippingAddressForm onCancel={() => setNewAddress(false)} submiting={loading} onFinish={addNewAddress} countries={countries} />}
    </div>
  );
}
