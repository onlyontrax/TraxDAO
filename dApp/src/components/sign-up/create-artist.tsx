/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import React, { PureComponent } from 'react';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { PerformerVerificationForm } from '@components/performer';
import { tokenTransctionService, cryptoService, authService, performerService, userService } from '@services/index';
import { connect } from 'react-redux';
import { loginSocial, loginNfid, registerFan, registerPerformer } from '@redux/auth/actions';
import { Input, Form, Checkbox, message, FormInstance } from 'antd';
import { ISettings, IUIConfig } from 'src/interfaces';
import Link from 'next/link'
import { debounce } from 'lodash';
import { Auth } from 'src/crypto/nfid/Auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import AuthFrame from '../common/base/auth-frame'
import { IPerformer } from 'src/interfaces';
import Image from 'next/image';
import logo from '../../../public/static/trax_primary_logotype.svg'
import TraxButton from '@components/common/TraxButton';
import TraxToggle from '@components/common/TraxToggleButton';
import TraxInputField from '@components/common/layout/TraxInputField';

interface IProps {
  ui: IUIConfig;
  settings: ISettings;
  store: any;
  loginNfid: Function;
  registerFan: Function;
  registerFanData: any;
  registerPerformer: Function;
  registerPerformerData: any;
  onFinish(isOpen: boolean, modal: string): Function;
  user: IPerformer;
  //onCancel(isOpen: boolean, modal: string): Function;
}

class CreateArtistModal extends PureComponent<IProps> {
  formRef = React.createRef<FormInstance>();
  static authenticate = false;
  static layout = 'blank';
  idVerificationFile = null;
  documentVerificationFile = null;

  state = {
    btnTipDisabled: false,
    openInfo: false,
    recaptchaSuccess: false,
    isLoading: false,
    artistRegister: true,
    stage: 1,
    emailValue: '',
    usernameValue: '',
    passwordValue: '',
    confirmPasswordValue: '',
    nameValue: '',
    referralCodeValue: '',
    tempUser: null,
  };

  async componentDidMount() {

    const icpPrice = (await tokenTransctionService.getExchangeRate()).data.rate;
    const ckbtcPrice = (await tokenTransctionService.getExchangeRateBTC()).data.rate;

    this.setState({ icpPrice: icpPrice, ckbtcPrice: ckbtcPrice });

    this.checkValidUsername = debounce(this.checkValidUsername.bind(this), 500);
  }

  hasSignedUp(signedUp: boolean) {
    const { onFinish: loggedIn } = this.props;
    signedUp && loggedIn(false, 'exit');
  }

  handleRegister = (data: any) => {
    const { registerFan: handleRegister, onFinish: signedUp } = this.props;
    handleRegister(data);
    signedUp(false, 'exit');
  };

  onNFIDLogin(resp: any) {
    const { loginNfid: loginNfidHandle } = this.props;
    return cryptoService.onNFIDLogin(resp, 'sign-up', loginNfidHandle, this.hasSignedUp.bind(this));
  }

  validateReferralCode = async (rule, value, callback) => {
    if (!value) return true;
    const res = await authService.verifyReferralCode({ referralCode: value });

    if (!(res.data.isValid)) {
      throw new Error('Invalid referral code!');
    }
  };

  checkValidUsername = async (username) => {
    try {
      const resp = (
        await authService.registerCheckField({
          username
        })
      ).data;
      return resp;
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      return { result: 1 };
    }
  };

