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
      <div className="account-form">
        <h4 className="text-center">The Stripe connect account will be used to automatically payouts. You can also save your Banking or PayPal account to request manual payouts</h4>
        {stripeAccount && stripeAccount.payoutsEnabled && stripeAccount.detailsSubmitted && (
          <div className="text-center">
            <p>You are connected with Stripe!</p>
            <Button className="primary">
              <a href={loginUrl} target="_blank" rel="noreferrer">
                Click here to log in
              </a>
            </Button>
            <Button
              className="secondary"
              disabled={loading}
              loading={loading}
              onClick={onConnectAccount.bind(this)}
            >
              Reconnect by another account
            </Button>
          </div>
        )}
        {(!stripeAccount || (stripeAccount && !stripeAccount.payoutsEnabled) || (stripeAccount && !stripeAccount.detailsSubmitted)) && (
          <div>
            <p>Please click here to complete the onboarding process & start earning money.</p>
            <Button
              className="secondary"
              disabled={loading}
              loading={loading}
              onClick={onConnectAccount.bind(this)}
            >
              Connect with Stripe
            </Button>
          </div>
        )}
      </div>
    );
  }
}
