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
      >
          <Col lg={24} xs={24}>
          <p className="account-form-item-tag">Paypal account email</p>
            <Form.Item
              name="email"
            >
              <Input className="account-form-input"/>
            </Form.Item>
            <Form.Item className="text-center">
              <Button style={{float: 'left'}} className="ant-btn profile-following-btn-card" htmlType="submit" disabled={updating} loading={updating}>
                Submit
              </Button>
            </Form.Item>
          </Col>
      </Form>
    );
  }
}

PerformerPaypalForm.defaultProps = {
  updating: false
} as Partial<IProps>;
