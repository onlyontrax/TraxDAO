/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICountry } from '@interfaces/index';
import {
  Button, Col, Form, Input, Row, Select, message
} from 'antd';
import Image from 'next/image';
import { useRef, useState } from 'react';

const citystatejson = require('countrycitystatejson');

interface IProps {
  submiting: boolean;
  onFinish: Function;
  countries: ICountry[];
  onCancel: Function;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

export function ShippingAddressForm({
  submiting, onFinish, countries, onCancel
}: IProps) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [addressName, setAddressName] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [description, setDescription] = useState('')

  const formRef = useRef() as any;

  const handleGetCountries = async (countryCode: string) => {
    if (!countryCode) return;
    const data = await citystatejson.getStatesByShort(countryCode);
    setStates(data);
    setCountry(countryCode)
  };

  const handleGetStates = async (state: string) => {
    if (!state || !country) {
      return;
    }
    const data = await citystatejson.getCities(country, state);
    setCities(data);
   
    setState(state)
    // setState()
  };

  return (
    <Form
      ref={formRef}
      {...layout}
      onFinish={(data) => {
        data.name = addressName;
        data.country = country;
        data.state = state;
        data.city = city;
        data.zipCode = zipCode;
        data.streetAddress = streetAddress;
        data.streetNumber = streetNumber;
        data.description = description;
        onFinish(data)
      }}
      onFinishFailed={() => message.error('Please complete the required fields')}
      name="form-address"
      className="shipping-address-form"
    >
      <Row >
        <Col md={12} xs={12}>
          <div className='address-label'>
            <span>Address name</span>
            <Input className='address-input' onChange={(e) => setAddressName(e.target.value)}  />
          </div>
        </Col>

          <Col md={12} xs={12}>
            <div className='address-label'>
              <span>Country</span>
              <Select className='address-select' showSearch optionFilterProp="label" onChange={(code: string) => handleGetCountries(code)}>
                {countries.map((c) => (
                  <Select.Option value={c.code} label={c.name} key={c.code} className='address-option'>
                    <Image alt="country_flag" src={c.flag} width={25} height={25} style={{ width: '25px' }} />
                    {' '}
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

        <Col md={12} xs={12}>
          <div className='address-label'>
              <span>State/County</span>
            <Select
              showSearch
              className='address-select'
              optionFilterProp="label"
              onChange={(s: string) => handleGetStates(s)}
              
            >
              <Select.Option value="n/a" key="N/A" className='address-option'>
                N/A
              </Select.Option>
              {states.map((s) => (
                <Select.Option value={s} label={s} key={s} className='address-option'>
                  {s}
                </Select.Option>
              ))}
            </Select>
         </div>
        </Col>


        <Col md={12} xs={12}>
          <div className='address-label'>
            <span>City/Town</span>
            <Input className='address-input' onChange={(e)=> setCity(e.target.value)}/>
          </div>
        </Col>
        <Col md={12} xs={12}>
        <div className='address-label'>
            <span>Postal code</span>
            <Input className='address-input' onChange={(e)=> setZipCode(e.target.value)}/>
          </div>
        </Col>

        <Col md={12} xs={12}>
        <div className='address-label'>
            <span>Street Number</span>
            <Input className='address-input' onChange={(e)=> setStreetNumber(e.target.value)}/>
          </div>
        </Col>
        <Col md={12} xs={12}>
          <div className='address-label'>
            <span>Street address</span>
            <Input className='address-input' onChange={(e)=> setStreetAddress(e.target.value)}/>
          </div>
        </Col>
        <Col md={24} xs={24}>
        <div className='address-label'>
            <span>Description</span>
            <Input.TextArea className='address-input' onChange={(e)=> setDescription(e.target.value)}/>
          </div>
        </Col>
      </Row>
      <div className="text-center add-address-btn-wrapper">
        <Button
          htmlType="submit"
          className="save-shipping-btn"
          loading={submiting}
          disabled={submiting}
        >
          Save
        </Button>
        <Button className="cancel-shipping-btn" onClick={() => onCancel()}>
          Cancel
        </Button>
      </div>
    </Form>
  );
}
