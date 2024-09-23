import { connect } from 'react-redux';
import { VideoCameraOutlined } from '@ant-design/icons';
import PageHeading from '@components/common/page-heading';
import { FormUploadVideo } from '@components/video/form-upload';
import { getResponseError } from '@lib/utils';
import { videoService } from '@services/video.service';
import { cryptoService } from '@services/crypto.service';
import { Layout, Spin, message } from 'antd';
import moment from 'moment';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IPerformer, IUIConfig, IVideo, ISettings } from 'src/interfaces';

import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { Content, Participants } from '../../../src/smart-contracts/declarations/ppv/ppv2.did';

import { idlFactory as idlFactoryPPV } from '../../../src/smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV } from '../../../src/smart-contracts/declarations/ppv/ppv2.did';

interface IProps {
  id: string;
  ui: IUIConfig;
  user: IPerformer;
  settings: ISettings;
}

interface IFiles {
  fieldname: string;
  file: File;
}

class VideoUpdate extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    fetching: true,
    uploading: false,
    uploadPercentage: 0,
    video: {} as IVideo
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

  async componentDidMount() {
    const { id } = this.props;
    if (!id) {
      const data = await this.getData();

      this.setState({ video: data.video, fetching: false });
    } else {
      try {
        const resp = await videoService.findById(id);
        this.setState({ video: resp.data });
      } catch (e) {
        message.error('Video not found!');
        Router.back();
      } finally {
        this.setState({ fetching: false });
      }
    }
  }

  async getData() {
    try {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      const resp = await videoService.findById(id);

      return {
        video: resp?.data
      };
    } catch (e) {
      message.error('Video not found!');
      return {
        video: null
      };
    }
  }

  async handleUpdatePPVContent(id: string, content: Content, ppvActor: any, files: any, data: any) {
    const { user } = this.props;
    await ppvActor
      .updatePPVContent(id, content)
      .then(async () => {
        await videoService.update(id, files, data, this.onUploading.bind(this));
        Router.replace(`/${user?.username || user?._id}`);
        message.success('Update successful!');
      })
      .catch((error) => {
        message.error(error.message || 'error occured, please try again later');
        return error;
      });
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {

    const { user, settings } = this.props;
    const { video } = this.state;
    const submitData = { ...data };
    if ((data.isSale === 'pay' && !data.price) || (data.isSale === 'pay' && data.price < 1)) {
      message.error('Invalid price');
      return;
    }
    if ((data.isSchedule && !data.scheduledAt) || (data.isSchedule && moment(data.scheduledAt).isBefore(moment()))) {
      message.error('Invalid schedule date');
      return;
    }
    submitData.tags = [...data.tags];
    submitData.participantIds = [...data.participantIds];
    const files = Object.keys(this._files).reduce((f, key) => {
      if (this._files[key]) {
        f.push({
          fieldname: key,
          file: this._files[key] || null
        });
      }
      return f;
    }, [] as IFiles[]) as [IFiles];

    await this.setState({
      uploading: true
    });
    try {
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

        let identity;
        let ppvActor;
        let agent;
        const host = settings.icHost;
        const authClient = await AuthClient.create();

        if (settings.icNetwork !== true) {
          await authClient.login({
            identityProvider: cryptoService.getIdentityProviderLink(),
            onSuccess: async () => {
              if (await authClient.isAuthenticated()) {
                identity = authClient.getIdentity();
                agent = new HttpAgent({
                  identity,
                  host
                });

                agent.fetchRootKey();
                ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
                  agent,
                  canisterId: settings.icPPV
                });
              }

              await this.handleUpdatePPVContent(video._id, content, ppvActor, files, data);
            }
          });
        } else {
          await authClient.login({
            onSuccess: async () => {
              identity = await authClient.getIdentity();
              agent = new HttpAgent({ identity, host });
              ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
                agent,
                canisterId: settings.icPPV
              });

              await this.handleUpdatePPVContent(video._id, content, ppvActor, files, data);
            }
          });
        }
      } else {
        await videoService.update(video._id, files, data, this.onUploading.bind(this));
      }
      Router.replace(`/${user?.username || user?._id}`);
      message.success('Your track has been successfully updated');
    } catch (error) {
      message.error(getResponseError(error) || 'An error occurred, please try again!');
    } finally {
      this.setState({ uploading: false });
    }
  }

  render() {
    const {
      video, uploading, fetching, uploadPercentage
    } = this.state;
    const { ui, user } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Edit Video`}</title>
        </Head>
        <div className="main-container">
          {/* <PageHeading title="Edit Video" icon={<VideoCameraOutlined />} /> */}
          {!fetching && video && (
            <FormUploadVideo
              user={user}
              video={video}
              submit={this.submit.bind(this)}
              uploading={uploading}
              beforeUpload={this.beforeUpload.bind(this)}
              uploadPercentage={uploadPercentage}
              settings={this.props.settings}
            />
          )}
          {fetching && (
            <div className="text-center">
              <Spin />
            </div>
          )}
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui,
  user: state.user.current,
  settings: { ...state.settings }
});
export default connect(mapStates)(VideoUpdate);
