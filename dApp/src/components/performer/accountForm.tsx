import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import {
  Button, Col, Form, Input, Row, Select
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
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    coverUploadUrl?: string;
    onCoverUploaded?: Function;
  };
  countries: ICountry[];
  musicInfo: IMusic;
}

export class PerformerAccountForm extends PureComponent<IProps> {
  onFinish = (formValues) => {
    this.props.onFinish(formValues);
  };

  render() {
    const {
      user, updating, options, musicInfo
    } = this.props;
    const { genreOne = [], genreTwo = [] } = musicInfo;
    const {
      uploadHeaders, avatarUploadUrl, onAvatarUploaded, coverUploadUrl, onCoverUploaded
    } = options;

    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={this.onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={{
          ...user,
          dateOfBirth: (user.dateOfBirth && moment(user.dateOfBirth)) || ''
        }}
        scrollToFirstError
      >
        <div className="account-form-settings">
          <h1 className="profile-page-heading">Edit profile</h1>
          <span className='profile-page-subtitle'>Make changes to your profile here. Click save changes when you're done.</span>
          <Col lg={24} md={24} xs={24} className='' >
            <div className="avatar-upload flex flex-row gap-4 w-full" style={{ marginBottom: '24px', maxWidth: '100%' }}>
              <p className="text-base text-trax-white mb-1 w-[25%] text-right" >Avatar</p>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <AvatarUpload
                  headers={uploadHeaders}
                  uploadUrl={avatarUploadUrl}
                  onUploaded={onAvatarUploaded}
                  image={user.avatar}
                />
              </div>
            </div>
            <div className='flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[35%] text-right">Cover photo</p>
              <div className='cover-wrapper'>
                <div className="cover-upload">
                  <CoverUpload
                    headers={uploadHeaders}
                    uploadUrl={coverUploadUrl}
                    onUploaded={onCoverUploaded}
                    image={user.cover}
                    options={{ fieldName: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </Col>
          <Row>
            <Col lg={24} md={24} xs={24} className=''>
              <div className=' flex flex-row gap-4 w-full'>
                <p className="account-form-item-tag w-[25%] text-right">Username</p>
                <Form.Item
                  style={{ maxWidth: '100%' }}
                  name="username"
                  className="w-[75%]"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Please input your username!' },
                    {
                      pattern: /^[a-z0-9]+$/g,
                      message: 'Username must contain lowercase alphanumerics only'
                    },
                    { min: 3, message: 'Username must containt at least 3 characters' }
                  ]}
                  hasFeedback
                >
                  <Input className="account-form-input " />
                </Form.Item>
              </div>
              <div className=' flex flex-row gap-4 w-full'>
                <p className="account-form-item-tag w-[25%] text-right">Display Name</p>
                <Form.Item
                  name="name"
                  className="w-[75%]"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Please input your display name!' },
                    {
                      pattern: /^(?=.*\S).+$/g,
                      message: 'Display name can not contain only whitespace'
                    },
                    {
                      min: 3,
                      message: 'Display name must containt at least 3 characters'
                    }
                  ]}
                  hasFeedback
                >
                  <Input className="account-form-input " />
                </Form.Item>
              </div>
            </Col>
          </Row>
          <Col lg={24} md={24} xs={24} className='' >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">About you</p>
              <Form.Item
                name="bio"
                className="w-[75%]"
                label=""
                rules={[
                  {
                    required: true,
                    message: 'Please enter your bio!'
                  }
                ]}
              >
                <TextArea className="account-form-input" rows={5} placeholder="Tell people something about you..." />
              </Form.Item>
            </div>
          </Col>
          <Col lg={12} md={12} xs={12} style={{ maxWidth: '100%' }}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Primary genre</p>
              <Form.Item name="genreOne"
                className="w-[75%] ">
                <Select className="account-form-input bg-trax-[##0e0e0e] " >
                  {genreOne.map((s) => (
                    <Select.Option key={s.value} value={s.value}>
                      {s.text}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </Col>
          <Col lg={12} md={12} xs={12} style={{ marginBottom: '24px', maxWidth: '100%' }}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Secondary genre</p>
              <Form.Item name="genreTwo" className="w-[75%] ">
                <Select className="account-form-input bg-trax-[##0e0e0e] " style={{ height: 42 }}>
                  {genreTwo.map((s) => (
                    <Select.Option key={s.value} value={s.value} >
                      {s.text}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </Col>
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
        </div>
      </Form>
    );
  }
}