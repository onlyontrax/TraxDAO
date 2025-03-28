import { Layout, Spin, message } from 'antd';
import Head from 'next/head';
import { connect } from 'react-redux';
import { updateCurrentUserAvatar, updateCurrentUserCover, updatePerformer } from 'src/redux/user/actions';
import { authService, performerService, utilsService } from '@services/index';
import ArtistSettings from '@components/settings/ArtistSettings';
import { IPerformer, ISettings, IUIConfig, ICountry, IMusic } from 'src/interfaces';
import ImgCrop from 'antd-img-crop';

interface IProps {
  currentUser: IPerformer;
  updatePerformer: Function;
  updating: boolean;
  updateCurrentUserAvatar: Function;
  updateCurrentUserCover: Function;
  ui: IUIConfig;
  settings: ISettings;
}

const AccountSettings = ({
  currentUser,
  updating,
  updatePerformer: handleUpdatePerformer,
  updateCurrentUserAvatar: handleUpdateAvatar,
  updateCurrentUserCover: handleUpdateCover,
  ui,
  settings
}: IProps) => {
  const token = authService.getToken();

  const handleSettingsUpdate = async (data: any) => {
    handleUpdatePerformer({
      ...currentUser,
      ...data
    });
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

  const handleCoverUpload = (data: any) => {
    message.success('Changes saved');
    handleUpdateCover(data.response.data.url);
  };

  if (!currentUser?._id) {
    return (
      <div style={{ margin: 30, textAlign: 'center' }}>
        <img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/>
      </div>
    );
  }

  const uploadHeaders = {
    authorization: authService.getToken() || ''
  };

  return (
    <Layout>
      <Head>
        <title>{`${ui?.siteName} | Edit Profile`}</title>
      </Head>
      {!currentUser.verifiedDocument && (
        <div className="verify-info">
          Your Identity has not been verified yet! You can't post any content right now.
          <p>Please go <a href="/artist/account/?tab=verification">here</a> to verify your identity.</p>
          <p>If you have any question, please contact our administrator to get more information.</p>
        </div>
      )}

      <ArtistSettings
        user={currentUser}
        settings={settings}
        updating={updating}
        onFinish={handleSettingsUpdate}
        options={{
          avatarUrl: performerService.getAvatarUploadUrl(),
          uploadAvatar: handleAvatarUpload,
          coverUploadUrl: performerService.getCoverUploadUrl(),
          onCoverUploaded: handleCoverUpload,
          uploadHeader: uploadHeaders
        }}
      />
    </Layout>
  );
};

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  updating: state.user.updating,
  ui: { ...state.ui },
  settings: { ...state.settings }
});

const mapDispatch = {
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover
};

export default connect(mapStates, mapDispatch)(AccountSettings);