  handleInputChange = async (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  handleFieldBlur = (fieldName: string) => {
    this.formRef.current?.validateFields([fieldName])
      .catch(() => {
        this.forceUpdate();
      });
  };

  onFinish = (values) => {
    this.register(values);
  };

  register = async (values: any) => {
    const data = values;
    const { onFinish: signedUp } = this.props;

    const { registerPerformer: registerPerformerHandler } = this.props;
    // signedUp(false, 'exit')
    try {
      const res = await registerPerformerHandler(data);
      signedUp(false, 'exit');
      // message.success(`Your application will be processed within 24 to 48 hours, most times sooner. You will get an email notification sent to your email address with the status update.`)
    } catch (e) {
      console.log("This is error", e)
    }
    // return
  };

  render() {
    const { ui, registerFanData, registerPerformerData = { requesting: false } } = this.props;
    const { isLoading, artistRegister, stage, emailValue, usernameValue, passwordValue, confirmPasswordValue, nameValue, referralCodeValue, tempUser } = this.state;
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';
    const { openInfo } = this.state;

    return (
      <AuthFrame>
        <div className='sign-up-section'>
          {(stage > 1 && stage < 5) && (
            <div className='text-[#A8FF00] w-12 h-12  cursor-pointer text-xl bg-[#1A1A1A] rounded-full mt-4' onClick={() => {
              this.setState({ stage: stage - 1 })
            }}>
              <FontAwesomeIcon className='sign-up-back-arrow px-auto py-auto ' icon={faArrowLeft} />

            </div>
          )}
          <div className='log-in-header -mb-1 lg:mb-0'>
            {/* {window.innerWidth < 640 && (

          )} */}
            <div className='flex flex-col w-full justify-between gap-2 mt-6'>
              {/* <div className='flex-row flex w-full justify-between'>
                <span className='main-title justify-start font-heading uppercase pt-[9px]'>
                  {stage === 1 && "Create Artist Profile"}
                  {stage === 2 && ""}
                  {stage === 3 && ""}
                  {stage === 4 && ""}
                  {stage === 5 && "Thanks for signing up"}
                </span>
                <img alt="logo" width={90} height={70} className='flex justify-end' src="/static/TRAX_LOGOMARK_VERDE.png" />
              </div> */}
              <div className="log-in-header mx-auto flex font-heading flex-col justify-center items-left mt-6 sm:mt-auto">
                <div className='flex flex-col w-full justify-between gap-2'>
                  <img alt="logo" width={80} height={80} className='flex mx-auto mt-0' src="/static/TRAX_LOGOMARK_VERDE.png" />
                  <span className='text-[#FFF] font-body text-[26px] text-center mt-2 mb-3 sm:mb-0 sm:mt-2'>
                    {stage === 1 && "Create Artist Profile"}
                    {stage === 2 && ""}
                    {stage === 3 && ""}
                    {stage === 4 && ""}
                    {stage === 5 && "Thanks for signing up"}</span>
                </div>
              </div>

              <span className='text-[#b3b3b3]'>
                {stage === 2 && ""}
                {stage === 3 && ""}
                {stage === 4 && ""}
                {stage === 5 && ``}
              </span>
            </div>

          </div>
          <div className={`${stage !== 5 ? 'sign-in-options-wrapper' : 'no-display'}`}>

            <Form
              ref={this.formRef}
              initialValues={{}}
              onFinish={this.onFinish.bind(this)}
              onFinishFailed={(error: any) => console.log("Form error", error)}
              scrollToFirstError
              className='log-in-form'
            >
              <div className={`${stage === 1 ? 'display-contents' : 'no-display'}`}>

                <div className='email-wrapper py-2'>
                  <Form.Item
                    name="username"
                    validateTrigger={stage === 1 ? ['onChange', 'onBlur'] : []}
                    rules={stage === 1 ? [
                      { required: true, message: 'Please input your username.' },
                      {
                        pattern: /^[a-z0-9]+$/g,
                        message: 'Username must contain only lowercase alphanumerics only.'
                      },
                      { min: 3, message: 'Username must contain at least 3 characters.' },
                      {
                        validator: async (rule, value) => {
                          if (!value) {
                            return Promise.resolve();
                          }
                          try {
                            const res = await this.checkValidUsername(value);
                            if (res && res.result === 0) {
                              return Promise.resolve();
                            }
                            return Promise.reject('Username is already taken!');
                          } catch (error) {
                            return Promise.reject(error.message || 'Error occurred');
                          }
                        }
                      }
                    ] : []}
                  >
                    <TraxInputField
                      type="text"
                      name="usernameValue"
                      label="Username"
                      value={usernameValue}
                      onChange={this.handleInputChange}
                      onBlur={() => this.handleFieldBlur('username')}
                      error={this.formRef.current?.getFieldError('username')?.[0]}
                    />
                  </Form.Item>
                </div>

                <div className='email-wrapper'>
                  <Form.Item
                    name="name"
                    validateTrigger={stage === 3 ? ['onChange', 'onBlur'] : []}
                    rules={stage === 3 ? [
                      { required: false, message: 'Please input your display name.' },
                      {
                        pattern: /^(?=.*\S).+$/g,
                        message: 'Display name can not contain whitespace.'
                      },
                      {
                        min: 3,
                        message: 'Display name can not be less than 3 characters.'
                      }
                    ] : []}
                  >
                    <TraxInputField
                      type="text"
                      name="nameValue"
                      label="Display name"
                      value={nameValue}
                      onChange={this.handleInputChange}
                      onBlur={() => this.handleFieldBlur('name')}
                      error={this.formRef.current?.getFieldError('name')?.[0]}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className='log-in-btn-wrapper py-4'>
                {stage === 1 && (
                  <Form.Item>
                    <TraxButton
                      htmlType="submit"
                      styleType="primary"
                      buttonSize='full'
                      buttonText="Submit"
                      loading={isLoading}
                      disabled={!usernameValue.trim() || isLoading}
                    />
                  </Form.Item>
                )}

              </div>
            </Form>
          </div>

          {artistRegister && tempUser !== null && (
            <div className={`${stage === 5 && tempUser !== null ? 'display-contents' : 'no-display'}`}>
              <PerformerVerificationForm registeredUser={tempUser} user={this.props.user} signUp />
            </div>
          )}

          <div className={`${stage !== 1 ? 'display-contents' : 'no-display'}`}>
            <div className='sign-in-link mt-8 lg:mt-36'>
              <span className='new-to'>
                This site is protected by reCAPTCHA and the <Link href="/page?id=privacy-policy" target="_blank" className='get-started text-trax-gray-500'>TRAX Privacy Policy</Link> and <Link href="/page?id=terms-of-service" target="_blank" className='get-started text-trax-gray-500'>Terms of Service</Link> apply. </span>
            </div>
          </div>
        </div>
      </AuthFrame>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  loginAuth: { ...state.auth.loginAuth },
  registerFanData: { ...state.auth.registerFanData },
  registerPerformerData: { ...state.auth.registerPerformerData },
  store: { ...state },
  user: { ...state.user },
});

const mapDispatchToProps = {
  registerFan,
  registerPerformer,
  loginSocial,
  loginNfid
};

export default connect(mapStatesToProps, mapDispatchToProps)(CreateArtistModal);
