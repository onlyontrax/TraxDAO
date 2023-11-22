/* eslint-disable no-template-curly-in-string */
import {
  Button,
  Form,
  Select
} from 'antd';
import Image from 'next/image';
import { PureComponent } from 'react';
import { IBlockCountries, ICountry } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  },
  number: {
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: Function;
  blockCountries?: IBlockCountries;
  updating?: boolean;
  countries?: ICountry[];
}

const { Option } = Select;

export class PerformerBlockCountriesForm extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      onFinish, blockCountries, updating, countries
    } = this.props;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={blockCountries}
        labelAlign="left"
        className="account-form"
      >
        <Form.Item name="countryCodes">
          <Select
            showSearch
            optionFilterProp="label"
            mode="multiple"
          >
            {countries
                  && countries.length > 0
                  && countries.map((c) => (
                    <Option value={c.code} label={c.name} key={c.code}>
                      <Image alt="country_flag" src={c.flag} style={{ width: '25px' }} />
                      {' '}
                      {c.name}
                    </Option>
                  ))}
          </Select>
        </Form.Item>
        <Form.Item className="text-left">
          <Button type="primary" htmlType="submit" className="ant-primary-btn" loading={updating}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

PerformerBlockCountriesForm.defaultProps = {
  blockCountries: {} as IBlockCountries,
  updating: false,
  countries: []
} as Partial<IProps>;
