import { PureComponent } from 'react';
import {
  Input, Button, Avatar, Form, Select
} from 'antd';
import { IPerformer } from '@interfaces/index';

interface IProps {
  performer: IPerformer;
  onFinish: Function;
  submiting: boolean;
}

export class ReportForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, submiting = false, performer
    } = this.props;
    return (
      <div className="confirm-purchase-form">
        <div className="text-center">
          <Avatar
            alt="main-avt"
            src={performer?.avatar || '/static/no-avatar.png'}
          />
        </div>
        <div className="info-body">
          <div style={{ marginBottom: '15px', width: '100%' }}>
            <p style={{ marginBottom: '20px', marginTop: '5px', marginLeft: '10px' }}>Report post</p>
            <Form
              name="report-form"
              onFinish={onFinish.bind(this)}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              className="account-form"
              scrollToFirstError
              initialValues={{
                title: 'Violent or repulsive content',
                description: ''
              }}
            >
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  { required: true, message: 'Please select title' }
                ]}
                validateTrigger={['onChange', 'onBlur']}
              >
                <Select>
                  <Select.Option value="Violent or repulsive content" key="Violent or repulsive content">Violent or repulsive content</Select.Option>
                  <Select.Option value="Hateful or abusive content" key="Hateful or abusive content">Hateful or abusive content</Select.Option>
                  <Select.Option value="Harassment or bullying" key="Harassment or bullying">Harassment or bullying</Select.Option>
                  <Select.Option value="Harmful or dangerous acts" key="Harmful or dangerous acts">Harmful or dangerous acts</Select.Option>
                  <Select.Option value="Child abuse" key="Child abuse">Child abuse</Select.Option>
                  <Select.Option value="Promotes terrorism" key="Promotes terrorism">Promotes terrorism</Select.Option>
                  <Select.Option value="Spam or misleading" key="Spam or misleading">Spam or misleading</Select.Option>
                  <Select.Option value="Infringes my rights" key="Infringes my rights">Infringes my rights</Select.Option>
                  <Select.Option value="Others" key="Others">Others</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea placeholder="Tell us why you report?" minLength={20} showCount maxLength={100} rows={3} />
              </Form.Item>
              <Form.Item>
                <Button
                  className="primary submit-content"
                  htmlType="submit"
                  loading={submiting}
                  disabled={submiting}
                >
                  SUBMIT
                </Button>
              </Form.Item>
            </Form>

          </div>
        </div>
      </div>
    );
  }
}
