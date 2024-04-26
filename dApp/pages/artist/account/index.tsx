/* eslint-disable react/no-unused-state, react/no-unused-prop-types, react/sort-comp */
import {
  Button, Form, Input, Layout, Modal, Row, Tabs, message, Spin
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { SelectUserDropdown } from '@components/user/select-users-dropdown';
import {
  PerformerAccountForm,
  PerformerBlockCountriesForm,
  PerformerSubscriptionForm,
  PerformerVerificationForm
} from '@components/performer';
import { PerformerWalletForm } from '@components/performer/walletsForm';
import {
  authService, blockService, performerService, utilsService
} from '@services/index';
import {
  IBlockCountries, ICountry, IMusic, IPerformer, ISettings, IUIConfig
} from 'src/interfaces';
import { updateCurrentUserAvatar, updateCurrentUserCover, updatePerformer } from 'src/redux/user/actions';
import styles from '../../user/index.module.scss';
import BankingSettings from '../banking';
import BlockPage from '../block-user';

interface IProps {
  currentUser: IPerformer;
  updatePerformer: Function;
  updating: boolean;
  updateCurrentUserAvatar: Function;
  ui: IUIConfig;
  updateCurrentUserCover: Function;
  countries: ICountry[];
  musicInfo: IMusic;
  updateUserSuccess: Function;
  settings: ISettings;
}
class AccountSettings extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  async getData() {
    try {
      const [countries, musicInfo] = await Promise.all([utilsService.countriesList(), utilsService.musicInfo()]);
      return {
        countries: countries?.data || [],
        musicInfo: musicInfo?.data
      };
    } catch (e) {
      return {
        countries: [],
        musicInfo: null
      };
    }
  }

  _intervalCountdown: any;

  state = {
    emailSending: false,
    countTime: 60,

    loading: false,
    submiting: false,
    limit: 10,
    offset: 0,
    blockUserId: '',
    userBlockedList: [],
    totalBlockedUsers: 0,
    openBlockModal: false,
    countries: null,
    musicInfo: null
  };

  async componentDidMount() {
    const { countries } = this.state;
    if (countries === null) {
      const data = await this.getData();

      this.setState({ musicInfo: data.musicInfo, countries: data.countries }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {}

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

  onAvatarUploaded(data: any) {
    const { updateCurrentUserAvatar: handleUpdateAvt } = this.props;
    message.success('Changes saved');
    handleUpdateAvt(data.response.data.url);
  }

  onCoverUploaded(data: any) {
    const { updateCurrentUserCover: handleUpdateCover } = this.props;
    message.success('Changes saved');
    handleUpdateCover(data.response.data.url);
  }

  async submit(data: any) {
    const { currentUser, updatePerformer: handleUpdatePerformer } = this.props;
    handleUpdatePerformer({
      ...currentUser,
      ...data
    });
  }

  async verifyEmail() {
    const { currentUser } = this.props;
    try {
      await this.setState({ emailSending: true });
      const resp = await authService.verifyEmail({
        sourceType: 'performer',
        source: currentUser
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

  async handleUpdateBlockCountries(data: IBlockCountries) {
    const { currentUser, updateUserSuccess: onUpdateSuccess } = this.props;
    try {
      this.setState({ submiting: true });
      const resp = await blockService.blockCountries(data);
      onUpdateSuccess({ ...currentUser, blockCountries: resp.data });
      this.setState({ submiting: false });
      message.success('Changes saved');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try againl later');
      this.setState({ submiting: false });
    }
  }

  handleBlockUser = async (data) => {
    const { blockUserId: targetId } = this.state;
    const { reason } = data;
    if (!targetId) {
      message.error('Please select a user');
      return;
    }

    try {
      this.setState({ submiting: true });
      await blockService.blockUser({ targetId, target: 'user', reason });
      message.success('User profile is blocked successfully');
      this.getBlockList();
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message || 'An error occured, please try again later');
    } finally {
      this.setState({ submiting: false, openBlockModal: false });
    }
  };

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  async getBlockList() {
    const { limit, offset } = this.state;
    try {
      this.setState({ loading: true });
      const resp = await blockService.getBlockListUsers({
        limit,
        offset: offset * limit
      });
      this.setState({
        loading: false,
        userBlockedList: resp.data.data,
        totalBlockedUsers: resp.data.total
      });
    } catch (e) {
      message.error('An error occured, please try again later');
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      currentUser, updating, ui
    } = this.props;
    const {
      emailSending, countTime, submiting, openBlockModal, countries, musicInfo
    } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken() || ''
    };

    if (countries === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    return (
      <Layout className={styles.pagesUserBookmarksModule}>
        <Head>
          <title>{`${ui?.siteName} | Edit Profile`}</title>
        </Head>
        <div className="main-container user-account" style={{maxWidth: '650px'}}>
          {!currentUser.verifiedDocument && (
            <div className="verify-info">
              Your Identity has not been verified yet! You can't post any content right now.
              <p>Please go <a href="/artist/account/">here</a> to verify your identity.</p>
              <p>If you have any question, please contact our administrator to get more information.</p>
            </div>
          )}
          <h1 className="content-heading">Settings</h1>
          <p />
          <Tabs defaultActiveKey="basic" tabPosition="top" className="account-tabs custom" >
            <Tabs.TabPane tab={<span>Account</span>} key="basic">
              <PerformerAccountForm
                onFinish={this.submit.bind(this)}
                updating={updating || emailSending}
                countTime={countTime}
                onVerifyEmail={this.verifyEmail.bind(this)}
                user={currentUser}
                options={{
                  uploadHeaders,
                  avatarUploadUrl: performerService.getAvatarUploadUrl(),
                  onAvatarUploaded: this.onAvatarUploaded.bind(this),
                  coverUploadUrl: performerService.getCoverUploadUrl(),
                  onCoverUploaded: this.onCoverUploaded.bind(this),
                  videoUploadUrl: performerService.getVideoUploadUrl()
                }}
                countries={countries}
                musicInfo={musicInfo}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Verification</span>} key="verification">
              <PerformerVerificationForm user={currentUser} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Connect wallet</span>} key="wallets">
              <PerformerWalletForm onFinish={this.submit.bind(this)} updating={updating} user={currentUser} />
            </Tabs.TabPane> 
            <Tabs.TabPane tab={<span>Pricing</span>} key="subscription">
              <PerformerSubscriptionForm onFinish={this.submit.bind(this)} updating={updating} user={currentUser} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Banking</span>} key="banking">
              <BankingSettings countries={countries} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Permissions</span>} key="permission">
              <div className="account-form">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%' }}>
                  <h1 className="profile-page-heading">Block user</h1>
                  <BlockPage className="" />
                </div>
              </div>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
        <Modal
          centered
          title="Block user"
          open={openBlockModal}
          onCancel={() => this.setState({ openBlockModal: false })}
          footer={null}
          destroyOnClose
        >
          <Form
            name="blockForm"
            onFinish={this.handleBlockUser.bind(this)}
            initialValues={{ reason: '' }}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className="account-form"
          >
            <Form.Item label="Please select user you want to block">
              <SelectUserDropdown onSelect={(val) => this.setState({ blockUserId: val })} />
            </Form.Item>
            <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Tell us your reason' }]}>
              <Input.TextArea placeholder="Enter your reason" />
            </Form.Item>
            <Form.Item>
              <Button
                className="primary submit-content"
                htmlType="submit"
                loading={submiting}
                disabled={submiting}
                style={{ marginRight: '20px' }}
              >
                Submit
              </Button>
              <Button
                className="secondary submit-content-green"
                onClick={() => this.setState({ openBlockModal: false })}
              >
                Close
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  updating: state.user.updating,
  ui: { ...state.ui }
});
const mapDispatch = {
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover
};
export default connect(mapStates, mapDispatch)(AccountSettings);
