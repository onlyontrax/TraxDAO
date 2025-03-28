import React, { PureComponent } from 'react';
import { Form } from 'antd';
import { IPerformer, IAccount } from 'src/interfaces';
import TraxButton from '@components/common/TraxButton';
import TraxInputField from '@components/common/layout/TraxInputField';
import { Mail } from 'lucide-react';

interface IProps {
  onFinish: Function;
  account: IAccount;
  updating?: boolean;
}

export class AccountPaypalForm extends PureComponent<IProps> {
  static defaultProps: Partial<IProps> = {
    updating: false
  };

  state = {
    email: this.props.account?.paypalSetting?.value?.email || '',
  };

  handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: e.target.value });
  };

  handleSubmit = (values: any) => {
    const { onFinish } = this.props;
    onFinish(values);
  };

  render() {
    const { account, updating } = this.props;
    const { email } = this.state;

    return (
      <Form
        name="paypal-form"
        onFinish={this.handleSubmit}
        initialValues={account?.paypalSetting?.value || {
          email: '',
        }}
        className="w-full"
      >
        <div className="flex flex-col gap-4 w-full">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
            className="w-full m-0"
          >
            <TraxInputField
              type="email"
              name="email"
              label="PayPal Email"
              placeholder="Enter your PayPal email"
              required
              value={email}
              onChange={this.handleEmailChange}
            />
          </Form.Item>

          <Form.Item className="w-full m-0">
            {account?.paypalSetting?.value?.email ? (
              <TraxButton
                htmlType="submit"
                styleType="secondary"
                buttonSize="full"
                buttonText="Submit"
                disabled={!email || updating}
                loading={updating}
              />
            ) : (
              <TraxButton
                htmlType="submit"
                styleType="primary"
                buttonSize="full"
                buttonText="Connect"
                disabled={!email || updating}
                loading={updating}
              />
            )}
          </Form.Item>
        </div>
      </Form>
    );
  }
}