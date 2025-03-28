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
  username: string;
  isArtistCreate?: boolean;
  //onCancel(isOpen: boolean, modal: string): Function;
}

class SignUpModal extends PureComponent<IProps> {
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
/*
  constructor(props) {
    super(props);

    this.debouncedCheckValidEmail = debounce(
      (email: string) =>
        new Promise((resolve, reject) => {
          this.checkValidEmail(email)
            .then(resolve)
            .catch(reject);
        }),
      500
    );
  }*/

  async componentDidMount() {
    const { username, isArtistCreate } = this.props;

    // Get referral code from URL if present
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCodeFromUrl = urlParams.get('referralCode');
      
      if (referralCodeFromUrl) {
        // If referral code exists in URL, store it in localStorage
        localStorage.setItem('referralCode', referralCodeFromUrl);
        this.setState({ referralCodeValue: referralCodeFromUrl });
      } else {
        // If no referral code in URL, ensure we have an empty string
        localStorage.setItem('referralCode', '');
        this.setState({ referralCodeValue: '' });
      }
    }

    const icpPrice = (await tokenTransctionService.getExchangeRate()).data.rate;
    const ckbtcPrice = (await tokenTransctionService.getExchangeRateBTC()).data.rate;

    this.setState({ icpPrice: icpPrice, ckbtcPrice: ckbtcPrice, emailValue: username, artistRegister: isArtistCreate ? true : false });
    this.debouncedCheckValidEmail = this.debouncedCheckValidEmail.bind(this);

    if (username) {
      const instance = this.formRef.current as FormInstance;
      instance.setFieldsValue({
        ['email']: username,
        //email: username
      });
      await instance.validateFields(['email']);
    }


    //this.checkValidEmail = debounce(this.checkValidEmail.bind(this), 500);
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

  debouncedCheckValidEmail = debounce(
    async (email: string) => {
      try {
        const res = await this.checkValidEmail(email);
        return res;
      } catch (error) {
        throw error;
      }
    },
    300, // Debounce delay
    { leading: false, trailing: true } // Ensures it only runs after debounce delay
  );

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

