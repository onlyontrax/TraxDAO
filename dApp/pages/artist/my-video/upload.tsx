/* eslint-disable react/sort-comp */
import PageHeading from '@components/common/page-heading';
import { FormUploadVideo } from '@components/video/form-upload';
import { getResponseError } from '@lib/utils';
import { videoService } from '@services/video.service';
import { cryptoService } from '@services/crypto.service';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IPerformer, ISettings, IUIConfig } from 'src/interfaces';

import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { Content, Participants } from '../../../src/smart-contracts/declarations/ppv/ppv2.did';

import { idlFactory as idlFactoryPPV } from '../../../src/smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV } from '../../../src/smart-contracts/declarations/ppv/ppv2.did';
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider } from '../../../src/crypto/mobilePlugWallet';

interface IProps {
  ui: IUIConfig;
  user: IPerformer;
  settings: ISettings;
}

interface IFiles {
  fieldname: string;
  file: File;
}

interface IResponse {
  data: { _id: string };
}

class UploadVideo extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    uploading: false,
    uploadPercentage: 0
  };

  _files: {
    thumbnail: File;
    teaser: File;
    video: File;
  } = {
    thumbnail: null,
    teaser: null,
    video: null
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user || !user.verifiedDocument) {
      message.warning('Your Identity has not been verified yet! You can\'t post any content right now. Please to to Account settings to verify your account.');
      Router.back();
    }
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {
    const { user, settings } = this.props;
    if (!this._files.video) {
      message.error('Please select file!');
      return;
    }

    const submitData = { ...data };
    if ((data.isSale === 'pay' && !data.price) || (data.isSale === 'pay' && data.price < 1)) {
      message.error('Invalid amount of tokens');
      return;
    }
    if (data.isSchedule && !data.scheduledAt) {
      message.error('Invalid schedule date');
      return;
    }
    if (data.tags) { submitData.tags = [...[], ...data.tags]; }
    if (data.participantIds) submitData.participantIds = [...[], ...data.participantIds];
    const files = Object.keys(this._files).reduce((f, key) => {
      if (this._files[key]) {
        f.push({
          fieldname: key,
          file: this._files[key] || null
        });
      }
      return f;
    }, [] as IFiles[]) as [IFiles];

    this.setState({
      uploading: true
    });
    try {
      const res = (await videoService.uploadVideo(files, data, this.onUploading.bind(this))) as IResponse;

      if (data.isCrypto) {
        const participants = [];
        let pubPercentage: number;
        const rc = data.royaltyCut;

        for (let i = 0; i < rc.length; i += 1) {
          if (rc[i].performerId === user._id) {
            pubPercentage = rc[i].percentage / 100;
          } else {
            const obj: Participants = {
              participantID: Principal.fromText(rc[i].wallet_id),
              participantPercentage: rc[i].percentage / 100
            };
            participants.push(obj);
          }
        }

        const content: Content = {
          publisher: Principal.fromText(user.wallet_icp),
          publisherPercentage: pubPercentage,
          price: data.price,
          participants,
          contentType: data.trackType === null ? 'video' : data.trackType
        };

        let identity, ppvActor, agent, host;

        const authClient = await AuthClient.create();

        if(data.walletOption === ('II' || 'nfid' )){
          if (settings.icNetwork !== true) {
            await authClient.login({
              identityProvider: cryptoService.getIdentityProviderLink(),
              onSuccess: async () => {
                if (await authClient.isAuthenticated()) {
                  identity = authClient.getIdentity();
                  host = settings.icHost;
                  agent = new HttpAgent({
                    identity,
                    host
                  });

                  let sender = await agent.getPrincipal();
                  agent.fetchRootKey();
                  ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
                    agent,
                    canisterId: settings.icPPV
                  });
                }
                await this.handleAddPPVContent(res.data._id, content, ppvActor);
              }
            });
          } else {
            host = settings.icHost;
            await authClient.login({
              onSuccess: async () => {
                identity = await authClient.getIdentity();
                agent = new HttpAgent({ identity, host });
                ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
                  agent,
                  canisterId: settings.icPPV
                });

                await this.handleAddPPVContent(res.data._id, content, ppvActor);
              }
            });
          }
        }else if(data.walletOption === 'plug'){

          const whitelist = [
            settings.icPPV,
          ];

          //const plugWalletProvider = await getPlugWalletProvider();
          const agent = await getPlugWalletAgent('icPPV');
          const connected = await getPlugWalletIsConnected();

          !connected && message.info("Failed to connected to canister. Please try again later or contact us. ")

          this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 20 });

          ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
            agent: agent,
            canisterId: settings.icPPV
          });

          await this.handleAddPPVContent(res.data._id, content, ppvActor);

        }else{
          message.error("This wallet does not exist. Please try again.")
        }
      }

      Router.replace(`/${user?.username || user?._id}`);
      message.success('Your track has been successfully uploaded!');
    } catch (error) {
      message.error(getResponseError(error) || 'An error occurred, please try again!');
    } finally {
      this.setState({ uploading: false });
    }
  }

  async handleAddPPVContent(id: string, content: Content, ppvActor: any) {
    const { user } = this.props;

    await ppvActor
      .addPPVContent(id, content)
      .then(async () => {
        message.success('Upload successful!');
        Router.replace(`/${user?.username || user?._id}`);
      })
      .catch(async (error) => {
        message.error(error.message || 'error occured, please try again later');
        await this.deleteVideo(id);
        return error;
      });
  }

  async deleteVideo(id: string) {
    // eslint-disable-next-line no-alert
    try {
      await videoService.delete(id);
      message.success('Your video has been removed.');
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
  }

  render() {
    const { uploading, uploadPercentage } = this.state;
    const { ui, user } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Upload a track`}</title>
        </Head>
        <div className="main-container">
          <PageHeading title="" />
          <FormUploadVideo
            user={user}
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
            settings={this.props.settings}
          />
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui,
  user: state.user.current,
  settings: state.settings
});
export default connect(mapStates)(UploadVideo);
