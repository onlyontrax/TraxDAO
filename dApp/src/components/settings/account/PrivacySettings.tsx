import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Form, message, Spin } from 'antd';
import { AccountPaypalForm, StripeConnectForm } from '@components/performer';
import { paymentService, performerService, accountService } from '@services/index';
import { IPerformer, IAccount, ISettings } from 'src/interfaces';
import TraxButton from '@components/common/TraxButton';
import { logout } from '@redux/auth/actions';

interface PrivacySettingsProps {
  account: IAccount;
  settings: ISettings;
  logout: Function;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  account,
  logout: handleLogout,
  settings
}) => {
  const [form] = Form.useForm();
  const [submitingPP, setSubmitingPP] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setSubmitingPP(true);
      if (!window.confirm(`Are you sure to delete this account: ${account?.email}. All data will be lost!`)) return;
      const result = await accountService.delete(account._id);
      if (result?.data?.deleted) {
        message.success('Account deleted. Logging off.');
        handleLogout();
      } else {
        message.error('Error deleting account, please try again later');
      }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    } finally {
      setSubmitingPP(false);
    }
  };

  return (
    <div className="account-form-settings">
      <div className="w-full">
        <h1 className="profile-page-heading">Delete account</h1>
        <span className="profile-page-subtitle">
          Deleting the account will result in losing all of your subaccounts and all activities and data related to your account.
        </span>
        <div className="w-full flex">
          <TraxButton
              htmlType="button"
              styleType="alert"
              buttonSize="medium"
              buttonText="Delete Account"
              disabled={loading}
              loading={loading}
              onClick={handleDelete}
            />
        </div>
      </div>
    </div>
  );
};

const mapStates = (state: any) => ({
});

const mapDispatch = {
  logout
};

export default connect(mapStates, mapDispatch)(PrivacySettings);
