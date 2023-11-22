import {
  Button,
  Col,
  Form, Input,
  Row,
  Select
} from 'antd';
import Image from 'next/image';
import { PureComponent, createRef } from 'react';
import { ICountry, IPerformer } from 'src/interfaces';
import { utilsService } from 'src/services';

const { Option } = Select;
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
    // eslint-disable-next-line no-template-curly-in-string
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
  countries?: ICountry[];
}

export class PerformerBankingForm extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    states: [],
    cities: []
  }

  formRef: any;

  componentDidMount() {
    const { user } = this.props;
    if (user?.bankingInformation?.country) {
      this.handleGetStates(user?.bankingInformation?.country);
      if (user?.bankingInformation?.state) {
        this.handleGetCities(user?.bankingInformation?.state, user?.bankingInformation?.country);
      }
    }
  }

  handleGetStates = async (countryCode: string) => {
    const { user } = this.props;
    const resp = await utilsService.statesList(countryCode);
    await this.setState({ states: resp.data });
    const eState = resp.data.find((s) => s === user?.bankingInformation?.state);
    if (eState) {
      this.formRef.setFieldsValue({ state: eState });
    } else {
      this.formRef.setFieldsValue({ state: '', city: '' });
    }
  }

  handleGetCities = async (state: string, countryCode: string) => {
    const { user } = this.props;
    const resp = await utilsService.citiesList(countryCode, state);
    await this.setState({ cities: resp.data });
    const eCity = resp.data.find((s) => s === user?.bankingInformation?.city);
    if (eCity) {
      this.formRef.setFieldsValue({ city: eCity });
    } else {
      this.formRef.setFieldsValue({ city: '' });
    }
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      onFinish, user, updating, countries
    } = this.props;
    const { states, cities } = this.state;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={user?.bankingInformation}
        labelAlign="left"
        className="account-form"
        ref={(ref) => { this.formRef = ref; }}
      >
        <Row>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              label="First name"
              name="firstName"
              rules={[
                { required: true, message: 'Please input your first name!' }
              ]}
            >
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="lastName"
              label="Last name"
              rules={[
                { required: true, message: 'Please input your last name!' }
              ]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="bankName"
              label="Bank name"
              rules={[
                { required: true, message: 'Please input your bank name!' }
              ]}
            >
              <Input placeholder="Bank name" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="bankAccount"
              label="Bank Account"
              rules={[
                { required: true, message: 'Please input your bank account!' }
              ]}
            >
              <Input placeholder="Bank account" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: 'Please choose country!' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                onChange={(val: string) => this.handleGetStates(val)}
              >
                {countries.map((c) => (
                  <Option key={c.code} value={c.code} label={c.name}>
                    <Image alt="flag" src={c?.flag} style={{ width: '20px' }} />
                    {' '}
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="state" label="State">
              <Select
                placeholder="Select your state"
                optionFilterProp="label"
                showSearch
                onChange={(val: string) => this.handleGetCities(val, this.formRef.getFieldValue('country'))}
              >
                {states.map((state) => (
                  <Option value={state} label={state} key={state}>
                    {state}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="city"
              label="City"
            >
              <Select
                placeholder="Select your city"
                showSearch
                optionFilterProp="label"
              >
                {cities.map((city) => (
                  <Option value={city} label={city} key={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="address" label="Address">
              <Input placeholder="Address" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="bankRouting" label="Bank Routing">
              <Input placeholder="Bank routing" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="bankSwiftCode" label="Bank swift code">
              <Input placeholder="Bank swift code" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className="text-center">
          <Button
            className="ant-btn profile-following-btn-card"
            htmlType="submit"
            loading={updating}
            disabled={updating}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

PerformerBankingForm.defaultProps = {
  updating: false,
  countries: []
} as Partial<IProps>;
