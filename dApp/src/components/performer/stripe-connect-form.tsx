import { PureComponent } from 'react';
import TraxButton from '@components/common/TraxButton';

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
      <div className="mb-6">
        {stripeAccount && stripeAccount.payoutsEnabled && stripeAccount.detailsSubmitted && (
          <div className="profile-form-box-connected">
            <span className="text-lg profile-box-heading">Stripe Connected</span>
            <span className="profile-box-text">
              You have successfully connected your Stripe account. You can open your account
              to view details or reconnect with a different account.
            </span>
            <div className="w-full flex items-center justify-between gap-4">
              <TraxButton
                htmlType="button"
                styleType="secondary"
                buttonSize="medium"
                buttonText="Open Account"
                disabled={loading}
                loading={loading}
                onClick={() => window.open(loginUrl, '_blank', 'noreferrer')}
              />
              <TraxButton
                htmlType="button"
                styleType="secondary"
                buttonSize="large"
                buttonText="Reconnect Account"
                disabled={loading}
                loading={loading}
                onClick={onConnectAccount.bind(this)}
              />
            </div>
          </div>
        )}

        {(stripeAccount && !stripeAccount.payoutsEnabled) && (stripeAccount && !stripeAccount.detailsSubmitted) && (
          <div className="profile-form-box-unconnected">
            <span className="profile-box-heading">Stripe Account</span>
            <span className="profile-box-text">
              There are some issues with your Stripe account. Please access your account
              settings to resolve them and complete the connection process.
            </span>
            <div className="w-full flex justify-end">
              <TraxButton
                htmlType="button"
                styleType="secondary"
                buttonSize="medium"
                buttonText="Update Stripe Account"
                disabled={loading}
                loading={loading}
                onClick={() => window.open(loginUrl, '_blank', 'noreferrer')}
              />
            </div>
          </div>
        )}

        {(!stripeAccount) && (
          <div className="profile-form-box-unconnected">
            <span className="profile-box-heading">Connect to Stripe</span>
            <span className="profile-box-text">
              Click below to complete the Stripe onboarding process and connect your account.
            </span>
            <div className="w-full flex justify-end">
              <TraxButton
                htmlType="button"
                styleType="primary"
                buttonSize="full"
                buttonText="Connect"
                disabled={loading}
                loading={loading}
                onClick={onConnectAccount.bind(this)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}