  onFinish = async (values) => {
    try {
      await this.formRef.current?.validateFields();
      this.handleRegister(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };
/*
  onFinish = (values) => {
    this.handleRegister(values);
    /*
    if (!this.state.artistRegister && this.state.stage === 3) {
      this.setState({ stage: this.state.stage + 2 })
    }
    else {
      this.setState({ stage: this.state.stage + 1 })
    };

    if (this.state.stage === 3 && !this.state.artistRegister) {

    }
    else if (this.state.stage === 4 && this.state.artistRegister) {
      this.register(values);
    }
  };*/

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
      // message.success(`Your application will be processed within 24 to 48 hours, most times sooner. You will get an email notification sent to your email address with the status update.`)
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

    console.log(stage)

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
            <div className='flex flex-col w-full justify-between gap-2 mt-6 mb-4'>
              <div className='flex-row flex w-full justify-between'>
                <span className='main-title justify-start font-heading uppercase pt-[9px]'>
                  {stage === 1 && ("Sign up")}
                  {stage === 2 && "Add referral code"}
                  {stage === 3 && "Set your display name"}
                  {stage === 4 && "Add referral code"}
                  {stage === 5 && "Thanks for signing up"}
                </span>
                <img alt="logo" width={90} height={70} className='flex min-w-[9rem]  justify-end' src="/static/TRAX_LOGOMARK_VERDE.png" />
              </div>

              <span className='text-[#b3b3b3]'>
                {stage === 1 && "Choose a strong password with at least 8 characters and 1 special character. Set your display name that will be displayed on your TRAX profile."}
                {stage === 2 && "Reward the person who brought you to TRAX and paste their referral code below."}
                {stage === 5 && `To verify your account, click on the link sent to your inbox ${(emailValue)}`}
              </span>
            </div>

          </div>
          <div className={`${stage !== 5 ? 'sign-in-options-wrapper' : 'no-display'}`}>

            <Form
              ref={this.formRef}
              initialValues={{ remember: true, referralCode, email: emailValue }}
              onFinish={this.onFinish.bind(this)}
              onFinishFailed={(error: any) => console.log("Form error", error)}
              scrollToFirstError
              className='log-in-form'
            >
              <div className={`${stage === 1 ? 'display-contents' : 'no-display'}`}>
                <div className='email-wrapper'>

                  <div className='email-wrapper py-1'>
                    <Form.Item
                      name="email"
                      validateTrigger={stage === 1 ? ['onChange', 'onBlur'] : []}
                      rules={stage === 1 ? [
                        {
                          type: 'email',
                          message: 'The input is not a valid E-mail.'
                        },
                        {
                          required: true,
                          message: 'Please input your E-mail.'
                        },
                        {
                          validator: async (_, value) => {
                            if (!value) {
                              return Promise.resolve();
                            }
                            try {
                              const res: any = await new Promise((resolve, reject) => {
                                this.debouncedCheckValidEmail(value)
                                  .then(resolve)
                                  .catch(reject);
                              });

                              if (res && res?.result === 0) {
                                return Promise.resolve();
                              } else {
                                return Promise.reject(new Error('Email is already taken!'));
                              }
                            } catch (error) {
                              return Promise.resolve();
                              //return Promise.reject(error.message || 'Error occurred');
                            }
                          }
                        }
                      ] : []}
                    >
                      <TraxInputField
                        type="email"
                        name="emailValue"
                        label="Email"
                        value={this.formRef.current?.getFieldValue('email') || emailValue}
                        onChange={this.handleInputChange}
                        onBlur={() => this.handleFieldBlur('email')}
                        error={this.formRef.current?.getFieldError('email')?.[0]}
                      />
                    </Form.Item>
                  </div>

                  <div className='email-wrapper py-1'>
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
                    {/* <div className='email-wrapper py-2'>
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
                    </div> */}
             
                </div>
                <div className='email-wrapper py-1'>
                  <Form.Item
                    name="password"
                    validateTrigger={stage === 2 ? ['onChange', 'onBlur'] : []}
                    rules={stage === 2 ? [
                      {
                        pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                        message:
                          'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character.'
                      },
                      { required: false, message: 'Please input your password.' }
                    ] : []}
                  >
                    <TraxInputField
                      type="password"
                      name="passwordValue"
                      label="Password"
                      value={passwordValue}
                      onChange={this.handleInputChange}
                      onBlur={() => this.handleFieldBlur('password')}
                      error={this.formRef.current?.getFieldError('password')?.[0]}
                    />
                  </Form.Item>
                </div>
                <div className='email-wrapper py-1'>
                  <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    validateTrigger={stage === 2 ? ['onChange', 'onBlur'] : []}
                    rules={stage === 2 ? [
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
                    ] : []}
                  >
                    <TraxInputField
                      type="password"
                      name="confirmPasswordValue"
                      label="Confirm password"
                      value={confirmPasswordValue}
                      onChange={this.handleInputChange}
                      onBlur={() => this.handleFieldBlur('confirm')}
                      error={this.formRef.current?.getFieldError('confirm')?.[0]}
                    />
                  </Form.Item>

                <Form.Item name="unsubscribed" valuePropName="checked">
                    <Checkbox className='text-trax-gray-500 mt-6' defaultChecked>I agree to receive offers, news and updates from TRAX.</Checkbox>
                  </Form.Item>
                </div>
              </div>


              <div className={`${stage === 2 ? 'display-contents gap-2' : 'no-display'}`}>
              <div className='email-wrapper py-4'>
                    <Form.Item
                      name="referralCode"
                      validateTrigger={stage === 4 ? ['onChange', 'onBlur'] : []}
                      rules={[
                        { required: false },
                        { validator: this.validateReferralCode }
                      ]}
                    >
                      <TraxInputField
                        type="text"
                        name="referralCodeValue"
                        label="Referral code"
                        optional={true}
                        value={referralCodeValue}
                        onChange={this.handleInputChange}
                        onBlur={() => this.handleFieldBlur('referralCode')}
                        error={this.formRef.current?.getFieldError('referralCode')?.[0]}
                      />
                    </Form.Item>
                  </div>
              </div>

              <div className={`${stage === 3 ? 'display-contents gap-2' : 'no-display'}`}>
                
              </div>

         
                <div className={`${stage === 4 ? 'display-contents' : 'no-display'}`}>
                  
                </div>
            

              <div className='log-in-btn-wrapper py-4'>
                {stage === 1 && (
                  <Form.Item>
                    <TraxButton
                      htmlType="button"
                      styleType="primary"
                      buttonSize='full'
                      buttonText="Continue"
                      loading={submiting || isLoading}
                      disabled={!passwordValue.trim() || !confirmPasswordValue.trim() || !emailValue.trim() || submiting || isLoading}
                      onClick={() => this.setState({stage: 2})}
                    />
                  </Form.Item>
                )}
                {stage === 2 && (
                  <Form.Item>
                    <TraxButton
                      htmlType="submit"
                      styleType="primary"
                      buttonSize='full'
                      buttonText={"Create account"}
                      loading={registerPerformerData.requesting || submiting || isLoading}
                      disabled={registerPerformerData.requesting || submiting || isLoading}
                    />
                    {/* <TraxButton
                      htmlType="button"
                      styleType="primary"
                      buttonSize='full'
                      buttonText="Create account"
                      loading={submiting || isLoading}
                      disabled={!passwordValue.trim() || !confirmPasswordValue.trim() || submiting || isLoading}
                      onClick={() => this.setState({stage: 3})}
                    /> */}
                  </Form.Item>
                )}

                {stage === 3 && (
                  <Form.Item>
                    {!artistRegister ? (
                      <TraxButton
                        htmlType="button"
                        styleType="primary"
                        buttonSize='full'
                        buttonText="Continue"
                        loading={registerPerformerData.requesting || submiting || isLoading}
                        disabled={!nameValue.trim() || registerPerformerData.requesting || submiting || isLoading}
                        onClick={() => this.setState({stage: 4})}
                      />
                    ) : (
                      <TraxButton
                        htmlType="button"
                        styleType="primary"
                        buttonSize='full'
                        buttonText="Continue"
                        loading={submiting || isLoading}
                        disabled={!nameValue.trim() || submiting || isLoading}
                        onClick={() => this.setState({stage: 4})}
                      />
                    )}
                  </Form.Item>
                )}

                {stage === 4 && (
                  <Form.Item>
                    <TraxButton
                      htmlType="submit"
                      styleType="primary"
                      buttonSize='full'
                      buttonText={"Create account"}
                      loading={registerPerformerData.requesting || submiting || isLoading}
                      disabled={registerPerformerData.requesting || submiting || isLoading}
                    />
                  </Form.Item>
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
            <div className={`${artistRegister ? 'py-3' : 'py-3 lg:pt-9 '} mb-8`}>
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
