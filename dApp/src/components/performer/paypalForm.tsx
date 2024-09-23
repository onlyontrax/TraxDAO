import {
  Button,
  Col,
  Form,
  Input, Row
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

export class PerformerPaypalForm extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { onFinish, user, updating } = this.props;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={user?.paypalSetting?.value || {
          email: '',
          phoneNumber: ''
        }}
        labelAlign="left"
        className="w-full"
      >
        <Row className='gap-4 justify-between'>
          {/* <p className="account-form-item-tag">Paypal account email</p> */}
          <Form.Item
            name="email"
            className='flex w-3/5'

          >
            <Input
              className="account-form-input"
              placeholder='Add your email'
            />
          </Form.Item>
          {user?.paypalSetting?.value?.email ? (
            <div className='flex'>
              <Form.Item className="flex w-1/5 justify-end">
                <Button className="rounded-lg bg-[#f1f5f9] text-trax-black p-2 h-[38px] flex w-fit justify-center" htmlType="submit" disabled={updating} loading={updating}>
                  Submit
                </Button>
              </Form.Item>
            </div>
          ) : (
            <div className='flex'>
              <Form.Item className="flex w-1/5 justify-end">
                <Button className="rounded-lg bg-[#1e1e1e] text-trax-white p-2 h-[38px] flex w-fit justify-center" htmlType="submit" disabled={updating} loading={updating}>
                  Connect
                </Button>
              </Form.Item>
            </div>
          )}

        </Row>
      </Form>
    );
  }
}

PerformerPaypalForm.defaultProps = {
  updating: false
} as Partial<IProps>;
