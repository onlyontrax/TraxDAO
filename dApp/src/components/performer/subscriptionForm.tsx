import {
  Button,
  Col,
  Form, InputNumber,
  Row,
  Switch,
  Input,
  message
} from 'antd';
import dynamic from 'next/dynamic';
import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';


const { TextArea } = Input;
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
  private _content: string = '';

  state = {
    isFreeSubscription: false,
  }

  componentDidMount() {
    const { user } = this.props;
    this.setState({ isFreeSubscription: !!user?.isFreeSubscription });
  }

  contentChange(content: string) {
    this._content = content;
  }

  render() {
    const { onFinish, user, updating } = this.props;
    const { isFreeSubscription } = this.state;


    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
            // values.subBenefits = this._content
            onFinish(values);
        }}
        validateMessages={validateMessages}
        initialValues={user}
        labelAlign="left"
        className="account-form-settings"
        scrollToFirstError
      >
        <div className="account-form-settings">
          <h1 className='profile-page-heading'>Pricing</h1>
          <span className='profile-page-subtitle'>Set your pricing for monthly and yearly subscription plans, and outline the benefits and content your subscribers can expect to see.</span>
          <Col lg={24} md={24} xs={24}>
          <div className='flex flex-row gap-4 w-full'>
          <p className="account-form-item-tag w-[25%] text-right">Subscription benefits</p>
            <Form.Item
              name="subBenefits"
              className="account-form-input"
            >
              <TextArea className="account-form-input bg-[#141414] hover:bg-[#141414] white-space-pre" rows={5} placeholder="List the benefits of subscribing to your channel..." />
            </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Monthly price ($)</p>
              <Form.Item
                name="monthlyPrice"
                rules={[{ required: true }]}
              >
                <InputNumber className="account-form-input" placeholder="0.00" min={1} />
              </Form.Item>
            </div>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Annual price ($)</p>
              <Form.Item
                name="yearlyPrice"
                rules={[{ required: true }]}
              >
                <InputNumber className="account-form-input" min={1} placeholder="0.00" />
              </Form.Item>
            </div>
          </Col>
        </div>
        <div className="account-form-settings">
          <h1 className='profile-page-heading'>Offer a free trial</h1>
          <span className='profile-page-subtitle'>Give fans free access to your subscriber-only content for a limited time</span>
          <Col lg={24} md={24} xs={24}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Enable free trial</p>
              <Form.Item name="isFreeSubscription" valuePropName="checked" >
                <Switch unCheckedChildren="No" checkedChildren="Yes" onChange={(val) => this.setState({ isFreeSubscription: val })} />
              </Form.Item>
            </div>
            {isFreeSubscription && (
              <div className=' flex flex-row gap-4 w-full'>
                <p className="account-form-item-tag w-[25%] text-right">Duration (days)</p>
                <Form.Item
                  name="durationFreeSubscriptionDays"

                  help="Try free subscription for xx days"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} />
                </Form.Item>
              </div>
            )}
          </Col>

        </div>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }} style={{ marginBottom: '2rem' }}>
          <Button
            className="profile-following-btn-card"
            htmlType="submit"
            loading={updating}
            disabled={updating}
            style={{ float: 'right' }}
          >
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
