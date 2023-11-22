/* eslint-disable prefer-promise-reject-errors, react/sort-comp */
import { DatePicker } from '@components/common/datePicker';
import { ImageUploadModel } from '@components/file';
import { InformationCircleIcon } from '@heroicons/react/solid';
import { loginSocial, registerPerformer } from '@redux/auth/actions';
import { authService } from '@services/index';
import { BadgeCheckIcon } from '@heroicons/react/solid';
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

const artists = [
    {name: 'CHELJI', handle: 'trax.so/chelji', link: '/artist/profile/?id=chelji', img: '/static/Chelji-profile.jpeg'},
    {name: 'MASTER PEACE', handle: 'trax.so/masterpeace', link: '/artist/profile/?id=masterpeace', img: '/static/MasterPeace.jpeg'},
    {name: 'DEIJUVHS', handle: 'trax.so/deijuvhs', link: '/artist/profile/?id=deijuvhs', img: '/static/deijuvhs.jpeg'},
    {name: 'SCRATCH CARD WED...', handle: 'trax.so/scratchcardwednesday', link: '/artist/profile/?id=scratchcardwednesday', img: '/static/scw-show.jpeg'},
]

class RegisterPerformer extends PureComponent<IProps> {

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
        15
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
    const { isLoading, name, email, username, displayName, _referralCode, password, confirmPassword, countries } = this.state;
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';

    if (countries === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }

