/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import { PureComponent } from 'react';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { PerformerVerificationForm } from '@components/performer';
import { tokenTransctionService, cryptoService, authService, performerService, userService } from '@services/index';
import { connect } from 'react-redux';
import { loginSocial, loginNfid, registerFan, registerPerformer } from '@redux/auth/actions';
import {
  Button, Select, Input, Form, Checkbox, message
} from 'antd';
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

class SignUpModal extends PureComponent<IProps> {
  static authenticate = false;
  static layout = 'blank';
  idVerificationFile = null;
  documentVerificationFile = null;

  state = {
    btnTipDisabled: false,
    openInfo: false,
    recaptchaSuccess: false,
    isLoading: false,
    artistRegister: false,
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
    this.checkValidEmail = debounce(this.checkValidEmail.bind(this), 500);
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

  checkValidEmail = async (email) => {
    try {
      const resp = (
        await authService.registerCheckField({
          email
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

  onFinish = (values) => {
    if (!this.state.artistRegister && this.state.stage === 3) {
      this.setState({ stage: this.state.stage + 2 })
    }
    else {
      this.setState({ stage: this.state.stage + 1 })
    };

    if (this.state.stage === 3 && !this.state.artistRegister) {
      this.handleRegister(values);
    }
    else if (this.state.stage === 4 && this.state.artistRegister) {
      this.register(values);
    }
  };

  register = async (values: any) => {
    const data = values;
    const { onFinish: signedUp } = this.props;

    const { registerPerformer: registerPerformerHandler } = this.props;
    // signedUp(false, 'exit')
    try {
      await registerPerformerHandler(data);
      const token = localStorage.getItem("tempToken")
      if (token) {
        const user = await userService.me({
          Authorization: token
        });
        await this.setState({
          tempUser: user.data
        })
      }
      message.success(`Your application will be processed within 24 to 48 hours, most times sooner. You will get an email notification sent to your email address with the status update.`)
    } catch (e) {
      console.log("This is error", e)
    }
    // return
  };


  render() {
    const { ui, registerFanData, registerPerformerData = { requesting: false } } = this.props;
    const { requesting: submiting } = registerFanData;
    const { isLoading, artistRegister, stage, emailValue, usernameValue, passwordValue, confirmPasswordValue, nameValue, referralCodeValue, tempUser } = this.state;
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';
    const { openInfo } = this.state;

    return (
      <AuthFrame>
        <div className='sign-up-section'>
          {(stage > 1 && stage < 5) && (
            <div className='text-[#A8FF00] w-12 h-12  cursor-pointer text-xl bg-[#1A1A1A] rounded-full' onClick={() => {
              this.setState({ stage: stage - 1 })
            }}>
              <FontAwesomeIcon className='sign-up-back-arrow px-auto py-auto' icon={faArrowLeft} />

            </div>
          )}
          <div className='log-in-header -mb-1 lg:mb-0'>
            {stage === 1 && (
              <div>
                 <Image alt="logo" width={120} height={100} className='mt-3 mb-3' src={logo}/>
                <h1 className='main-title font-heading md:mt-3 mt-3'>Create an account</h1>

              </div>
            )}
            {stage === 2 && (
              <div>
                 <Image alt="logo" width={120} height={100} className='mt-3 mb-3' src={logo}/>
                <h1 className='main-title font-heading text-left'>Enter a password</h1>
                <p className='main-subtitle text-left'>Choose a strong password with at least 8 characters and 1 special character.</p>
              </div>
            )}
            {stage === 3 && (
              <div>
                 <Image alt="logo" width={120} height={100} className='mt-3 mb-3' src={logo}/>
                <h1 className='main-title font-heading text-left'>Set your display name</h1>
                <p className='main-subtitle text-left'>Set your display name that will be displayed on your TRAX profile.</p>
              </div>
            )}
            {stage === 4 && (
              <div>
                 <Image alt="logo" width={120} height={100} className='mt-3 mb-3' src={logo}/>
                <h1 className='main-title font-heading text-left'>Add referral code</h1>
                <p className='main-subtitle text-left'>Reward the person who brought you to TRAX and paste their referral code below.</p>
              </div>
            )}
            {stage === 5 && (
              <div>
                 <Image alt="logo" width={120} height={100} className='mt-3 mb-3' src={logo}/>
                <h1 className='main-title text-left font-heading pb-2'>Thanks for signing up</h1>
                <p className='main-subtitle text-left'>To verify your account, click on the link sent to your inbox ({emailValue})</p>
              </div>
            )}
          </div>
          <div className={`${stage !== 5 ? 'sign-in-options-wrapper' : 'no-display'}`}>

            <Form
              initialValues={{ remember: true, referralCode }}
              onFinish={this.onFinish.bind(this)}
              onFinishFailed={(error: any) => console.log("Form error", error)}
              scrollToFirstError
              className='log-in-form'
            >
              <div className={`${stage === 1 ? 'display-contents' : 'no-display'}`}>
                <div className='email-wrapper'>

                  <div className='log-in-btn-wrapper flex justify-between gap-4'>
                    <Form.Item className='w-full'>
                      <Button
                        disabled={isLoading}
                        loading={isLoading}
                        htmlType="button"
                        className={`log-in-btn ${!artistRegister ? 'selected' : 'nonselected'}`}
                        onClick={() => this.setState({ artistRegister: false })}
                      >
                        I'm a fan
                      </Button>
                    </Form.Item>
                    <Form.Item className='w-full'>
                      <Button
                        disabled={isLoading}
                        loading={isLoading}
                        htmlType="button"
                        className={`log-in-btn ${artistRegister ? 'selected' : 'nonselected'}`}
                        onClick={() => this.setState({ artistRegister: true })}
                      >
                        I'm an artist
                      </Button>
                    </Form.Item>
                  </div>

                  <div className='email-wrapper'>
                    <Form.Item
                      name="email"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          type: 'email',
                          message: 'The input is not valid E-mail.'
                        },
                        {
                          required: true,
                          message: 'Please input your E-mail.'
                        },
                        {
                          validator: async (rule, value) => {
                            if (!value) {
                              return Promise.resolve();
                            }
                            try {
                              const res = await this.checkValidEmail(value);
                              if (res && res.result === 0) {
                                return Promise.resolve();
                              }
                              return Promise.reject('Email is already taken!');
                            } catch (error) {
                              return Promise.reject(error.message || 'Error occurred');
                            }
                          }
                        }
                      ]}
                    >
                      <div className="relative">
                        <Input
                          type="text"
                          name="emailValue"
                          id="emailInput"
                          onChange={this.handleInputChange}
                        />
                        <label
                          htmlFor="emailInput"
                          className={`floating-label text-center ${this.state.emailValue ? 'label-transition-active' : 'label-transition-initial'
                            }`}
                        >
                          Email
                        </label>
                      </div>
                    </Form.Item>
                  </div>

                  <div className='email-wrapper'>
                    <Form.Item
                      name="username"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
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
                      ]}
                    >
                      <div className="relative">
                        <Input
                          type="text"
                          name="usernameValue"
                          id="usernameInput"
                          onChange={this.handleInputChange}
                        />
                        <label
                          htmlFor="usernameInput"
                          className={`floating-label text-center ${this.state.usernameValue ? 'label-transition-active' : 'label-transition-initial'
                            }`}
                        >
                          Username
                        </label>
                      </div>
                    </Form.Item>
                  </div>
                  <Form.Item name="unsubscribed" valuePropName="checked">
                    <Checkbox className='text-trax-gray-500 mt-6' defaultChecked>I agree to receive offers, news and updates from TRAX.</Checkbox>
                  </Form.Item>
                </div>
              </div>


              <div className={`${stage === 2 ? 'display-contents gap-2' : 'no-display'}`}>
                <div className='email-wrapper py-2'>
                  <Form.Item
                    name="password"
                    className='w-full h-12 my-0 py-0'
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                        message:
                          'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character.'
                      },
                      { required: false, message: 'Please input your password.' }
                    ]}
                  >
                    <div className="relative">
                      <Input.Password
                        type="password"
                        name="passwordValue"
                        id="passwordInput"
                        visibilityToggle={true}
                        onChange={this.handleInputChange}
                      />
                      <label
                        htmlFor="passwordInput"
                        className={`floating-label ${this.state.passwordValue ? 'label-transition-active' : 'label-transition-initial'
                          }`}
                      >
                        Password
                      </label>
                    </div>
                  </Form.Item>
                </div>
                <div className='email-wrapper py-8'>
                  <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    className='w-full h-12 my-0 py-0'
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: false,
                        message: 'Please enter the same password as above.'
                      },
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject('Passwords do not match.');
                        }
                      })
                    ]}
                  >
                    <div className="relative">
                      <Input.Password
                        type="password"
                        name="confirmPasswordValue"
                        id="confirmPasswordInput"
                        visibilityToggle={true}
                        onChange={this.handleInputChange}
                      />
                      <label
                        htmlFor="confirmPasswordInput"
                        className={`floating-label ${this.state.confirmPasswordValue ? 'label-transition-active' : 'label-transition-initial'
                          }`}
                      >
                        Confirm password
                      </label>
                    </div>
                  </Form.Item>
                </div>
              </div>

              <div className={`${stage === 3 ? 'display-contents gap-2' : 'no-display'}`}>
                <div className='email-wrapper py-4'>
                  <Form.Item
                    name="name"
                    className='w-full h-12 my-0 py-0'
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: false, message: 'Please input your display name.' },
                      {
                        pattern: /^(?=.*\S).+$/g,
                        message: 'Display name can not contain whitespace.'
                      },
                      {
                        min: 3,
                        message: 'Display name can not be less than 3 characters.'
                      }
                    ]}
                  >
                    <div className="relative">
                      <Input
                        type="text"
                        name="nameValue"
                        id="nameInput"
                        onChange={this.handleInputChange}
                      // onChange={(e)=> this.setState({displayName: e.target.value})}
                      />
                      <label
                        htmlFor="nameInput"
                        className={`floating-label ${this.state.nameValue ? 'label-transition-active' : 'label-transition-initial'
                          }`}
                      >
                        Display name
                      </label>
                    </div>
                  </Form.Item>
                </div>
              </div>

              {artistRegister &&(
              <div className={`${stage === 4 ? 'display-contents': 'no-display'}`}>
                <div className='email-wrapper py-4'>
                  <Form.Item
                    name="referralCode"
                    className='w-full h-12 my-0 py-0'
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[{ required: false }]}
                  >
                    <div className="relative">
                      <Input
                        type="text"
                        name="referralCodeValue"
                        id="referralCodeInput"
                        onChange = {this.handleInputChange}
                        // onChange={(e)=> this.setState({_referralCode: e.target.value})}
                      />
                      <label
                        htmlFor="referralCodeInput"
                        className={`floating-label ${
                          this.state.referralCodeValue ? 'label-transition-active' : 'label-transition-initial'
                      }`}
                      >
                        Referral code
                        <span className="optional-badge">Optional</span>
                      </label>
                    </div>
                  </Form.Item>
                </div>
              </div>
              )}

              <div className='log-in-btn-wrapper py-4'>
                {stage === 1 && (
                  <Form.Item className='w-full'>
                    <Button
                      htmlType="submit"
                      disabled={!usernameValue.trim() || !emailValue.trim() || submiting || isLoading}
                      loading={submiting || isLoading}
                      className='log-in-btn sign-up'
                    >
                      Continue
                    </Button>
                  </Form.Item>
                )}
                {stage === 2 && (
                  <Button
                    htmlType="submit"
                    disabled={!passwordValue.trim() || !confirmPasswordValue.trim() || submiting || isLoading}
                    loading={submiting || isLoading}
                    className='log-in-btn sign-up'
                  >
                    Continue
                  </Button>
                )}

                {stage === 3 && (
                  <Form.Item style={{ width: '100%', paddingTop: '0' }}>
                    {!artistRegister ? (
                      <Button
                        htmlType="submit"
                        disabled={!nameValue.trim() || registerPerformerData.requesting || submiting || isLoading}
                        loading={registerPerformerData.requesting || submiting || isLoading}
                        className='log-in-btn sign-up'
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        htmlType="submit"
                        disabled={!nameValue.trim() || submiting || isLoading}
                        loading={submiting || isLoading}
                        className='log-in-btn sign-up'
                      >
                        Continue
                      </Button>
                    )}
                  </Form.Item>
                )}

                {stage === 4 && (
                  <Button
                    htmlType="submit"
                    disabled={registerPerformerData.requesting || submiting || isLoading}
                    loading={registerPerformerData.requesting || submiting || isLoading}
                    className='log-in-btn sign-up'
                  >
                    Skip
                  </Button>
                )}

              </div>
            </Form>
          </div>

          <div className={`${stage === 1 ? 'display-contents' : 'no-display'}`}>
            <div className={`${artistRegister ? 'sign-in-link mt-8 lg:mt-48' : 'sign-in-link -mt-1 lg:mt-2'}`}>
              <span className='new-to'>By clicking <span className='font-semibold'>Continue</span>, you agree to TRAX’s <Link href="/page?id=terms-of-service" target="_blank" className='get-started text-trax-gray-500'>Terms and Conditions</Link> and confirm
                you have read our <Link href="/page?id=privacy-policy" target="_blank" className='get-started text-trax-gray-500'>Privacy Notice.</Link></span>
            </div>
          </div>

          {!artistRegister && (
            <div className={`${stage === 1 ? 'display-contents' : 'no-display'}`}>
              <div className='divider'>
                <div className='hr-line' />
                <span>OR</span>
                <div className='hr-line' />
              </div>

              <InternetIdentityProvider
                {...cryptoService.getNfidInternetIdentityProviderProps(this.onNFIDLogin.bind(this))}
              >
                <Auth from="sign-up" onLoggedIn={this.hasSignedUp.bind(this)} />
              </InternetIdentityProvider>
            </div>
          )}

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

          <div className={`${stage < 5 ? 'display-contents sign-in-link' : 'no-display'}`}>
            <div className={`${artistRegister ? 'py-3' : 'py-3 lg:pt-9'}`}>
              <span className='new-to'>Already have a TRAX account? </span> <span onClick={() => this.props.onFinish(false, 'login')} className='get-started'>Log in</span>
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

export default connect(mapStatesToProps, mapDispatchToProps)(SignUpModal);
