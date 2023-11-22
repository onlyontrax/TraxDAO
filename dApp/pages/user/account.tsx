/* eslint-disable react/no-did-update-set-state, react/sort-comp */
import Router from 'next/router';
import { logout } from '@redux/auth/actions';
import { authService } from '@services/auth.service';
import { userService } from '@services/user.service';
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ISettings, IUIConfig } from 'src/interfaces';
import { IUser } from 'src/interfaces/user';
import { updateCurrentUserAvatar, updatePassword, updateUser } from 'src/redux/user/actions';
import { SocketContext } from 'src/socket';
import { UserAccountForm } from '@components/user';
import styles from './index.module.scss';

interface IProps {
  user: IUser;
  updating: boolean;
  updateUser: Function;
  updateCurrentUserAvatar: Function;
  updatePassword: Function;
  updateSuccess: boolean;
  ui: IUIConfig;
  logout: Function;
  settings: ISettings;
  sve: any;
}
interface IState {
  emailSending: boolean;
  countTime: number;
}

class UserAccountSettingPage extends PureComponent<IProps, IState> {
  static authenticate = true;

  _intervalCountdown: any;

  state = {
    emailSending: false,
    countTime: 60
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    this._intervalCountdown && clearInterval(this._intervalCountdown);
  }

  handleCountdown = async () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.coundown.bind(this), 1000);
  };

  async handleSwitchToPerformer() {
    const { user, logout: handleLogout } = this.props;
    if (!user._id) return;
    if (!window.confirm('By confirm to become a artist, your current account will be change immediately!')) return;
    try {
      const resp = await authService.userSwitchToPerformer(user._id);
      message.success(resp?.data?.message || 'Switched account success!');
      const token = authService.getToken() || '';
      const socket = this.context;
      // @ts-ignore
      token
        && socket
        && (await (socket as any).emit('auth/logout', {
          token
        }));
      // @ts-ignore
      socket && socket.close();
      handleLogout();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

  onFinish(data) {
    const { updateUser: handleUpdateUser } = this.props;
    handleUpdateUser(data);
  }

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  uploadAvatar(data) {
    const { updateCurrentUserAvatar: handleUpdateUserAvt } = this.props;
    handleUpdateUserAvt(data.response.data.url);
  }

  onNFIDConnect = () => {};

  async verifyEmail() {
    const { user } = this.props;
    try {
      await this.setState({ emailSending: true });
      const resp = await authService.verifyEmail({
        sourceType: 'user',
        source: user
      });
      this.handleCountdown();
      resp.data && resp.data.message && message.success(resp.data.message);
    } catch (e) {
      const error = await e;
      message.success(error?.message || 'An error occured, please try again later');
    } finally {
      this.setState({ emailSending: false });
    }
  }

  render() {
    const {
      user, updating, ui, settings
    } = this.props;
    const { countTime, emailSending } = this.state;
    const uploadHeader = {
      authorization: authService.getToken() || ''
    };

    return (
      <Layout className={styles.pagesUserBookmarksModule}>
        <Head>
          <title>{`${ui?.siteName} | Edit Profile`}</title>
        </Head>
        <div className="main-container user-account">
          <UserAccountForm
            onFinish={this.onFinish.bind(this)}
            updating={updating || emailSending}
            user={user}
            options={{
              uploadHeader,
              avatarUrl: userService.getAvatarUploadUrl(),
              uploadAvatar: this.uploadAvatar.bind(this)
            }}
            countTime={countTime}
            onVerifyEmail={this.verifyEmail.bind(this)}
            onSwitchToPerformer={this.handleSwitchToPerformer.bind(this)}
            ui={ui}
            settings={settings}
            onNFIDConnect={this.onNFIDConnect.bind(this)}
          />
        </div>
      </Layout>
    );
  }
}

UserAccountSettingPage.contextType = SocketContext;

const mapStates = (state) => ({
  user: state.user.current,
  updating: state.user.updating,
  updateSuccess: state.user.updateSuccess,
  ui: { ...state.ui },
  sve: state
});
const mapDispatch = {
  updateUser,
  updateCurrentUserAvatar,
  updatePassword,
  logout
};
export default connect(mapStates, mapDispatch)(UserAccountSettingPage);
