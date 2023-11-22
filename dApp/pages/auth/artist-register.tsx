/* eslint-disable prefer-promise-reject-errors, react/sort-comp */
import { DatePicker } from '@components/common/datePicker';
import { ImageUploadModel } from '@components/file';
import { InformationCircleIcon } from '@heroicons/react/solid';
import { loginSocial, registerPerformer } from '@redux/auth/actions';
import { authService } from '@services/index';
import {
  Button, Col, Form, Image, Input, Layout, Row, Select, message, Spin
} from 'antd';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ICountry, ISettings, IUIConfig } from 'src/interfaces';
import { utilsService,performerService } from 'src/services';
import styles from './index.module.scss';
import { debounce } from 'lodash';
const { Option } = Select;

interface IProps {
  loginSocial: Function;
  registerPerformerData: any;
  registerPerformer: Function;
  ui: IUIConfig;
  settings: ISettings;
  countries: ICountry[];
}

class RegisterPerformer extends PureComponent<IProps> {
  static layout = 'blank';

  static authenticate = false;

  idVerificationFile = null;

  documentVerificationFile = null;

  async getData() {
    try {
      const [countries] = await Promise.all([utilsService.countriesList()]);
      return {
        countries: countries?.data || []
      };
    } catch (e) {
      return {
        countries: []
      };
    }
  }

  state = {
    isLoading: false,
    stage: 1,
    name: '',
    email: '',
    username: '',
    displayName: '',
    _referralCode: '',
    password: '',
    confirmPassword: '',
    countries: null
  };

