import { PureComponent } from 'react';
import {
  Button
} from 'antd';

interface IProps {
  loading: boolean;
  stripeAccount: any;
  loginUrl: string;
  onConnectAccount: Function;
}

export class StripeConnectForm extends PureComponent<IProps> {
  render() {
    const {
      loading, stripeAccount, loginUrl, onConnectAccount
    } = this.props;
    return (
      <div className="pb-6">
        {stripeAccount && stripeAccount.payoutsEnabled && stripeAccount.detailsSubmitted && (
          <div className='profile-form-box-connected'>
            <span className='text-lg'>Stripe account</span>
            <span className='text-trax-gray-300'>You are connected with Stripe!</span>
            <div className='flex justify-between '>
              <Button className="rounded-lg bg-[#f1f5f9] text-trax-black p-2 mt-2 h-[38px] flex w-fit justify-center">
                <a href={loginUrl} target="_blank" rel="noreferrer">
                  Open account
                </a>
              </Button>
              <Button
                className="rounded-lg bg-[#f1f5f9] text-trax-black p-2 mt-2 h-[38px] flex w-fit justify-center"
                disabled={loading}
                loading={loading}
                onClick={onConnectAccount.bind(this)}
              >
                Reconnect by another account
              </Button>
            </div>
          </div>
        )}
        {(stripeAccount && !stripeAccount.payoutsEnabled) && (stripeAccount && !stripeAccount.detailsSubmitted) && (
          <div className='profile-form-box-unconnected'>
            <span className='text-lg'>Stripe account</span>
            <span className='text-trax-gray-300'>There are some problems with your account, please go to your account and fix them to be able to connect.</span>
            <div className='flex justify-end'>
              <Button className="rounded-lg bg-[#f1f5f9] text-trax-black p-2 mt-4 h-[38px] flex w-fit justify-center">
                <a href={loginUrl} target="_blank" rel="noreferrer">
                  Open account
                </a>
              </Button>
            </div>
          </div>
        )}
        {(!stripeAccount) && (
          <div className='profile-form-box-unconnected'>
            <span className='text-lg'>Connect to Stripe</span>
            <span className='text-trax-gray-700'>Please click here to complete the onboarding process & connect the account.</span>
            <div className='flex justify-end'>
              <Button
                className="rounded-lg bg-[#1e1e1e] text-trax-white p-2 mt-2 h-[38px] flex w-fit justify-center"
                disabled={loading}
                loading={loading}
                onClick={onConnectAccount.bind(this)}
              >
                Connect
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
