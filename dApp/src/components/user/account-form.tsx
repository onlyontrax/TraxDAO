/* eslint-disable react/require-default-props */
import { GoogleOutlined, TwitterOutlined } from '@ant-design/icons';
import { AvatarUpload } from '@components/user/avatar-upload';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { userService, cryptoService } from '@services/index';
import { connect } from 'react-redux';
import {
  Button, Col, Form, Input, Row, Select, Modal, Switch, message
} from 'antd';
import { useState } from 'react';
import { ISettings, IUIConfig, IUser } from 'src/interfaces';
import NewCardPage from '../../../pages/user/cards/add-card';
import { AuthConnect } from '../../crypto/nfid/AuthConnect';

interface UserAccountFormIProps {
  user: IUser;
  updating: boolean;
  onFinish: Function;
  options?: {
    uploadHeader: any;
    avatarUrl: string;
    uploadAvatar: Function;
  };
  onVerifyEmail: Function;
  countTime: number;
  onSwitchToPerformer: Function;
  ui: IUIConfig;
  settings: ISettings;
  onNFIDConnect: Function;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

function UserAccountForm({
  updating, onFinish, user, options
}: UserAccountFormIProps) {
  const [form] = Form.useForm();
  const [walletNFID, setWalletNFID] = useState(user.wallet_icp);
  const InternetIdentityProviderProps: any = cryptoService.getNfidInternetIdentityProviderProps();
  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false);
  const [stage, setStage] = useState<number>(0);

  const onNFIDCopy = (value) => {
    setWalletNFID(value);
    form.setFieldsValue({ wallet_icp: value });
    setOpenConnectModal(false);
  };

  const disconnectWallet = (value: string) => {
    userService.disconnectWalletPrincipal().then(val => {
      message.success('Wallet Principal has been disconnected.');
      setWalletNFID('');
    }).catch(err => { message.error('There was a problem in disconnecting your wallet principal.'); });

    form.setFieldsValue({ wallet_icp: '' });
  };

