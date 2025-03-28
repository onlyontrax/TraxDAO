/* eslint-disable no-template-curly-in-string, react/require-default-props */
import { AppleOutlined, GoogleOutlined, TwitterOutlined, UploadOutlined } from '@ant-design/icons';
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

import TraxButton from '@components/common/TraxButton';

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
  onVerifyEmail: Function;
  countTime: number;
  user: IPerformer;
  updating: boolean;
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    coverUploadUrl?: string;
    onCoverUploaded?: Function;
    beforeUpload?: Function;
    videoUploadUrl?: string;
    onVideoUploaded?: Function;
    uploadPercentage?: number;
  };
  countries: ICountry[];
  musicInfo: IMusic;
}

export class PerformerAccountInformationForm extends PureComponent<IProps> {
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
      onFinish, user, updating, countries, options, musicInfo, onVerifyEmail, countTime = 60
    } = this.props;
    const { genreOne = [], genreTwo = [], genders = [] } = musicInfo;
    const {
      uploadHeaders, avatarUploadUrl, onAvatarUploaded, coverUploadUrl, onCoverUploaded, videoUploadUrl
    } = options;
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
          <h1 className="profile-page-heading">Personal details</h1>
          <span className='profile-page-subtitle'>View and make changes to your personal details profile here. Click save changes when you're done.</span>





          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">First name</p>
              <Form.Item
                name="firstName"
                className="w-[75%]"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Please input your first name!' },
                  {
                    pattern:
                      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                    message: 'First name can not contain number and special character'
                  }
                ]}
              >
                <Input className="account-form-input" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Last name</p>
              <Form.Item
                className="w-[75%]"
                name="lastName"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Please input your last name!' },
                  {
                    pattern:
                      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                    message: 'Last name can not contain number and special character'
                  }
                ]}
              >
                <Input className="account-form-input" />
              </Form.Item>
            </div>
          </Col>

          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">
                <span>
                  Email Address
                  {'  '}
                  {user.verifiedEmail ? (
                    <Popover title="Your email address is verified" content={null}>
                      <a className="success-color">Verified!</a>
                    </Popover>
                  ) : (
                    <Popover
                      title="Your email address is not verified"
                      content={(
                        <Button
                          onClick={() => onVerifyEmail()}
                          disabled={updating || countTime < 60}
                          loading={updating || countTime < 60}
                          className="profile-following-btn-card"
                          style={{ float: 'left' }}
                        >
                          Click here to
                          {' '}
                          {countTime < 60 ? 'resend' : 'send'}
                          {' '}
                          the verification link
                          {' '}
                          {countTime < 60 && `${countTime}s`}
                        </Button>
                      )}
                    >
                      <a className="error-color">Not verified!</a>
                    </Popover>
                  )}
                </span>
              </p>
              <Form.Item
                name="email"
                className="w-[75%]"
                rules={[{ type: 'email' }, { required: true, message: 'Please input your email address!' }]}
                hasFeedback
                validateTrigger={['onChange', 'onBlur']}
              >
                <Input className="account-form-input" disabled={user.googleConnected} />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Gender</p>
              <Form.Item name="gender" className="w-[75%]" rules={[{ required: true, message: 'Please select your gender!' }]}>
                <Select className="account-form-input" >
                  {genders.map((s) => (
                    <Select.Option key={s.value} value={s.value}>
                      {s.text}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Country</p>
              <Form.Item name="country" className="w-[75%]" rules={[{ required: true }]}>
                <Select className="account-form-input" showSearch optionFilterProp="label">
                  {countries.map((c) => (
                    <Option value={c.code} label={c.name} key={c.code}>
                      <Image alt="country_flag" src={c.flag} width="25px" />
                      {' '}
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </Col>

          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Date of birth</p>
              <Form.Item
                name="dateOfBirth"
                className="w-[75%]"
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Select your date of birth'
                  }
                ]}
              >
                <DatePicker

                  style={{ width: '100%', background: '#1e1e1e', borderColor: '#23262600', height: 42, borderRadius: '9px' }}
                  placeholder="DD/MM/YYYY"
                  format="DD/MM/YYYY"
                  disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(18, 'year').endOf('day')}
                />
              </Form.Item>
            </div>
          </Col>

          <Col lg={24} md={24} xs={24}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Address</p>
              <Form.Item name="address" className="w-[75%]">
                <Input className="account-form-input" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">State</p>
              <Form.Item name="state" className="w-[75%]">
                <Input className="account-form-input" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">City</p>
              <Form.Item name="city" className="w-[75%]">
                <Input className="account-form-input" />
              </Form.Item>
            </div>
          </Col>

          <Col lg={24} md={24} xs={24}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Zip code</p>
              <Form.Item name="zipcode" className="w-[75%]">
                <Input className="account-form-input" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24}>
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Email notifications</p>
              <Form.Item name="unsubscribed" className="w-[75%]" valuePropName="checked">
                <Switch className="switch" checkedChildren="Off" unCheckedChildren="On" />
              </Form.Item>
            </div>
          </Col>
          <Col lg={24} md={24} xs={24}>
            {user.twitterConnected && (
              <Form.Item>
                <p>
                  <TwitterOutlined style={{ color: '#1ea2f1', fontSize: '30px' }} />
                  {' '}
                  Signup/login via Twitter
                </p>
              </Form.Item>
            )}
            {user.googleConnected && (
              <Form.Item>
                <p>
                  <GoogleOutlined style={{ color: '#d64b40', fontSize: '30px' }} />
                  {' '}
                  Signup/login via Google
                </p>
              </Form.Item>
            )}
          </Col>
          <Form.Item>
            <TraxButton
              htmlType="submit"
              styleType="primary"
              buttonSize='full'
              buttonText="Save Changes"
              loading={updating || isUploadingVideo}
              disabled={updating || isUploadingVideo}
            />
          </Form.Item>
          <Col md={24} xs={24} className='mt-14' >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">New password</p>
              <Form.Item
                name="password"
                hasFeedback
                rules={[
                  {
                    pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                    message:
                      'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
                  }
                ]}
              >
                <Input.Password className="account-form-input" placeholder="New password" />
              </Form.Item>
            </div>
          </Col>
          <Col md={24} xs={24} >
            <div className=' flex flex-row gap-4 w-full'>
              <p className="account-form-item-tag w-[25%] text-right">Confirm password</p>
              <Form.Item
                name="confirm"
                dependencies={['password']}
                hasFeedback
                rules={[
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      // eslint-disable-next-line prefer-promise-reject-errors
                      return Promise.reject('Passwords do not match together!');
                    }
                  })
                ]}
              >
                <Input.Password className="account-form-input" placeholder="Confirm new password" />
              </Form.Item>
            </div>
          </Col>
          <Form.Item>
            <TraxButton
              htmlType="submit"
              styleType="primary"
              buttonSize='full'
              buttonText="Update password"
              loading={updating || isUploadingVideo}
              disabled={updating || isUploadingVideo}
            />
          </Form.Item>
        </div>
      </Form>
    );
  }
}
