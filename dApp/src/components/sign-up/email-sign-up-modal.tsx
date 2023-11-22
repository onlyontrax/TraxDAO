/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import { PureComponent } from 'react';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { IPerformer } from '@interfaces/index';
import { tokenTransctionService } from '@services/index';
import {
  InputNumber, Button, Avatar, Select, Image, Input, Form
} from 'antd';
import Link from 'next/link'
import styles from './performer.module.scss';
import { NFIDIcon } from '../../icons/index';
import { ISettings, IUIConfig } from 'src/interfaces';
import { authService } from '@services/index';
import { loginNfid, loginSocial, registerFan } from '@redux/auth/actions';
import { connect } from 'react-redux';

const { Option } = Select;

interface IProps {
    ui: IUIConfig;
    settings: ISettings;
    registerFan: Function;
    registerFanData: any;
    loginSocial: Function;
    store: any;
onClose(isOpen: boolean, modal: string): Function;
}

class EmailSignUpModal extends PureComponent<IProps> {
  static authenticate = false;
  static layout = 'blank';
  
  state = {
    recaptchaSuccess: false,
    isLoading: false
  };
  
  handleRegister = (data: any) => {
    const { registerFan: handleRegister, onClose: signedUp } = this.props;
    signedUp(false, 'exit')
    handleRegister(data);
  };

  validateReferralCode = async (rule, value, callback) => {
    if (!value) return true;
    const res = await authService.verifyReferralCode({ referralCode: value });

    if (!(res.data.isValid)) {
      throw new Error('Invalid referral code!');
    }
  };

  render() {
    const { ui, registerFanData } = this.props;
    const { requesting: submiting } = registerFanData;
    const { isLoading } = this.state;
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';
    return (
      <div className="email-sign-up-container">
        <div className='email-sign-up-logo'>
            <img src="/static/LogoAlternate.png" width="100px" alt="Loading..."/>
        </div>
        <div className='email-sign-up-header'>
            <span>Create a TRAX account</span>
            <p>TRAX is <u><strong>better</strong></u> with web3 options</p>
        </div>

        <Form
          labelCol={{ span: 24 }}
          name="member_register"
          initialValues={{ remember: true, gender: 'male', referralCode }}
          onFinish={this.handleRegister.bind(this)}
          scrollToFirstError
        >
        <div className='email-sign-up-fields-wrapper'>
            <div className='email-sign-up-field'>
                <span className='field-subheading'>Email</span>
                <Form.Item
                  name="email"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      type: 'email',
                      message: 'Invalid email address!'
                    },
                    {
                      required: true,
                      message: 'Please input your email address!'
                    }
                  ]}
                >
                    <Input type="text"/>
                </Form.Item>
            </div>

            <div className='email-sign-up-fields-name'>
                <div>
                    <span className='field-subheading'>First name</span>
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
                        <Input type="text"/>
                    </Form.Item>
                </div>
                <div>
                    <span className='field-subheading'>Last name</span>
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
                        <Input type="text"/>
                    </Form.Item>
                </div>
            </div>
            <div className='email-sign-up-field'>
                <span className='field-subheading'>Password</span>
                <Form.Item
                  name="password"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                      message:
                        'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
                    },
                    { required: true, message: 'Please enter your password!' }
                  ]}
                >
                    <Input.Password type="text"/>
                </Form.Item>
            </div>
            <div className='email-sign-up-field'>
                <span className='field-subheading'>Confirm password</span>
                <Form.Item
                  name="confirm"
                  dependencies={['password']}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the same password as above!'
                    },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject('Passwords do not match!');
                      }
                    })
                  ]}
                >
                    <Input.Password type="text"/>
                </Form.Item>
            </div>

            <div className='email-sign-up-field'>
                <span className='field-subheading'>Referral code <span className="optional-badge">Optional</span></span>
                <Form.Item
                  name="referralCode"
                  rules={[
                    { required: false }
                  ]}
                >
                    <Input type="text"/>
                </Form.Item>
            </div>
        </div>

        

        <div className='sign-up-btn-wrapper'>
            <Form.Item style={{ textAlign: 'center', marginTop:'1rem' }}>
                <Button 
                    htmlType="submit"
                    disabled={submiting || isLoading}
                    loading={submiting || isLoading}
                    className='sign-up-btn'
                >
                    Create TRAX account
                </Button>
            </Form.Item>
        </div>
        </Form>
        <div className='log-in-link'>
            <span className='new-to'>Already have a TRAX account? </span> <span onClick={()=> this.props.onClose(false, 'login')} className='get-started'>Log in →</span>
        </div>

        <div className='email-sign-up-tc'>
            <span className='new-to'>By proceeding, you agree to the <Link href="/page?id=terms-of-service" target="_blank" className='get-started'>Terms and Conditions</Link> and <Link href="/page?id=privacy-policy" target="_blank" className='get-started'>Privacy Policy</Link></span> 
        </div>
      </div>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  registerFanData: { ...state.auth.registerFanData },
  store: { ...state }
});

const mapDispatchToProps = { registerFan, loginSocial, loginNfid };

export default connect(mapStatesToProps, mapDispatchToProps)(EmailSignUpModal);
