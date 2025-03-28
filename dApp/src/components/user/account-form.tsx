/* eslint-disable react/require-default-props */
import { PlusOutlined, CreditCardOutlined, MoreOutlined } from '@ant-design/icons';
import { AvatarUpload } from '@components/user/avatar-upload';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { userService, cryptoService, paymentService, accountService } from '@services/index';
import { connect } from 'react-redux';
import {
  Button, Col, Form, Input, Row, Select, Modal, Tabs, Switch, message, Image, Spin
} from 'antd';
import { useState, useEffect } from 'react';
import { ISettings, IUIConfig, IUser } from 'src/interfaces';
import NewCardPage from '../../../pages/user/cards/add-card';
import { AuthConnect } from '../../crypto/nfid/AuthConnect';
import { Sheet } from 'react-modal-sheet';
import useDeviceSize from 'src/components/common/useDeviceSize';
import PhoneInput from 'react-phone-number-input';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import SlideUpModal from '@components/common/layout/slide-up-modal';
import TraxButton from '@components/common/TraxButton';

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
  updating, onFinish, user, options, ui, settings,
}: UserAccountFormIProps) {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState(user);
  const [walletNFID, setWalletNFID] = useState(user.account?.wallet_icp);
  const [phone, setPhone] = useState(user.phone);
  const InternetIdentityProviderProps: any = cryptoService.getNfidInternetIdentityProviderProps();
  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false);
  const [stage, setStage] = useState<number>(0);
  const { isMobile, isTablet } = useDeviceSize();
  const [activeTab, setActiveTab] = useState(() => {
    // Use this function to initialize state to avoid issues with SSR
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userAccountActiveTab') || 'basic';
    }
    return 'basic';
  });
  // 2FA
  const [enabled2fa, setEnabled2FA] = useState<boolean>(user.enabled2fa);
  const [openEnable2fa, setEnabled2FAModal] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string>('/static/no-image.jpg');
  const [tokenField, setTokenField] = useState<string>('');

  const [enabledSms, setEnabledSms] = useState<boolean>(user.enabledSms);
  const [openEnableSms, setEnabledSmsModal] = useState<boolean>(false);
  const [smsCode, setSmsCode] = useState<string>('');
  const [tokenSmsField, setTokenSmsField] = useState<string>('');
  const [isCardModalVisible, setIsCardModalVisible] = useState(false);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const dispatch = useDispatch();

  const router = useRouter();

  useEffect(() => {
    form.setFieldsValue({
      ...user,
      phone: user.phone || ''
    });
  }, []);

  const handleChange = (changedValues, allValues) => {
    setFormData(prev => ({ ...prev, ...changedValues }));
  };

  const handleSubmit = async (values) => {
    const updatedUser = { ...formData, ...values };
    await onFinish(updatedUser);
    setFormData(updatedUser);
  };

  const enable2FA = async () => {
    await accountService.enable2FA(user._id);
    setEnabled2FAModal(true);
    const qrCodeLink = await accountService.getQRCode(user._id);
    setQrCode(qrCodeLink.data);
  };

  const verify2FA = async () => {
    const res = await accountService.verify2FA(user._id, { token: tokenField });
    if (res.data === true) {
      message.success('Two factor authentication enabled.');
      setEnabled2FAModal(false);
      setEnabled2FA(true);
      return;
    }
    message.success('There is a problem with the provided code, please try again.');
  };

  const disable2FA = async () => {
    const res = await accountService.disable2FA(user._id);
    if (res.data === true) {
      message.success('Two factor authentication disabled.');
      setEnabled2FA(false);
      return;
    }
    message.success('There is a problem with disabling 2FA. Please try again.');
  };

  const enableSms = async () => {
    const res = await form.validateFields();
    await form.submit();

    await accountService.enableSms(user._id, { phone: phone || user.phone });
    setEnabledSmsModal(true);
    const qrCodeLink = await accountService.getSMSCode(user._id);
    setTokenSmsField('');
  };

  const verifySms = async () => {
    const res = await accountService.verifySms(user._id, { token: tokenSmsField });
    if (res.data === true) {
      message.success('SMS authentication enabled.');
      setEnabledSmsModal(false);
      setEnabledSms(true);
      return;
    }
    message.success('There is a problem with the provided SMS code, please try again.');
  };

  const disableSms = async () => {
    const res = await accountService.disableSms(user._id);
    if (res.data === true) {
      message.success('SMS authentication disabled.');
      setEnabledSms(false);
      return;
    }
    message.success('There is a problem with disabling SMS Auth. Please try again.');
  };

  const onNFIDCopy = (value) => {
    setWalletNFID(value);
    form.setFieldsValue({ wallet_icp: value });
    setOpenConnectModal(false);
  };

  const disconnectWallet = (value: string) => {
    accountService.disconnectWalletPrincipal().then(val => {
      message.success('Wallet Principal has been disconnected.');
      setWalletNFID('');
    }).catch(err => { message.error('There was a problem in disconnecting your wallet principal.'); });

    form.setFieldsValue({ wallet_icp: '' });
  };

  useEffect(() => {
    // Update activeTab when URL changes
    const tabFromUrl = router.query.tab as string;
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
      localStorage.setItem('userAccountActiveTab', tabFromUrl);
    }
  }, [router.query.tab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    localStorage.setItem('userAccountActiveTab', key);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: key },
    }, undefined, { shallow: true });
  };

  useEffect(() => {
    getCards();
  }, []);

  const getCards = async () => {
    try {
      setLoadingCards(true);
      const resp = await paymentService.getStripeCards();
      setCards(resp.data.data.map((d) => {
        if (d.card) return { ...d.card, id: d.id };
        if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
        return d;
      }));
    } catch (error) {
      message.error('An error occurred while fetching cards. Please try again.');
    } finally {
      setLoadingCards(false);
    }
  };

  const handleAddCard = () => {
    setIsCardModalVisible(true);
  };

  const handleCardModalClose = () => {
    setIsCardModalVisible(false);
    getCards(); // Refresh the cards list after closing the modal
  };

  const handleRemoveCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to remove this payment card?')) return;
    try {
      await paymentService.removeStripeCard(cardId);
      userService.reloadCurrentUser(dispatch);
      getCards(); // Refresh the cards list after removal
      message.success('Card removed successfully');
    } catch (error) {
      message.error('Error occurred while removing the card. Please try again.');
    }
  };

  return user && user?._id && (
    <div className='main-container user-account-settings px-2 sm:px-8' >
      {(!isTablet && !isMobile) && (
        <h1 className="content-heading">Settings</h1>
      )}
      <Form
        form={form}
        {...layout}
        name="user-account-form"
        onFinish={handleSubmit}
        onValuesChange={handleChange}
        initialValues={formData}
        scrollToFirstError
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange} tabPosition={(isTablet || isMobile) ? "top" : "left"} className="" >
          <Tabs.TabPane tab={<span className='uppercase font-heading text-xl'>Edit Profile</span>} key="basic">

            <div className="account-form-settings">
              <h1 className="profile-page-heading">Edit profile</h1>
              <span className='profile-page-subtitle'>Make changes to your profile here. Click save changes when you're done.</span>
              <Col lg={24} md={24} xs={24} style={{ marginBottom: '24px' }}>
                <div className="avatar-upload flex flex-row gap-4 w-full" style={{ marginBottom: '24px', maxWidth: '100%' }}>
                  <p className="text-base text-trax-white mb-1 w-[25%] text-right" >Avatar</p>
                  <Form.Item className='w-[75%]'>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <AvatarUpload
                        image={user.avatar}
                        uploadUrl={options.avatarUrl}
                        headers={options.uploadHeader}
                        onUploaded={options.uploadAvatar}
                      />
                    </div>
                  </Form.Item>
                </div>
              </Col>
              <Col lg={24} md={24} xs={24} >
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right">Username</p>
                  <Form.Item
                    name="username"
                    className='w-[75%]'
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
                </div>
              </Col>
              <Col lg={24} md={24} xs={24} >
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right">Display name</p>
                  <Form.Item
                    name="name"
                    className='w-[75%]'
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
                </div>
              </Col>


              <Col lg={24} md={24} xs={24} >
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right" >First name</p>
                  <Form.Item
                    hasFeedback
                    name="firstName"
                    className='w-[75%]'
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: true, message: 'Please input your first name!' },
                      {
                        pattern:
                          // @ts-ignore
                          /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                        message: 'First name can not contain number and special character'
                      }
                    ]}
                  >
                    <Input className="account-form-input" placeholder="First Name" />
                  </Form.Item>
                </div>
              </Col>
              <Col lg={24} md={24} xs={24} >
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right" >Last name</p>
                  <Form.Item
                    hasFeedback
                    className='w-[75%]'
                    name="lastName"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: true, message: 'Please input your last name!' },
                      {
                        pattern:
                          // @ts-ignore
                          /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                        message: 'Last name can not contain number and special character'
                      }
                    ]}
                  >
                    <Input className="account-form-input" placeholder="Last Name" />
                  </Form.Item>
                </div>
              </Col>

              <Col lg={24} md={24} xs={24}>
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right" >Email address</p>
                  <Form.Item
                    name="email"
                    className='w-[75%]'
                    rules={[{ type: 'email' }, { required: true, message: 'Please input your email address!' }]}
                    hasFeedback
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <Input className="account-form-input" placeholder="Email Address" />
                  </Form.Item>
                </div>
              </Col>

              <Col lg={24} md={24} xs={24} >
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right" >Gender</p>
                  <Form.Item name="gender" className='w-[75%]' rules={[{ required: true, message: 'Please select gender!' }]}>
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
                </div>
              </Col>

              <Col lg={24} md={24} xs={24} style={{ marginBottom: '24px', maxWidth: '100%' }}>
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right" >Email notifications</p>
                  <Form.Item className='w-[75%]' name="unsubscribed" valuePropName="checked">
                    <Switch className="switch" checkedChildren="Off" unCheckedChildren="On" />
                  </Form.Item>
                </div>
              </Col>
              <Form.Item>
                <TraxButton
                  htmlType="submit"
                  styleType="primary"
                  buttonSize='full'
                  buttonText="Save changes"
                  loading={updating}
                  disabled={updating}
                />
              </Form.Item>
              <h1 className="profile-page-heading">Password</h1>
              <Col lg={24} md={24} xs={24} >
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right" >New password</p>
                  <Form.Item
                    name="password"
                    hasFeedback
                    className='w-[75%]'
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
              <Col lg={24} md={24} xs={24} >
                <div className=' flex flex-row gap-4 w-full'>
                  <p className="account-form-item-tag w-[25%] text-right" >Confirm password</p>
                  <Form.Item
                    name="confirm-password"
                    dependencies={['password']}
                    hasFeedback
                    className='w-[75%]'
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
                  loading={updating}
                  disabled={updating}
                />
              </Form.Item>
            </div>


          </Tabs.TabPane>


          <Tabs.TabPane tab={<span className='uppercase font-heading text-xl'>Crypto</span>} key="wallets">

            <div className="account-form-settings" >
              <div style={{ width: '100%' }}>
                <h1 className="profile-page-heading">Crypto</h1>
                <span className='profile-page-subtitle'>Connect a wallet to make use of TRAX's web3 features</span>
                {walletNFID ? (
                  <div className='profile-form-box-connected'>
                    <span className='text-lg text-trax-white '>Wallet connected</span>
                    <span className='text-trax-gray-300'>You have successfully connected a wallet. If you would like to disconnect your wallet, please click 'Disconnect' below.</span>
                    <div className='w-full flex justify-end'>
                      <Row>
                        <Form.Item
                          name="wallet_icp"
                          label=""
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            { required: false, message: 'Please input your NFID principal address!' }
                          ]}
                        >
                          <Input className="account-form-input" value={walletNFID} readOnly />
                        </Form.Item>
                      </Row>
                      <Form.Item>
                        <TraxButton
                          htmlType="button"
                          styleType="secondary"
                          buttonSize='full'
                          buttonText="Disonnect"
                          onClick={() => disconnectWallet('')}
                        />
                      </Form.Item>
                    </div>
                  </div>
                ) : (
                  <div className='profile-form-box-unconnected'>
                    <span className='text-lg text-trax-black '>Connect wallet</span>
                    <span className='text-trax-gray-700 text-sm'>
                      By clicking 'Connect' you will be redirected to connect your
                      <a href="https://plugwallet.ooo/" target="_blank" rel="noopener noreferrer" className='text-trax-blue-500'> Plug Wallet </a>
                      or
                      <a href="https://identity.ic0.app/" target="_blank" rel="noopener noreferrer" className='text-trax-blue-500'> Internet Identity</a>.
                    </span>                <div className='w-full flex justify-end'>

                      <Form.Item>
                        <TraxButton
                          htmlType="button"
                          styleType="primary"
                          buttonSize='full'
                          buttonText="Connect"
                          onClick={() => setOpenConnectModal(true)}
                        />
                      </Form.Item>
                    </div>
                  </div>
                )}

                {isMobile ? (
                  <SlideUpModal
                    isOpen={openConnectModal}
                    onClose={() => setOpenConnectModal(false)}
                  >
                    <div className='p-8'>
                      <div style={{ marginBottom: '15px' }} >
                        <span style={{ fontSize: '23px', fontWeight: '600', color: 'white' }}>Connect </span>
                        <br />
                        <span style={{ fontSize: '14px', color: 'grey' }}>Select your preferred wallet to connect to TRAX</span>
                      </div>
                      <InternetIdentityProvider {...InternetIdentityProviderProps}>
                        <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer={false} oldWalletPrincipal={user.account?.wallet_icp} />
                      </InternetIdentityProvider>
                    </div>
                  </SlideUpModal>
                ) : (
                  <div className='sign-in-modal-wrapper'>
                    <Modal
                      key="purchase_post"
                      className=""
                      title={null}
                      open={openConnectModal}
                      footer={null}
                      width={600}
                      destroyOnClose
                      onCancel={() => setOpenConnectModal(false)}
                    >
                      <div className='p-8'>


                        <div style={{ marginBottom: '15px' }} >

                          <span style={{ fontSize: '23px', fontWeight: '600', color: 'white' }}>Connect </span>
                          <br />
                          <span style={{ fontSize: '14px', color: 'grey' }}>Select your preferred wallet to connect to TRAX</span>
                        </div>
                        <InternetIdentityProvider {...InternetIdentityProviderProps}>
                          <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer={false} oldWalletPrincipal={user.account?.wallet_icp} />
                        </InternetIdentityProvider>
                      </div>
                    </Modal>
                  </div>
                )}
              </div>
            </div>

          </Tabs.TabPane>

          <Tabs.TabPane tab={<span className='uppercase font-heading text-xl'>Billing</span>} key="subscription">
            <div className="account-form-settings">
              <h1 className="profile-page-heading">Payment methods</h1>
              <span className='profile-page-subtitle'>Your saved payment methods are encrypted and stored securely by Stripe.</span>

              {loadingCards ? (
                <div className="text-center">
                  <Spin />
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  {cards.map((card) => (
                    <div key={card.id} className="bg-custom-gray rounded-lg py-2 px-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCardOutlined className="text-trax-white text-2xl mr-4" />
                        <div>
                          <p className="text-trax-white font-bold text-lg">
                            {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} ... {card.last4}
                          </p>
                          <p className="text-trax-white text-base">Expiry: {card.exp_month}/{card.exp_year.toString().slice(-2)}</p>
                        </div>
                      </div>
                      <Button
                        icon={<MoreOutlined />}
                        className="text-trax-white bg-trax-transparent border-none hover:bg-trax-gray-700 rotate-90"
                        onClick={() => handleRemoveCard(card.id)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Form.Item>
                <TraxButton
                  htmlType="button"
                  styleType="primary"
                  buttonSize='full'
                  buttonText="Add card"
                  onClick={handleAddCard}
                />
              </Form.Item>
              <Modal
                open={isCardModalVisible}
                onCancel={handleCardModalClose}
                footer={null}
                width={600}
              >
                <NewCardPage settings={settings} onSuccess={handleCardModalClose} isPPV={false}/>
              </Modal>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<span className='uppercase font-heading text-xl'>Authentication</span>} key="authentication">
            <div className="account-form-settings">
              <h1 className="profile-page-heading">2FA authentication</h1>
              <span className='profile-page-subtitle'>Enable Two factor authentication for additional security.</span>
              {!enabled2fa ?
                <TraxButton
                  htmlType="button"
                  styleType="primary"
                  buttonSize='medium'
                  buttonText="Enable 2FA"
                  onClick={() => enable2FA()}
                /> :
                <TraxButton
                  htmlType="button"
                  styleType="secondary"
                  buttonSize='medium'
                  buttonText="Disable 2FA"
                  onClick={() => disable2FA()}
                />
              }
              <h1 className="profile-page-heading pt-8">SMS authentication</h1>
              <Col lg={12} md={12} xs={12} style={{ marginBottom: '24px', maxWidth: '100%' }}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                >
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(value) => {
                      setPhone(value);
                      form.setFieldsValue({ phone: value });
                    }}
                  />
                </Form.Item>
              </Col>
              <span className='text-trax-gray-300 mb-6 flex'>Enable SMS authentication for additional security.</span>
              {!enabledSms ?
                <TraxButton
                  htmlType="button"
                  styleType="primary"
                  buttonSize='medium'
                  buttonText="Enable SMS Auth"
                  onClick={enableSms}
                /> :
                <TraxButton
                  htmlType="button"
                  styleType="secondary"
                  buttonSize='medium'
                  buttonText="Disable SMS Auth"
                  onClick={disableSms}
                />
              }
            </div>
          </Tabs.TabPane>

        </Tabs>
        <Modal
          key="enable2fa"
          className="enable2fa"
          title={null}
          open={openEnable2fa}
          footer={null}
          width={600}
          destroyOnClose
          onCancel={() => setEnabled2FAModal(false)}
        >
          <div className='p-8'>
            <div className="mb-4" >
              <span className="text-2xl font-semibold text-trax-white">Connect your 2FA Authenticator with this QR code</span>
              <br />
              <Image alt="qr_code" src={qrCode} className="w-fit lg:w-full max-w-md my-4" />
              <br />
              <Input
                placeholder="Enter the token from your authenticator app"
                value={tokenField} onChange={(e) => setTokenField(e.target.value)}
                className="mb-4 rounded-lg"
              />

              <TraxButton
                htmlType="button"
                styleType="primary"
                buttonSize='medium'
                buttonText="Verify 2FA"
                onClick={() => verify2FA()}
              />
            </div>

          </div>
        </Modal>
        <Modal
          key="enableSms"
          className="enableSms"
          title={null}
          open={openEnableSms}
          footer={null}
          width={600}
          destroyOnClose
          onCancel={() => setEnabledSmsModal(false)}
        >
          <div className='p-8'>
            <div className="mb-4">
              <span className="text-2xl font-semibold text-trax-white">Connect your Phone with SMS code</span>
              <br />
              <Input
                placeholder="Enter the SMS code sent to your phone"
                value={tokenSmsField} onChange={(e) => setTokenSmsField(e.target.value)}
                className="my-4 rounded-lg"
              />
              <TraxButton
                htmlType="button"
                styleType="primary"
                buttonSize='medium'
                buttonText="Verify SMS"
                onClick={() => verifySms()}
              />
            </div>

          </div>
        </Modal>
      </Form>
    </div>
  );
}

const mapStates = (state: any) => ({
  settings: { ...state.settings }
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(UserAccountForm);