    return (
      <Layout >
        <Head>
          <title>{`${ui?.siteName} | Become a creator`}</title>
        </Head>

        <div
          className=" "
          style={{
            margin: 0,
            padding: 0,
            width: '100%',
            background: 'radial-gradient(circle at right, #0F0F0F, #000000)'
          }}
        >
          
          <div className='creator-banner'>
          <div className='test-hue'>
            <div className='banner-left'>
            <div className='creator-sign-up-header-wrapper'>
                    <span className='creator-sign-up-header'>Become a Creator <BadgeCheckIcon className="creator-badge" /></span>
                    <span className='creator-sign-up-msg'>We&apos;re delighted that you&apos;re looking to become a creator on TRAX&#33; Please fill out the fields below to help us verify your identity and build your creator profile. We do this to protect TRAX from bots and fake accounts&#33;</span>
                </div>

                <div className='creator-learn-more'>
                    <Link href="https://artists.trax.so" >
                        <span>Learn more →</span>
                    </Link>
                </div>
            </div>
            <div className='banner-right'>
              <div className='creator-grid-container'>
                <div className='creator-grid-one'>
                  <Link href="/artist/profile/?id=chelji">
                    <div style={{backgroundImage: `url(/static/chelji-mirror.jpeg)`}} />
                  </Link>
                </div>
                <div className='creator-grid-two'>
                  <Link href="/artist/profile/?id=masterpeace">
                    <div style={{backgroundImage: `url(/static/flower_mp.jpeg)`}} />
                  </Link>
                </div>
                <div className='creator-grid-three'>
                  <Link href="/artist/profile/?id=itsrosacecilia">
                    <div style={{backgroundImage: `url(/static/rosa.jpeg)`}} />
                  </Link>
                </div>
                <div className='creator-grid-four'>
                  <Link href="/artist/profile/?id=lewisknaggsmusic">
                    <div style={{backgroundImage: `url(/static/lewisKnaggs.jpeg)`}} />
                  </Link>
                </div>
                <div className='creator-grid-five'>
                  <Link href="/artist/profile/?id=lifeofthom">
                    <div style={{backgroundImage: `url(/static/lifeofthom.jpeg)`}} />
                  </Link>
                </div>
                <div className='creator-grid-six'>
                  <Link href="/artist/profile/?id=taliwhoah">
                    <div style={{backgroundImage: `url(/static/tali.jpeg)`}} />
                  </Link>
                </div>
                <div className='creator-grid-seven'>
                  <Link href="/artist/profile/?id=onoecaponoe">
                    <div style={{backgroundImage: `url(/static/onoecaponoe.jpg)`}} />
                  </Link>
                </div>

              </div>
            </div>
          </div>
          </div>
          <Row >
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              style={{ background: '#00000000' }}
            >
              <div className=" register-box">
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
                          <div className='creator-sign-up-field-wrapper'>
                            
                              <div className="creator-field-name">
                                <p>Name <span style={{color:'#BBE900'}}> *</span></p>
                                
                                
                              </div>

                              <Form.Item
                              style={{width: '100%'}}
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
                                <Input className='register-creator-input' placeholder="e.g. Kendrick Lamar" onChange={(e)=> this.setState({name: e.target.value})} />
                              </Form.Item>
                          
                          </div>
                          <div className='creator-sign-up-field-wrapper'>
                            
                            <div className="creator-field-name">
                              <p>Email <span style={{color:'#BBE900'}}> *</span></p>
                              <p className='field-info'>Must be different to your fan account</p>
                            </div>
                            <Form.Item
                            style={{width: '100%'}}
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
                              <Input type="email" className='register-creator-input' placeholder="e.g. email@domain.com" onChange={(e)=> this.setState({email: e.target.value})}/>
                            </Form.Item>
                          </div>
                          <div className='creator-sign-up-field-wrapper'>
                            <div className="creator-field-name">
                              <p>TRAX handle <span style={{color:'#BBE900'}}> *</span></p>
                              <p className='field-info'>Shown as trax.so/handle</p>
                            </div>
                            <Form.Item
                              style={{width: '100%'}}
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
                              <Input className='register-creator-input' placeholder="e.g. kendricklamar" onChange={(e)=> this.setState({username: e.target.value})}/>
                            </Form.Item>
                          </div>
                          <div className='creator-sign-up-field-wrapper'>
                            <div className="creator-field-name">
                              <p>Display name <span style={{color:'#BBE900'}}> *</span></p>
                              <p className='field-info'>As shown on your profile</p>
                            </div>
                            <Form.Item
                              style={{width: '100%'}}
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
                              <Input className='register-creator-input' placeholder="e.g. Kendrick Lamar" onChange={(e)=> this.setState({displayName: e.target.value})}/>
                            </Form.Item>
                          </div>
                          <div className='creator-sign-up-field-wrapper'>
                              <div className="creator-field-name">
                                <p>Date of birth <span style={{color:'#BBE900'}}> *</span></p>
                                <p className='field-info'>Not shown on your profile</p>
                              </div>
                              <Form.Item
                              style={{width: '100%'}}
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
                            </div>
                            
                            <div className='creator-sign-up-field-wrapper'>
                            <div className="creator-field-name">
                                <p>Gender <span style={{color:'#BBE900'}}> *</span></p>
                                
                              </div>
                              <Form.Item
                                
                                style={{width: '100%'}}
                                name="gender"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[{ required: true, message: 'Please select your gender' }]}
                              >
                                <Select className='register-creator-switch'>
                                  <Option value="male" key="male">
                                    Male
                                  </Option>
                                  <Option value="female" key="female">
                                    Female
                                  </Option>
                                  <Option value="transgender" key="trans">
                                    Other
                                  </Option>
                                </Select>
                              </Form.Item>
                            </div>

