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
  const formRef = useRef() as any;

  const handleGetStates = async (countryCode: string) => {
    if (!countryCode) return;
    const data = await citystatejson.getStatesByShort(countryCode);
    setStates(data);
  };

  const handleGetCities = async (state: string, countryCode: string) => {
    if (!state || !countryCode) {
      return;
    }
    const data = await citystatejson.getCities(countryCode, state);
    setCities(data);
  };

  return (
    <Form
      ref={formRef}
      {...layout}
      onFinish={(data) => onFinish(data)}
      onFinishFailed={() => message.error('Please complete the required fields')}
      name="form-address"
      className="account-form"
    >
      <Row>
        <Col md={24} xs={24}>
          <Form.Item
            name="name"
            label="Address Name"
            rules={[
              {
                required: true,
                message: 'Please enter address name!'
              }
            ]}
          >
            <Input placeholder="School, home, Work,..." />
          </Form.Item>
        </Col>
        <Col md={12} xs={12}>
          <Form.Item
            name="country"
            label="Country"
            rules={[
              {
                required: true,
                message: 'Please select your country!'
              }
            ]}
          >
            <Select showSearch optionFilterProp="label" onChange={(code: string) => handleGetStates(code)}>
              {countries.map((c) => (
                <Select.Option value={c.code} label={c.name} key={c.code}>
                  <Image alt="country_flag" src={c.flag} layout="fill" objectFit="cover" style={{ width: '25px' }} />
                  {' '}
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col md={12} xs={12}>
          <Form.Item
            name="state"
            label="County/State"
            rules={[
              {
                required: true,
                message: 'Please select your state!'
              }
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              onChange={(s: string) => handleGetCities(s, formRef.current.getFieldValue('country'))}
              placeholder="State/country/province"
            >
              <Select.Option value="n/a" key="N/A">
                N/A
              </Select.Option>
              {states.map((s) => (
                <Select.Option value={s} label={s} key={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col md={12} xs={12}>
          <Form.Item
            name="city"
            label="Town/City"
            rules={[
              {
                required: true,
                message: 'Please select your city!'
              }
            ]}
          >
            <Input placeholder="Town/City" />
          </Form.Item>
        </Col>
        <Col md={12} xs={12}>
          <Form.Item
            name="zipCode"
            label="Zip/Post Code"
            rules={[
              { required: true, message: 'Please provide your zip code' }
            ]}
          >
            <Input placeholder="Zip/Post Code" />
          </Form.Item>
        </Col>

        <Col md={12} xs={12}>
          <Form.Item
            name="streetNumber"
            label="Street Number"
            rules={[
              {
                required: true,
                message: 'Please select your street number!'
              }
            ]}
          >
            <Input placeholder="Street Number" />
          </Form.Item>
        </Col>
        <Col md={12} xs={12}>
          <Form.Item
            name="streetAddress"
            label="Street Address"
            rules={[
              {
                required: true,
                message: 'Please select your street address!'
              }
            ]}
          >
            <Input placeholder="Street Address" />
          </Form.Item>
        </Col>
        <Col md={24} xs={24}>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Description" />
          </Form.Item>
        </Col>
      </Row>
      <div className="text-center add-address-btn-wrapper">
        <Button
          style={{ marginTop: '0px !important' }}
          htmlType="submit"
          className="primary submit-content-green"
          type="primary"
          loading={submiting}
          disabled={submiting}
        >
          Save
        </Button>
        <Button className="secondary submit-content" onClick={() => onCancel()}>
          Cancel
        </Button>
      </div>
    </Form>
  );
}
