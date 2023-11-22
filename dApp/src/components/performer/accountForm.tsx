/* eslint-disable no-template-curly-in-string, react/require-default-props */
import { GoogleOutlined, TwitterOutlined, UploadOutlined } from '@ant-design/icons';
import { VideoPlayer } from '@components/common';
import { DatePicker } from '@components/common/datePicker';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import { getGlobalConfig } from '@services/config';
import {
  Button, Checkbox, Col, Form, Image, Input, Modal, Popover, Progress, Row, Select, Upload, message
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

export class PerformerAccountForm extends PureComponent<IProps> {
  state = {
    isUploadingVideo: false,
    uploadVideoPercentage: 0,
    previewVideoUrl: null,
    previewVideoName: null,
    isShowPreview: false
  };

  componentDidMount() {
    const { user } = this.props;
    this.setState({
      previewVideoUrl: user?.welcomeVideoPath,
      previewVideoName: user?.welcomeVideoName
    });
  }

  handleVideoChange = (info: any) => {
    info.file && info.file.percent && this.setState({ uploadVideoPercentage: info.file.percent });
    if (info.file.status === 'uploading') {
      this.setState({ isUploadingVideo: true });
      return;
    }
    if (info.file.status === 'done') {
      message.success('Intro video was uploaded');
      this.setState({
        isUploadingVideo: false,
        previewVideoUrl: info?.file?.response?.data.url,
        previewVideoName: info?.file?.response?.data.name
      });
    }
  };

  beforeUploadVideo = (file) => {
    const isValid = file.size / 1024 / 1024 < (getGlobalConfig().NEXT_PUBLIC_MAX_SIZE_TEASER || 200);
    if (!isValid) {
      message.error(
        `File is too large please provide an file ${getGlobalConfig().NEXT_PUBLIC_MAX_SIZE_TEASER || 200}MB or below`
      );
      return false;
    }
    this.setState({ previewVideoName: file.name });
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
      isUploadingVideo, uploadVideoPercentage, previewVideoUrl, previewVideoName, isShowPreview
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
        <div className="account-form">
        <h1 className="profile-page-heading">Profile information</h1>
          <Col lg={24} md={24} xs={24}>
            <div className="avatar-upload" style={{marginBottom: '24px', maxWidth: '100%', padding: 5}}>
            <p style={{ fontSize: '14px', color: 'white', marginBottom: '4px' }}>Avatar</p>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <AvatarUpload
                headers={uploadHeaders}
                uploadUrl={avatarUploadUrl}
                onUploaded={onAvatarUploaded}
                image={user.avatar}
              />
              </div>
            </div>
            <p className="account-form-item-tag">Cover photo</p>
            <div className='cover-wrapper' style={{ maxWidth: '100%', padding: 5}}>
              <div
                className="top-profile-account"
                style={{
                  position: 'relative',
                  marginBottom: -20,
                  backgroundImage: user?.cover ? `url('${user.cover}')` : "url('/static/banner-image.jpg')"
                }}
              />
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
          </Col>
          <Row>
            <Col lg={24} md={24} xs={24} >
              <p className="account-form-item-tag">Username</p>
              <Form.Item
              style={{marginBottom: '24px', maxWidth: '100%'}}
                name="username"
                label=""
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
                <Input className="account-form-input"  />
              </Form.Item>
              <p className="account-form-item-tag">Display Name</p>
              <Form.Item
                name="name"
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
                <Input className="account-form-input"/>
              </Form.Item>
            </Col>
            <Col />
          </Row>
          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%', padding: 5}}>
            <p className="account-form-item-tag">About you</p>
            <Form.Item
              name="bio"
              label=""
              rules={[
                {
                  required: true,
                  message: 'Please enter your bio!'
                }
              ]}
            >
              <TextArea className="account-form-input" rows={10} placeholder="Tell people something about you..." />
            </Form.Item>
          </Col>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }} style={{ marginBottom: '2rem' }}>
          <Button
            className="profile-following-btn-card"
            htmlType="submit"
            loading={updating || isUploadingVideo}
            disabled={updating || isUploadingVideo}
            style={{float: 'left'}}
          >
            Save Changes
          </Button>
        </Form.Item>
        </div>
        <div className="account-form">
        <h1 className="profile-page-heading">Your music</h1>
          <Col lg={12} md={12} xs={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Primary genre</p>
            <Form.Item name="genreOne">
              <Select className="account-form-input">
                {genreOne.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Secondary genre</p>
            <Form.Item name="genreTwo">
              <Select className="account-form-input">
                {genreTwo.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Connect to Spotify</p>
            <Form.Item
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
          </Col>
          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Connect to Apple Music</p>
            <Form.Item
              name="appleMusic"
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
          </Col>
          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Connect to SoundCloud</p>
            <Form.Item
              name="soundcloud"
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
          </Col>
          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Connect to Instagram</p>
            <Form.Item
              name="instagram"
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
              <Input className="account-form-input" placeholder="instagram.com/" />
            </Form.Item>
          </Col>
          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Connect to Twitter</p>
            <Form.Item
              name="twitter"
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
          </Col>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button
            className="profile-following-btn-card"
            htmlType="submit"
            loading={updating || isUploadingVideo}
            disabled={updating || isUploadingVideo}
            style={{float: 'left'}}
          >
            Save Changes
          </Button>
        </Form.Item>
        </div>
        <div className="account-form">
        <h1 className="profile-page-heading">Password</h1>
          <Col md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">New password</p>
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
          </Col>
          <Col md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Confirm password</p>
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
          </Col>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button
            className="profile-following-btn-card"
            htmlType="submit"
            loading={updating || isUploadingVideo}
            disabled={updating || isUploadingVideo}
            style={{float: 'left'}}
          >
            Update password
          </Button>
        </Form.Item>
        </div>
        <div className="account-form">
        <h1 className="profile-page-heading">Personal details</h1>
          <Col xs={24} sm={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">First name</p>
            <Form.Item
              name="firstName"
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
          </Col>
          <Col lg={12} md={12} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Last name</p>
            <Form.Item
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
          </Col>

          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">
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
                        style={{float: 'left'}}
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
              rules={[{ type: 'email' }, { required: true, message: 'Please input your email address!' }]}
              hasFeedback
              validateTrigger={['onChange', 'onBlur']}
            >
              <Input className="account-form-input" disabled={user.googleConnected} />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Gender</p>
            <Form.Item name="gender" rules={[{ required: true, message: 'Please select your gender!' }]}>
              <Select className="account-form-input" >
                {genders.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Country</p>
            <Form.Item name="country" rules={[{ required: true }]}>
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
          </Col>

          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Date of birth</p>
            <Form.Item
              name="dateOfBirth"
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
                style={{ width: '100%', background: '#232626', borderColor: '#232626' }}
                placeholder="DD/MM/YYYY"
                format="DD/MM/YYYY"
                disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(18, 'year').endOf('day')}
              />
            </Form.Item>
          </Col>

          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Address</p>
            <Form.Item name="address">
              <Input className="account-form-input"/>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">State</p>
            <Form.Item name="state">
              <Input className="account-form-input"/>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">City</p>
            <Form.Item name="city">
              <Input className="account-form-input"/>
            </Form.Item>
          </Col>

          <Col lg={12} md={12} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <p className="account-form-item-tag">Zip code</p>
            <Form.Item name="zipcode">
              <Input className="account-form-input"/>
            </Form.Item>
          </Col>
          <Col lg={24} md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
            <Form.Item>
              <p style={{ fontSize: '1rem', color: 'white' }}>Intro video</p>
              <Upload
                accept={'video/*'}
                name="welcome-video"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={videoUploadUrl}
                headers={uploadHeaders}
                beforeUpload={(file) => this.beforeUploadVideo(file)}
                onChange={this.handleVideoChange.bind(this)}
              >
                <UploadOutlined />
              </Upload>
              <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                {((previewVideoUrl || previewVideoName) && (
                  <a aria-hidden onClick={() => this.setState({ isShowPreview: true })}>
                    {previewVideoName || previewVideoUrl || 'Click here to preview'}
                  </a>
                )) || (
                  <a>
                    Intro video is
                    {' '}
                    {getGlobalConfig().NEXT_PUBLIC_MAX_SIZE_TEASER || 200}
                    MB or below
                  </a>
                )}
              </div>
              {uploadVideoPercentage ? <Progress percent={Math.round(uploadVideoPercentage)} /> : null}
            </Form.Item>
            <Form.Item name="activateWelcomeVideo" valuePropName="checked">
              <Checkbox style={{ color: 'white' }}>Activate intro video</Checkbox>
            </Form.Item>
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
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button
            className="profile-following-btn-card"
            htmlType="submit"
            loading={updating || isUploadingVideo}
            disabled={updating || isUploadingVideo}
            style={{float: 'left'}}
          >
            Save Changes
          </Button>
        </Form.Item>
        </div>
        <Modal
          width={767}
          footer={null}
          onOk={() => this.setState({ isShowPreview: false })}
          onCancel={() => this.setState({ isShowPreview: false })}
          open={isShowPreview}
          destroyOnClose
          centered
        >
          <VideoPlayer
            {...{
              autoplay: true,
              controls: true,
              playsinline: true,
              fluid: true,
              sources: [
                {
                  src: previewVideoUrl,
                  type: 'video/mp4'
                }
              ]
            }}
          />
        </Modal>
      </Form>
    );
  }
}
