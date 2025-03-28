import React, { useContext } from 'react';
import { Layout, message } from 'antd';
import Head from 'next/head';
import { connect } from 'react-redux';
import { ISettings, IUIConfig, IAccount } from 'src/interfaces';
import { IUser } from 'src/interfaces/user';
import { updateCurrentUserAvatar, updatePassword, updateAccount } from 'src/redux/user/actions';
import { SocketContext } from 'src/socket';
import AccountSettings from '@components/settings/AccountSettings';
import { authService } from '@services/auth.service';
import { userService } from '@services/user.service';
import { logout } from '@redux/auth/actions';

interface IProps {
  account: IAccount;
  user: IUser;
  updating: boolean;
  updateAccount: (data: any) => void;
  updateCurrentUserAvatar: Function;
  updatePassword: Function;
  updateSuccess: boolean;
  ui: IUIConfig;
  logout: Function;
  settings: ISettings;
}

const AccountSettingPage: React.FC<IProps> = ({
  account,
  user,
  updating,
  updateAccount,
  updateCurrentUserAvatar,
  logout: handleLogout,
  ui,
  settings
}) => {
  const socket = useContext(SocketContext);
  const token = authService.getToken();

  // Only render if we have a valid token
  if (!token) {
    return null;
  }

  if (!account?._id) {
    return (
      <div style={{ margin: 30, textAlign: 'center' }}>
        <img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{`${ui?.siteName} | Edit Account Profile`}</title>
      </Head>
      <AccountSettings
        account={account}
        settings={settings}
        updating={updating}
        onFinish={updateAccount}
      />
    </Layout>
  );
};

const mapStates = (state: any) => ({
  account: state.user.account,
  user: state.user.current,
  updating: state.user.updating,
  updateSuccess: state.user.updateSuccess,
  ui: { ...state.ui },
  settings: state.settings
});

const mapDispatch = {
  updateAccount,
  updateCurrentUserAvatar,
  updatePassword,
  logout
};

export default connect(mapStates, mapDispatch)(AccountSettingPage);