  return user && user?._id && (
    <div style={{maxWidth: '650px', width: '100%', margin: 'auto'}}>
      <h1 className="content-heading" style={{maxWidth: '650px', width: '100%'}}>Settings</h1>
      <div className="tab-bar-account">
          <div onClick={() => setStage(0)} className="tab-btn-wrapper" style={{}}>
              <h1 className={`${stage === 0 ? 'selected-btn' : ''}`}>Account</h1>
              <div className={`${stage === 0 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => setStage(1)} className="tab-btn-wrapper">
              <h1 className={`${stage === 1 ? 'selected-btn' : ''}`}>Connect wallet</h1>
              <div className={`${stage === 1 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => setStage(2)} className="tab-btn-wrapper">
              <h1 className={`${stage === 2 ? 'selected-btn' : ''}`}>Billing</h1>
              <div className={`${stage === 2 ? 'active' : ''} tab-btn`} />
            </div>
          </div>
      <Form
        form={form}
        {...layout}
        name="user-account-form"
        onFinish={(data) => onFinish(data)}
        scrollToFirstError
        initialValues={user}
      >
      <div className={stage === 0 ? 'display-contents' : 'no-display'}>
      <div className="account-form">
      <h1 className="profile-page-heading">Profile information</h1>
        <Col xs={24} sm={24} style={{marginBottom: '24px'}}>
          <Form.Item>
            <p style={{ fontSize: '14px', color: 'white', marginBottom: '4px' }}>Avatar</p>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <AvatarUpload
                image={user.avatar}
                uploadUrl={options.avatarUrl}
                headers={options.uploadHeader}
                onUploaded={options.uploadAvatar}
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
          <p className="account-form-item-tag">Username</p>
          <Form.Item
            name="username"
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
            <Input className="account-form-input" placeholder="mirana, invoker123, etc..." />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
          <p className="account-form-item-tag">Display name</p>
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
            <Input className="account-form-input" placeholder="Display Name" />
          </Form.Item>
        </Col>
      <Form.Item className="text-center">
        <Button htmlType="submit" className="ant-btn profile-following-btn-card" style={{float: 'left'}} disabled={updating} loading={updating}>
          Save changes
        </Button>
      </Form.Item>
      </div>
      <div className="account-form">
      <h1 className="profile-page-heading">Personal Information</h1>
        <Col xs={24} sm={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
          <p className="account-form-item-tag">First name</p>
          <Form.Item
            hasFeedback
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
            <Input className="account-form-input" placeholder="First Name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
          <p className="account-form-item-tag">Last name</p>
          <Form.Item
            hasFeedback
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
            <Input className="account-form-input" placeholder="Last Name" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
          <p className="account-form-item-tag">Email address</p>
          <Form.Item
            name="email"
            rules={[{ type: 'email' }, { required: true, message: 'Please input your email address!' }]}
            hasFeedback
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input className="account-form-input" disabled={user.verifiedEmail} placeholder="Email Address" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
          <p className="account-form-item-tag">Gender</p>
          <Form.Item name="gender" rules={[{ required: true, message: 'Please select gender!' }]}>
            <Select className="account-form-input">
              <Select.Option value="male" key="male">
                Male
              </Select.Option>
              <Select.Option value="female" key="female">
                Female
              </Select.Option>
              <Select.Option value="transgender" key="transgender">
                Other
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} style={{marginBottom: '24px', maxWidth: '100%'}}>
          <p className="account-form-item-tag">Email notifications</p>
          <Form.Item name="unsubscribed" valuePropName="checked">
            <Switch className="switch" checkedChildren="Off" unCheckedChildren="On" />
          </Form.Item>
        </Col>
      <Form.Item className="text-center">
        <Button
          htmlType="submit"
          className="ant-btn profile-following-btn-card "
          style={{float: 'left'}}
          disabled={updating}
          loading={updating}
        >
          Save changes
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
            name="confirm-password"
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
      <Form.Item className="text-center">
        <Button htmlType="submit" className="ant-btn profile-following-btn-card" style={{float: 'left'}} disabled={updating} loading={updating}>
          Update password
        </Button>
      </Form.Item>
      </div>
      </div>

      <div className={stage === 1 ? 'display-contents' : 'no-display'}>
      <div className="account-form">
      <h1 className="profile-page-heading">Connect wallet</h1>
      <p className="profile-page-subtitle">Link your preferred crypto wallet to access web3 features</p>
      <Col md={24} xs={24} style={{marginBottom: '24px', maxWidth: '100%'}}>
          <p className="account-form-item-tag">Wallet Address</p>
          <Form.Item
            name="wallet_icp"
            label=""
            validateTrigger={['onChange', 'onBlur']}
            rules={[{ required: false, message: 'Please input your NFID principal address!' }]}
          >
            <Input
              className="account-form-input"
              value={walletNFID}
              readOnly
            />
            <div style={{ marginTop: '10px'}} className='connect-wallet-btn-wrapper'>
                <Button style={{marginLeft: '0px'}} className='connect-wallet-btn' onClick={()=> setOpenConnectModal(true)}>
                  Connect
                </Button>
                <Button style={{marginLeft: '0px'}} className='connect-wallet-btn' onClick={()=> disconnectWallet('')}>
                  Disconnect
                </Button>
            </div>
            <div className='sign-in-modal-wrapper'>
              <Modal
                key="purchase_post"
                className="auth-modal"
                title={null}
                open={openConnectModal}
                footer={null}
                width={600}
                destroyOnClose
                onCancel={() => setOpenConnectModal(false)}
              >
                <div style={{marginBottom: '15px'}}>

                  <span style={{fontSize: '23px', fontWeight: '600', color: 'white'}}>Connect </span>
                  <br />
                  <span style={{ fontSize: '14px', color: 'grey'}}>Select your preferred wallet to connect to TRAX</span>
                </div>
                <InternetIdentityProvider {...InternetIdentityProviderProps}>
                  <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer={false} oldWalletPrincipal={walletNFID} />
                </InternetIdentityProvider>
              </Modal>
            </div>
          </Form.Item>
        </Col>
        </div>
        </div>
      <div className={stage === 2 ? 'display-contents' : 'no-display'}>
      <div className="account-form">
      <h1 className="profile-page-heading">Payment</h1>
      <p className="profile-page-subtitle">Add a payment card to purchase content and merchandise</p>
        <NewCardPage />
      </div>
      </div>
    </Form>
    </div>
  );
}

const mapStates = (state: any) => ({
  settings: { ...state.settings }
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(UserAccountForm);
