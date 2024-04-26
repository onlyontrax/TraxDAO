import { ImageUpload } from '@components/file';
import { InformationCircleIcon } from '@heroicons/react/outline';
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
      this.setState({currentUser: registeredUser});

    } else if (user) {
      this.setState({currentUser: user});
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
                <Form.Item style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <Button
                    className="log-in-btn sign-up place-content-center"
                    href={user ? user.identityVerificationStatus.link : ''}
                    target="_blank"
                  >
                    Verify your identity
                  </Button>
                </Form.Item>
              </div>
            </div>
          ) : (
            <div className="account-form" >
              <div style={{ width: '100%' }}>
                <h1 className="profile-page-heading">Identity verification</h1>
              </div>
              {user.verifiedDocument && (
                <div>
                  Your identification has been verified. Thank you.
                </div>)}
              {!user.verifiedDocument && (
                <div>
                  <p className="account-form-item-tag">Your identity verification status is: {user.identityVerificationStatus.status}</p>
                  {user.identityVerificationStatus.lastStatus !== '' && <p className="account-form-item-tag">Your last identity verification status was: {user.identityVerificationStatus.lastStatus}</p>}
                  {user.identityVerificationStatus.reasons.length > 0 && user.identityVerificationStatus.reasons.map((reason) => (
                  <p className="account-form-item-tag">
                    {reason}
                  </p>
                  ))}
                  <p className="account-form-item-tag">Use this button to verify your identity.</p>

                  <a target='_blank' href={user ? user.identityVerificationStatus.link : ''}>Verify your identity</a>
                </div>
              )}
            </div>
          )}
        </div>
    );
  }
}
