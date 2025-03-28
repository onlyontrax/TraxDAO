import React, { useContext } from 'react';
import { Layout, message } from 'antd';
import Head from 'next/head';
import { connect } from 'react-redux';
import { ISettings, IUIConfig } from 'src/interfaces';
import { IUser } from 'src/interfaces/user';
import { updateCurrentUserAvatar, updatePassword, updateUser } from 'src/redux/user/actions';
import { SocketContext } from 'src/socket';
import FanSettings from '@components/settings/FanSettings';
import { authService } from '@services/auth.service';
import { userService } from '@services/user.service';
import { logout } from '@redux/auth/actions';

interface IProps {
  user: IUser;
  updating: boolean;
  updateUser: (data: any) => void;
  updateCurrentUserAvatar: Function;
  updatePassword: Function;
  updateSuccess: boolean;
  ui: IUIConfig;
  logout: Function;
  settings: ISettings;
}

const UserAccountSettingPage: React.FC<IProps> = ({
  user,
  updating,
  updateUser,
  updateCurrentUserAvatar,
  logout: handleLogout,
  ui,
  settings
}) => {
  const socket = useContext(SocketContext);
  const token = authService.getToken();

  const uploadHeader = {
    authorization: token || ''
  };

  const handleAvatarUpload = (data: any) => {
    try {
      updateCurrentUserAvatar(data.response.data.url);
      message.success('Avatar updated successfully');
    } catch (err) {
      message.error('Error updating avatar');
    }
  };

  // Only render if we have a valid token
  if (!token) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>{`${ui?.siteName} | Edit Profile`}</title>
      </Head>
      <FanSettings
        user={user}
        settings={settings}
        updating={updating}
        onFinish={updateUser}
        options={{
          avatarUrl: userService.getAvatarUploadUrl(),
          uploadAvatar: handleAvatarUpload,
          uploadHeader
        }}
      />
    </Layout>
  );
};

const mapStates = (state: any) => ({
  user: state.user.current,
  updating: state.user.updating,
  updateSuccess: state.user.updateSuccess,
  ui: { ...state.ui },
  settings: state.settings
});

const mapDispatch = {
  updateUser,
  updateCurrentUserAvatar,
  updatePassword,
  logout
};

export default connect(mapStates, mapDispatch)(UserAccountSettingPage);