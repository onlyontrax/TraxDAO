/* eslint-disable no-template-curly-in-string, react/require-default-props */
import { GoogleOutlined, TwitterOutlined, UploadOutlined } from '@ant-design/icons';
import { VideoPlayer } from '@components/common';
import { DatePicker } from '@components/common/datePicker';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import { getGlobalConfig } from '@services/config';
import {
  Button, Checkbox, Col, Form, Image, Input, Modal, Popover, Progress, Row, Select, Upload, message, Switch
} from 'antd';
import moment from 'moment';
import { PureComponent } from 'react';
import { ICountry, IMusic, IPerformer } from 'src/interfaces';

const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { TextArea } = Input;

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
  user: IPerformer;
  updating: boolean;

}

export class PerformerSocialLinkForm extends PureComponent<IProps> {
  state = {
    isUploadingVideo: false,
    uploadVideoPercentage: 0,
    isShowPreview: false
  };

  componentDidMount() {
    const { user } = this.props;
    this.setState({
    });
  }

  handleVideoChange = (info: any) => {
  };

  beforeUploadVideo = (file) => {
    return true;
  };

  render() {
    const {
      onFinish, user, updating,
    } = this.props;

    const {
      isUploadingVideo, uploadVideoPercentage, isShowPreview
    } = this.state;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={{
          ...user,
          dateOfBirth: (user.dateOfBirth && moment(user.dateOfBirth)) || ''
        }}
        scrollToFirstError
      >

        <div className="account-form-settings">
          <h1 className="profile-page-heading">Social links</h1>
          <span className='profile-page-subtitle'>Make changes to your profile here. Click save changes when you're done.</span>

          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Spotify</p>
              <Form.Item
                className="w-[75%]"
                name="spotify"
                label=""
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  {
                    pattern: /^(?=.*\S).+$/g,
                    message: 'URL can not contain only whitespace'
                  }
                ]}
                hasFeedback
              >
                <Input className="account-form-input" placeholder="spotify.com/" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Apple Music</p>
              <Form.Item
                name="appleMusic"
                className="w-[75%]"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  {
                    pattern: /^(?=.*\S).+$/g,
                    message: 'URL can not contain only whitespace'
                  }
                ]}
                hasFeedback
              >
                <Input className="account-form-input" placeholder="applemusic.com/" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">SoundCloud</p>
              <Form.Item
                name="soundcloud"
                className="w-[75%]"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  {
                    pattern: /^(?=.*\S).+$/g,
                    message: 'URL can not contain only whitespace'
                  }
                ]}
                hasFeedback
              >
                <Input className="account-form-input" placeholder="soundcloud.com/" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Instagram</p>
              <Form.Item
                name="instagram"
                label=""
                className="w-[75%]"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  {
                    pattern: /^(?=.*\S).+$/g,
                    message: 'URL can not contain only whitespace'
                  }
                ]}
                hasFeedback
              >
                <Input className="account-form-input" placeholder="instagram.com/" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">X</p>
              <Form.Item
                name="twitter"
                className="w-[75%]"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  {
                    pattern: /^(?=.*\S).+$/g,
                    message: 'URL can not contain only whitespace'
                  }
                ]}
                hasFeedback
              >
                <Input className="account-form-input" placeholder="twitter.com/" />
              </Form.Item>
            </div>
          </Col>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
            <Button
              className="profile-following-btn-card"
              htmlType="submit"
              loading={updating || isUploadingVideo}
              disabled={updating || isUploadingVideo}
              style={{ float: 'right' }}
            >
              Save Changes
            </Button>
          </Form.Item>
        </div>

      </Form>
    );
  }
}
