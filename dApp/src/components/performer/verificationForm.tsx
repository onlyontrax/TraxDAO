import { ImageUpload } from '@components/file';
import { authService, performerService } from '@services/index';
import {
  Col,
  Form,
  Image,
  Row,
  message
} from 'antd';
import NextImage from 'next/image';
import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';
import { Button } from 'antd';
import styles from './performer.module.scss';

import TraxButton from '@components/common/TraxButton';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  user: IPerformer;
  registeredUser?: IPerformer;
  signUp?: boolean;
}

export class PerformerVerificationForm extends PureComponent<IProps> {
  state = {
    currentUser: null,
  }
  componentDidMount() {
    const { user, registeredUser } = this.props;
    if (registeredUser) {
      this.setState({ currentUser: registeredUser });

    } else if (user) {
      this.setState({ currentUser: user });
    }
  }


  render() {
    const { currentUser } = this.state;

    const user = currentUser

    if (!user) {
      return <div>Loading...</div>;
    }

    return (
      <div className={styles.componentsPerformerVerificationFormModule} style={{ display: 'flex', flexDirection: 'column' }}>
        {this.props.signUp ? (
          <div>
            <p className="text-trax-gray-500 text-base py-6 text-left">To verify your account, click on the button below.</p>
            <div className='log-in-btn-wrapper'>
              <Form.Item>
                <TraxButton
                  htmlType="button"
                  styleType="primary"
                  buttonSize='full'
                  buttonText="Verify your identity"
                  onClick={() => {
                    window.location.href = user ? user.identityVerificationStatus.link : '';
                  }}
                />
              </Form.Item>
            </div>
          </div>
        ) : (
          <div className="account-form-settings" >
            <div style={{ width: '100%' }}>
              <h1 className="profile-page-heading">Verification</h1>
              <span className='profile-page-subtitle'>Verify your identity to start posting and earning on TRAX</span>
            </div>
            {user.verifiedDocument && (
              <div className='profile-form-box-connected'>
                <span className='text-lg text-trax-white '>You are now verified!</span>
                <span className='text-trax-gray-300'>You have already completed identity verification, to re-verify your account please click 'Re-verify'.</span>
                <Form.Item>
                  <TraxButton
                    htmlType="button"
                    styleType="primary"
                    buttonSize='full'
                    buttonText="Re-verify"
                  />
                </Form.Item>
                <div className='w-full flex justify-end'>
                  <div className='cursor-pointer rounded-lg bg-[#f1f5f9] text-trax-black p-2 mt-4 flex w-20 justify-center'>
                    <span>Re-verify</span>
                  </div>
                </div>
              </div>)}
            {!user.verifiedDocument && (
              <div className='profile-form-box-unconnected'>
                <span className='text-lg text-trax-black '>Start verification process</span>
                <span className='text-trax-gray-700'>By clicking 'Continue' you will be redirected to Onfido - a third party verifiaction service. Please do not close this window.</span>
                <div className='w-full flex justify-end'>
                  <div className='cursor-pointer rounded-lg bg-[#1e1e1e] text-trax-white p-2 mt-4 flex w-20 justify-center'>
                    <span>Continue</span>
                  </div>
                </div>
              </div>
              // <div>
              //   <p className="account-form-item-tag">Your identity verification status is: {user?.identityVerificationStatus?.status}</p>
              //   {user?.identityVerificationStatus?.lastStatus !== '' && <p className="account-form-item-tag">Your last identity verification status was: {user?.identityVerificationStatus?.lastStatus}</p>}
              //   {user?.identityVerificationStatus?.reasons.length > 0 && user?.identityVerificationStatus?.reasons.map((reason) => (
              //   <p className="account-form-item-tag">
              //     {reason}
              //   </p>
              //   ))}
              //   <p className="account-form-item-tag">Use this button to verify your identity.</p>

              //   <a target='_blank' href={user ? user?.identityVerificationStatus?.link : ''}>Verify your identity</a>
              // </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
