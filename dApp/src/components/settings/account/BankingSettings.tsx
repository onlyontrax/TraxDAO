import React, { useState } from 'react';
import { Form, message, Spin } from 'antd';
import { AccountPaypalForm, StripeConnectForm } from '@components/performer';
import { paymentService, performerService } from '@services/index';
import { IPerformer, IAccount, ISettings } from 'src/interfaces';

interface BankingSettingsProps {
  account: IAccount;
  settings: ISettings;
}

const BankingSettings: React.FC<BankingSettingsProps> = ({
  account,
  settings
}) => {
  const [form] = Form.useForm();
  const [submitingPP, setSubmitingPP] = useState(false);
  const [submitingStripe, setSubmitingStripe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginUrl, setLoginUrl] = useState('');
  const [stripeAccount, setStripeAccount] = useState(null);

  React.useEffect(() => {
    if (settings.paymentGateway === 'stripe') {
      getAccount();
    }
  }, [settings.paymentGateway]);

  const getAccount = async () => {
    try {
      setLoading(true);
      const [loginLink, fetchAccount] = await Promise.all([
        paymentService.loginLink(),
        paymentService.retrieveStripeAccount()
      ]);
      setLoginUrl(loginLink.data.url);
      setStripeAccount(fetchAccount.data);
    } catch (e) {
      console.log("stripe error", e);
      if (e?.message === 'Please connect to Stripe with your account') {
        // We just ignore this then
      } else {
        message.error('Error loading Stripe account details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaypal = async (data) => {
    try {
      setSubmitingPP(true);
      const payload = { key: 'paypal', value: data, accountId: account._id };
      await performerService.updatePaymentGateway(account._id, payload);
      message.success('PayPal account was updated successfully!');
    } catch (e) {
      message.error('Error updating PayPal account');
    } finally {
      setSubmitingPP(false);
    }
  };

  const connectStripeAccount = async () => {
    try {
      setSubmitingStripe(true);
      const resp = await paymentService.connectStripeAccount();
      if (resp.data?.url) {
        window.location.href = resp.data.url;
      }
    } catch (e) {
      message.error('Error connecting Stripe account');
    } finally {
      setSubmitingStripe(false);
    }
  };

  return (
    <div className="account-form-settings">
      <div className="w-full">
        <h1 className="profile-page-heading">Cash out</h1>
        <span className="profile-page-subtitle">
          Connect to Stripe or PayPal to withdraw your earnings from TRAX
        </span>

        <Spin spinning={loading}>
          <StripeConnectForm
            stripeAccount={stripeAccount}
            loading={loading || submitingStripe}
            loginUrl={loginUrl}
            onConnectAccount={connectStripeAccount}
          />
        </Spin>

        {account?.paypalSetting?.value?.email ? (
          <div className="profile-form-box-connected">
            <span className="profile-box-heading">PayPal connected</span>
            <span className="profile-box-text">
              You have successfully connected a PayPal account. To change this account,
              please enter new email and press submit.
            </span>
            <div className="w-full flex">
              <AccountPaypalForm
                onFinish={handleUpdatePaypal}
                updating={submitingPP}
                account={account}
              />
            </div>
          </div>
        ) : (
          <div className="profile-form-box-unconnected">
            <span className="profile-box-heading">Connect to PayPal</span>
            <span className="profile-box-text">
              Enter your email and by clicking 'Connect' you will be redirected to connect
              your PayPal account.
            </span>
            <div className="w-full flex">
              <AccountPaypalForm
                onFinish={handleUpdatePaypal}
                updating={submitingPP}
                account={account}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankingSettings;