import {
  Button,
  Col,
  Form, InputNumber,
  Row,
  Switch
} from 'antd';
import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  }
};

interface IProps {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
}

export class PerformerSubscriptionForm extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    isFreeSubscription: false
  }

  componentDidMount() {
    const { user } = this.props;
    this.setState({ isFreeSubscription: !!user?.isFreeSubscription });
  }

  render() {
    const { onFinish, user, updating } = this.props;
    const { isFreeSubscription } = this.state;

    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          onFinish(values);
        }}
        validateMessages={validateMessages}
        initialValues={user}
        labelAlign="left"
        className="account-form"
        scrollToFirstError
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: '1.25rem', color: 'white' }}>Subscriptions</h1>
              <Col xl={12} md={12} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
                <p className="account-form-item-tag">Monthly price ($)</p>
                <Form.Item
                style={{marginBottom: '24px', maxWidth: '100%'}}
                  name="monthlyPrice"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="account-form-input" placeholder="0.00" min={1} />
                </Form.Item>
                <p className="account-form-item-tag">Annual price ($)</p>
                <Form.Item
                style={{marginBottom: '24px', maxWidth: '100%'}}
                  name="yearlyPrice"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="account-form-input" min={1} placeholder="0.00"/>
                </Form.Item>
              </Col>
          </div>
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: '18px', color: 'white' }}>Offer a free trial</h1>
            <p style={{ fontSize: '14px', color: 'white' }}>Give fans free access to your subscriber-only content for a limited time</p>
              <Col xl={24} md={24} xs={24}>
                <p className="account-form-item-tag">Enable free trial</p>
                <Form.Item name="isFreeSubscription" valuePropName="checked" style={{marginBottom: '24px', maxWidth: '100%'}}>
                  <Switch unCheckedChildren="No" checkedChildren="Yes" onChange={(val) => this.setState({ isFreeSubscription: val })} />
                </Form.Item>
                {isFreeSubscription && (
                  <>
                   <p className="account-form-item-tag">Duration (days)</p>
                <Form.Item
                  name="durationFreeSubscriptionDays"
                  style={{marginBottom: '24px', maxWidth: '100%'}}
                  help="Try free subscription for xx days"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} />
                </Form.Item>
                </>
                )}
              </Col>
            {/* </Row> */}
          </div>
        </div>

        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button className="ant-primary-btn" type="primary" htmlType="submit" disabled={updating} loading={updating}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>

    );
  }
}

PerformerSubscriptionForm.defaultProps = {
  updating: false
} as Partial<IProps>;