  async componentDidMount() {
    const { countries } = this.state;
    if (countries === null) {
      const data = await this.getData();

      this.setState({ countries: data.countries }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';
    this.setState({ _referralCode: referralCode });
  }

  componentDidUpdate(prevProps) {
    const { registerPerformerData, ui } = this.props;
    if (
      !prevProps?.registerPerformerData?.success
      && prevProps?.registerPerformerData?.success !== registerPerformerData?.success
    ) {
      message.success(
        <div>
          <h4>{`Thank you for applying to be an ${ui?.siteName || 'Trax'} artist!`}</h4>
          <p>
            {registerPerformerData?.data?.message
              || 'Your application will be processed within 24 to 48 hours, most times sooner. You will get an email notification sent to your email address with the status update.'}
          </p>
        </div>,
        10
      );
      Router.push('/login');
    }
  }

  onFileReaded = (file: File, type: string) => {
    if (file && type === 'idFile') {
      this.idVerificationFile = file;
    }
    if (file && type === 'documentFile') {
      this.documentVerificationFile = file;
    }
  };

  validateReferralCode = async (rule, value, callback) => {
    if (!value) return true;
    const res = await authService.verifyReferralCode({ referralCode: value });

    if (!(res.data.isValid)) {
      throw new Error('Invalid referral code!');
    }
  };

  checkValidUsername = debounce(async (username) => {
    try {
      const resp = (
        await performerService.search({
          q: username
        })
      ).data;
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
    }
  }, 500);

  changeStage(val: number) {
    this.setState({ stage: val });
  }

  register = (values: any) => {
    const data = values;
    const { registerPerformer: registerPerformerHandler } = this.props;
    if (!this.idVerificationFile || !this.documentVerificationFile) {
      return message.error('ID documents are required!');
    }
    data.idVerificationFile = this.idVerificationFile;
    data.documentVerificationFile = this.documentVerificationFile;
    return registerPerformerHandler(data);
  };

  render() {
    const { registerPerformerData = { requesting: false }, ui } = this.props;
    const { isLoading, stage, name, email, username, displayName, _referralCode, password, confirmPassword, countries } = this.state;
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';

    if (countries === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }

    return (
      <Layout className={styles.pagesContactModule}>
        <Head>
          <title>{`${ui?.siteName} | Artist Sign Up`}</title>
        </Head>

        <div
          className=" "
          style={{
            margin: 0,
            padding: 0,
            width: '100vw',
            background: 'radial-gradient(circle at right, #bbe90020, #000000)'
          }}
        >
          <Row style={{ height: '100vh' }}>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              style={{ background: 'radial-gradient(circle at right, #0F0F0F, #000000)' }}
            >
              <div className="login-trax-name">
                <Image alt="logo" preview={false} width="120px" src="/static/LogoAlternate.png" />
              </div>
              <div className=" register-box">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
                >
                  <div className={stage > 5 ? "progress-bar-stage-5" : "progress-bar"}>
                    <div className={`${stage > 0 ? 'active' : ''}`} />
                    <div className={`${stage > 1 ? 'active' : ''}`} />
                    <div className={`${stage > 2 ? 'active' : ''}`} />
                    <div className={`${stage > 3 ? 'active' : ''}`} />
                    <div className={`${stage > 4 ? 'active' : ''}`} />
                    <div className={`${stage > 5 ? 'active' : ''}`} />
                  </div>
                </motion.div>
                <Form
                  name="member_register"
                  initialValues={{
                    gender: 'male',
                    country: 'US',
                    dateOfBirth: '',
                    referralCode
                  }}
                  onFinishFailed={() => message.error(
                    'You have not filled out all required fields. Please go back and complete all fields marked as required. '
                  )}
                  onFinish={this.register.bind(this)}
                  scrollToFirstError
                >
                  <Col>
                    <Col>
                      <Row>
                        <div style={{ display: `${stage === 1 ? 'contents' : 'none'}` }}>
                          <Col span={24}>
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1, transition: { delay: 0.2 } }}
                            >
                              <div className="login-welcome-h2">Create an account</div>
                              <div className="login-welcome-p">Become a Verified Artist and start earning today.</div>
                            </motion.div>
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
                            >
                              <div className="sign-in-subtitle">
                                <p>Name </p>
                                <span style={{color:'#BBE900'}}> *</span>
                              </div>

                              <Form.Item
                                name="firstName"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[
                                  { required: true, message: 'Please input your first name.' },
                                  {
                                    pattern:
                                      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                                    message: 'First name can not contain number and special character'
                                  }
                                ]}
                              >
                                <Input className='register-input' placeholder="Enter your name" onChange={(e)=> this.setState({name: e.target.value})} />
                              </Form.Item>
                            </motion.div>
                          </Col>
                          <Col span={24} style={{marginTop:'-1rem'}}>
                            <div className="sign-in-subtitle">
                              <p>Email</p>
                              <span style={{color:'#BBE900'}}> *</span>
                            </div>
                            <Form.Item
                              name="email"
                              validateTrigger={['onChange', 'onBlur']}
                              hasFeedback
                              rules={[
                                {
                                  type: 'email',
                                  message: 'The input is not valid E-mail!'
                                },
                                {
                                  required: true,
                                  message: 'Please input your E-mail!'
                                }
                              ]}
                            >
                              <Input type="email" className='register-input' placeholder="Enter your email" onChange={(e)=> this.setState({email: e.target.value})}/>
                            </Form.Item>
                          </Col>
                          <div className="artist-signup-btn-wrapper" style={{ justifyContent: 'center' }}>
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1, transition: { delay: 0.5 } }}
                              style={{ width: '100%', marginTop:'1rem' }}
                            >
                              <Button
                                disabled={registerPerformerData.requesting || isLoading || this.state.name === '' || this.state.email === ''}
                                loading={registerPerformerData.requesting || isLoading}
                                onClick={() => this.changeStage(2)}
                                className="login-form-button"
                                style={{ width: '100%', marginTop:'0.5rem', height:'40px' }}
                              >
                                <span style={{ margin: 'auto', textAlign: 'center' }}>Continue</span>
                              </Button>
                              <p className="reg-text-bottom" style={{ paddingTop: '0rem' }}>
                                <Link href="/login" style={{ color: '#BBE900' }}>
                                  Already have an account? <span style={{color: '#BBE900'}}>Log in</span>
                                </Link>
                              </p>
                            </motion.div>
                          </div>
                        </div>
                        <div style={{ display: `${stage === 2 ? 'contents' : 'none'}` }}>
                          <Col span={24}>
                          <div className="login-welcome-h2">Choose a username</div>
                              <div className="login-welcome-p">Must be at least 3 characters.</div>
                            <div className="sign-in-subtitle">
                              <p>Username</p>
                              <span style={{color:'#BBE900'}}> *</span>
                            </div>
                            <Form.Item
                              name="username"
                              validateTrigger={['onChange', 'onBlur']}
                              rules={[
                                { required: true, message: 'Please input your username!' },
                                {
                                  pattern: /^[a-z0-9]+$/g,
                                  message: 'Username must contain only lowercase alphanumerics only!'
                                },
                                { min: 3, message: 'Username must contain at least 3 characters' }
                              ]}
                            >
                              <Input className='register-input' placeholder="Choose a username" onChange={(e)=> this.setState({username: e.target.value})}/>
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <div className="sign-in-subtitle">
                              <p>Display name</p>
                              <span style={{color:'#BBE900'}}> *</span>
                            </div>
                            <Form.Item
                              name="name"
                              validateTrigger={['onChange', 'onBlur']}
                              rules={[
                                { required: true, message: 'Please input your display name!' },
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
                              <Input className='register-input' placeholder="Choose a display name" onChange={(e)=> this.setState({displayName: e.target.value})}/>
                            </Form.Item>
                          </Col>

                          <div className="artist-signup-btn-wrapper">
                            <Button
                              disabled={registerPerformerData.requesting || isLoading || displayName === '' || username === ''}
                              loading={registerPerformerData.requesting || isLoading}
                              onClick={() => this.changeStage(3)}
                              className="login-form-button"
                              style={{ width: '100%', marginTop:'0.5rem', height:'40px' }}
                            >
                              <span style={{ margin: 'auto', textAlign: 'center' }}>Continue</span>
                            </Button>
                            <Button
                              type="primary"
                              disabled={registerPerformerData.requesting || isLoading}
                              loading={registerPerformerData.requesting || isLoading}
                              onClick={() => this.changeStage(1)}
                              className="benefits-signup-btn-prev"
                            >
                              <span style={{ margin: 'auto', textAlign: 'center' }}>Previous</span>
                            </Button>
                          </div>
                        </div>
                        <div style={{ display: `${stage === 3 ? 'contents' : 'none'}` }}>
                      <Col span={24}>
                          <div className="login-welcome-h2">Your details</div>
                          <div className="login-welcome-p">Tell us a bit about yourself.</div>
                          <Row style={{ width: '100%', marginTop: '-1rem', marginBottom: '-1rem'}}>
                            <Col span={24} style={{ width: '100%' }}>
                              <div className="sign-in-subtitle">
                                <p>My birthday is...</p>
                                <span style={{color:'#BBE900'}}> *</span>
                              </div>
                              <Form.Item
                                name="dateOfBirth"
                                validateTrigger={['onChange', 'onBlur']}
                              >
                                <div className='sign-up-date-picker'>
                                <DatePicker
                                className='registration-date-picker'
                                  placeholder="2023-01-01"
                                />
                                </div>
                              </Form.Item>
                            </Col>
                            
                            <Col span={24} style={{ width: '100%', marginTop: '-1rem' }}>
                              <div className="sign-in-subtitle">
                                <p>I am a...</p>
                                <span style={{color:'#BBE900'}}> *</span>
                              </div>
                              <Form.Item
                                style={{ background: '#1A1A1A', borderRadius: '11px' }}
                                name="gender"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[{ required: true, message: 'Please select your gender' }]}
                              >
                                <Select className='register-switch'>
                                  <Option value="male" key="male">
                                    Man
                                  </Option>
                                  <Option value="female" key="female">
                                    Woman
                                  </Option>
                                  <Option value="transgender" key="trans">
                                    Human
                                  </Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col style={{ width: '100%', marginTop:'-1rem', marginBottom: '2rem' }}>
                            <div className="sign-in-subtitle">
                                <p>I live in...</p>
                                <span style={{color:'#BBE900'}}> *</span>
                            </div>
                            <Form.Item name="country" rules={[{ required: true }]}>
                              <Select optionFilterProp="label" className='register-switch'>
                                {countries.map((c) => (
                                  <Option value={c.code} key={c.code} label={c.name}>
                                    <Image alt="country_flag" src={c.flag} width="25px" />
                                    {' '}
                                    {c.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          </Row>
                          </Col>
                          <div className="artist-signup-btn-wrapper">
                            <Button
                              disabled={registerPerformerData.requesting || isLoading}
                              loading={registerPerformerData.requesting || isLoading}
                              onClick={() => this.changeStage(4)}
                              className="login-form-button"
                              style={{ width: '100%', marginTop:'0.5rem', height:'40px' }}
                            >
                              <span style={{ margin: 'auto', textAlign: 'center' }}>Continue</span>
                            </Button>
                            <Button
                              type="primary"
                              disabled={registerPerformerData.requesting || isLoading}
                              loading={registerPerformerData.requesting || isLoading}
                              onClick={() => this.changeStage(2)}
                              className="benefits-signup-btn-prev"
                            >
                              <span style={{ margin: 'auto', textAlign: 'center' }}>Previous</span>
                            </Button>
                          </div>
                        </div>
                        <div style={{ display: `${stage === 4 ? 'contents' : 'none'}` }}>
                        <Col span={24}>
                        <div className="login-welcome-h2">Enter referral code</div>
                          <div className="login-welcome-p">You need a referral code to join TRAX. If you don&apos;t have a code, ask <a href='https://twitter.com/onlyontrax'>here</a> </div>
                       <Col span={24} style={{marginTop:'-1rem'}}>
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1, transition: { delay: 0.4 } }}
                            >
                              <div className="sign-in-subtitle">
                                <p>Referral code <span className="optional-badge">Optional</span></p>
                              </div>

                              <Form.Item
                                name="referralCode"
                                rules={[
                                  { required: false }
                                ]}
                              >
                                <Input className='register-input' placeholder="Referral code" onChange={(e)=> this.setState({_referralCode: e.target.value})}/>
                              </Form.Item>
                            </motion.div>
                          </Col>
                          <div className="artist-signup-btn-wrapper">
                            <Button
                              disabled={registerPerformerData.requesting || isLoading || _referralCode === ''}
                              loading={registerPerformerData.requesting || isLoading}
                              onClick={() => this.changeStage(5)}
                              className="login-form-button"
                              style={{ width: '100%', marginTop:'0.5rem', height:'40px' }}
                            >
                              <span style={{ margin: 'auto', textAlign: 'center' }}>Continue</span>
                            </Button>
                            <Button
                              type="primary"
                              disabled={registerPerformerData.requesting || isLoading}
                              loading={registerPerformerData.requesting || isLoading}
                              onClick={() => this.changeStage(3)}
                              className="benefits-signup-btn-prev"
                            >
                              <span style={{ margin: 'auto', textAlign: 'center' }}>Previous</span>
                            </Button>
                          </div>
                          </Col>
                        </div>
                      </Row>
                  <Form.Item>
                    <div style={{ display: `${stage === 5 ? 'contents' : 'none'}` }}>
                      <Col span={24}>
                      <div className="login-welcome-h2">Create a password</div>
                          <div className="login-welcome-p">Create a password to sign in to your TRAX account.  </div>
                      
                      <Row style={{ display: 'contents' }}>
                      <Col span={24} style={{marginTop:'-1rem'}}>
                            <div className="sign-in-subtitle">
                              <p>Password</p>
                              <span style={{color:'#BBE900'}}> *</span>
                            </div>
                            <Form.Item
                              name="password"
                              validateTrigger={['onChange', 'onBlur']}
                              rules={[
                                {
                                  pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                                  message:
                                    'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
                                },
                                { required: true, message: 'Please input your password!' }
                              ]}
                            >
                              <Input.Password placeholder="Create a password" onChange={(e)=> this.setState({password: e.target.value})}/>
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <div className="sign-in-subtitle">
                              <p>Confirm password</p>
                              <span style={{color:'#BBE900'}}> *</span>
                            </div>
                            <Form.Item
                              name="confirm"
                              dependencies={['password']}
                              validateTrigger={['onChange', 'onBlur']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter confirm password!'
                                },
                                ({ getFieldValue }) => ({
                                  validator(rule, value) {
                                    if (!value || getFieldValue('password') === value) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject('Passwords do not match together!');
                                  }
                                })
                              ]}
                            >
                              <Input className='register-input' type="password" placeholder="Confirm password" onChange={(e)=> this.setState({confirmPassword: e.target.value})}/>
                            </Form.Item>
                          </Col>
                        <div className="artist-signup-btn-wrapper">
                          <Button
                            disabled={registerPerformerData.requesting || isLoading || password === '' || confirmPassword !== password}
                            loading={registerPerformerData.requesting || isLoading}
                            onClick={() => this.changeStage(6)}
                            className="login-form-button"
                              style={{ width: '100%', marginTop:'0.5rem', height:'40px' }}
                          >
                            <span style={{ margin: 'auto', textAlign: 'center' }}>Continue</span>
                          </Button>
                          <Button
                            type="primary"
                            disabled={registerPerformerData.requesting || isLoading}
                            loading={registerPerformerData.requesting || isLoading}
                            onClick={() => this.changeStage(4)}
                            className="benefits-signup-btn-prev"
                          >
                            <span style={{ margin: 'auto', textAlign: 'center' }}>Previous</span>
                          </Button>
                        </div>
                      </Row>
                      </Col>
                    </div>
                    <div style={{ display: `${stage === 6 ? 'contents' : 'none'}` }}>
                      <Col span={24}>
                      <div className="login-welcome-h2">Get verified</div>
                        <div className="login-welcome-p">To start earning on TRAX, we need to verify you as the owner of this account.  </div>
                      <Row style={{ display: 'contents' }}>
                        <div className="register-form">
                        
                        <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                            <ul className="list-issued-id">
                              <div>
                                <InformationCircleIcon
                                  style={{ height: '1.5rem', marginRight: '1rem', color: '#BBE900' }}
                                />
                              </div>

                              <p
                                style={{
                                  fontSize: '0.75rem',
                                  marginTop: '-0.25rem',
                                  marginBottom: '-0.25rem',
                                  color: '#BBE900'
                                }}
                              >
                                Accepted formats include driving
                                licenses, passports and government-issued identification.
                              </p>
                            </ul>
                          </div>
                          <Col span={24}>
                            <Form.Item
                              labelCol={{ span: 24 }}
                              name="idVerificationId"
                              className="artist-photo-verification"
                            >
                              <div className="id-block">
                                <ImageUploadModel onFileReaded={(f) => this.onFileReaded(f, 'idFile')} isArtistRegisterUpload={true}/>
                              </div>
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <ul className="list-issued-id">
                              <div>
                                <InformationCircleIcon
                                  style={{ height: '1.5rem', marginRight: '1rem', color: '#BBE900' }}
                                />
                              </div>

                              <p
                                style={{
                                  fontSize: '0.75rem',
                                  marginTop: '-0.25rem',
                                  marginBottom: '-0.25rem',
                                  color: '#BBE900'
                                }}
                              >
                                Take a photo of yourself so we can verify your identity
                              </p>
                            </ul>
                            <Form.Item
                              labelCol={{ span: 24 }}
                              name="documentVerificationId"
                              className="artist-photo-verification"
                            >
                              <div className="id-block">
                                <ImageUploadModel onFileReaded={(f) => this.onFileReaded(f, 'documentFile')} isArtistRegisterUpload={true}/>
                              </div>
                            </Form.Item>
                            <p style={{ paddingBottom: '1rem', color: '#FFF' }} className="">
                        I agree to TRAX`s
                        {' '}
                        <a href="/page?id=terms-of-service" target="_blank">
                          Terms of Service
                        </a>
                        {' '}
                      </p>
                          </Col>
                        </div>
                      </Row>
                      </Col>
                      <div className="artist-signup-btn-wrapper">
                        <Button
                          htmlType="submit"
                          onClick={() => {
                          }}
                          disabled={registerPerformerData.requesting || isLoading}
                          loading={registerPerformerData.requesting || isLoading}
                          className="login-form-button"
                              style={{ width: '100%', marginTop:'0.5rem', height:'40px' }}
                        >
                          <span style={{ margin: 'auto', textAlign: 'center' }}>Create account </span>
                        </Button>
                        <Button
                          type="primary"
                          disabled={registerPerformerData.requesting || isLoading}
                          loading={registerPerformerData.requesting || isLoading}
                          onClick={() => this.changeStage(5)}
                          className="benefits-signup-btn-prev"
                          style={{ maxWidth: 300 }}
                        >
                          <span style={{ margin: 'auto', textAlign: 'center' }}>Previous </span>
                        </Button>
                      </div>
                    </div>
                    {/* // )} */}
                    <div className="sign-in-links-wrapper">
                    </div>
                  </Form.Item>
                  </Col>
                  </Col>
                </Form>
              </div>
            </Col>
            <Col xs={12} sm={12} md={12} lg={12} className="" style={{padding: 0}}>
              <div className='temp-div'>
                <div className="temp-bg" style={{ backgroundImage: "/static/artistsnormal.png" }} />
              </div>
            </Col>
          </Row>
        </div>
      </Layout>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  registerPerformerData: { ...state.auth.registerPerformerData }
});

const mapDispatchToProps = { registerPerformer, loginSocial };

export default connect(mapStatesToProps, mapDispatchToProps)(RegisterPerformer);