                            <div className='creator-sign-up-field-wrapper'>
                            <div className="creator-field-name">
                                <p>Country <span style={{color:'#BBE900'}}> *</span></p>
                            </div>
                            <Form.Item name="country" rules={[{ required: true }]} style={{width: '100%'}}>
                              <Select optionFilterProp="label" className='register-creator-switch'>
                                {countries.map((c) => (
                                  <Option value={c.code} key={c.code} label={c.name}>
                                    <Image alt="country_flag" src={c.flag} width="25px" />
                                    {' '}
                                    {c.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </div>
                        <div className='creator-sign-up-field-wrapper'>
                        <div className="creator-field-name">
                                <p>Referral code </p>
                              </div>
                              <Form.Item
                                style={{width: '100%'}}
                                name="referralCode"
                                rules={[
                                  { required: false }
                                ]}
                              >
                                <Input className='register-creator-input' placeholder="Referral code" onChange={(e)=> this.setState({_referralCode: e.target.value})}/>
                              </Form.Item>
                          </div>
                  <Form.Item>
                      <Row style={{ display: 'contents' }}>
                      <div className='creator-sign-up-field-wrapper'>
                        <div className="creator-field-name">
                              <p>Password <span style={{color:'#BBE900'}}> *</span></p>
                            </div>
                            <Form.Item
                            style={{width: '100%'}}
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
                              <Input.Password className='register-creator-input' placeholder="Create a password" onChange={(e)=> this.setState({password: e.target.value})}/>
                            </Form.Item>
                          </div>
                          <div className='creator-sign-up-field-wrapper'>
                          <div className="creator-field-name">
                              <p>Confirm password <span style={{color:'#BBE900'}}> *</span></p>
                              
                            </div>
                            <Form.Item
                            style={{width: '100%'}}
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
                              <Input  className='register-creator-input' type="password" placeholder="Confirm password" onChange={(e)=> this.setState({confirmPassword: e.target.value})}/>
                            </Form.Item>
                          </div>
                      </Row>
                        <div className='creator-docs-wrapper'>
                            <span className='creator-docs-header'>Verify yourself <span style={{color:'#BBE900'}}> *</span></span>
                            <span className='creator-docs-msg'>Upload the following identification to verify your identity.</span>

                        </div>
                        <div className="register-form">
                          <div className='creator-sign-up-field-wrapper'>
                          <div className="creator-field-name">
                              <p>Passport or govt. issued ID</p>
                            </div>
                            <Form.Item
                            style={{width: '100%'}}
                              labelCol={{ span: 24 }}
                              name="idVerificationId"
                              className="artist-photo-verification"
                            >
                              <div className="id-block">
                                <ImageUploadModel onFileReaded={(f) => this.onFileReaded(f, 'idFile')} isArtistRegisterUpload={true}/>
                              </div>
                            </Form.Item>
                          </div>

                          <div className='creator-sign-up-field-wrapper'>
                            <div className="creator-field-name">
                              <p>Selfie</p>
                            </div>
                            <Form.Item
                            style={{width: '100%'}}
                              labelCol={{ span: 24 }}
                              name="documentVerificationId"
                              className="artist-photo-verification"
                            >
                              <div className="id-block">
                                <ImageUploadModel onFileReaded={(f) => this.onFileReaded(f, 'documentFile')} isArtistRegisterUpload={true}/>
                              </div>
                            </Form.Item>
                          </div>
                        </div>
                        <div className='log-in-btn-wrapper'>
                            <Button
                              htmlType="submit"
                              onClick={() => {
                              }}
                              disabled={registerPerformerData.requesting || isLoading}
                              loading={registerPerformerData.requesting || isLoading}
                              className='log-in-btn'
                            >
                              Create account
                            </Button>
                        </div>
                    <div className="sign-in-links-wrapper">
                    </div>
                  </Form.Item>
                </Form>
              </div>
            </Col>
            <Col xs={24}
              sm={24}
              md={12}
              lg={12} className="creator-right-col" style={{padding: 0}}>
              <div className='creators-cut-msg-wrapper'>
                <p>Creators take <span className="creator-highlight-text">90&#37; of the revenue</span>  they earn on TRAX&#44; the rest get invested back into <span className="creator-highlight-text">building &#38; growing</span> TRAX.</p>
                <div className='creator-learn-more'>
                    <Link href="https://artists.trax.so" >
                        <span>Learn more →</span>
                    </Link>
                </div>
              </div>

              <div className='creator-recently-joined-wrapper'>
                <span>Recently joined</span>
                <div className='creator-cards-wrapper'>

                {artists.map((a)=>(
                  <Link href={a.link} className='recent-artist-wrapper'>
                    <div className='artist-img-wrapper' style={{backgroundImage: `url(${a.img})`}}>
                    </div>
                    <div className='artist-info-wrapper'>
                        <h1>{a.name}</h1>
                        <p>{a.handle}</p>
                    </div>
                  </Link>
                ))}
                </div>
              </div>

              <div className='creator-dao-wrapper'>
                <h1>TRAX DAO?</h1>
                <p>A community of 5000&#43; artists&#44; fans &#43; music industry insiders governing the future of TRAX</p>
                <div className='creator-learn-more'>
                    <Link href="https://artists.trax.so" >
                        <span>Join the conversation →</span>
                    </Link>
                </div>

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
