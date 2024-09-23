/* eslint-disable no-await-in-loop, no-nested-ternary */
import {
  Upload, message, Button, Tooltip, Select, Modal, Radio, Image as ImageComp,
  Input, Form, InputNumber, Progress, Popover, Row, Col, Switch, Avatar, Table
} from 'antd';
import {
  PictureOutlined, DeleteOutlined, OrderedListOutlined
} from '@ant-design/icons';
import { connect } from 'react-redux';
import { UploadList } from '@components/file/list-media';
import { IFeed, IPerformer, ISettings } from 'src/interfaces';
import { performerService, feedService } from '@services/index';
import { cryptoService } from '@services/crypto.service';
import { Actor, HttpAgent } from "@dfinity/agent";
import { b64toBlob, encodeArrayBuffer, getFileExtension } from '@components/icp-stream/utils';
import { AuthClient } from '@dfinity/auth-client';
import { debounce } from 'lodash';
import { PlusIcon } from 'src/icons';
import { VideoPlayer } from '@components/common';
import { PureComponent } from 'react';
import Router from 'next/router';
import { idlFactory as idlFactoryTraxNFT } from '../../smart-contracts/declarations/traxNFT/traxNFT.did.js';
import type { _SERVICE as _SERVICE_TRAX_NFT } from '../../smart-contracts/declarations/traxNFT/traxNFT2.did';
import moment from 'moment';
  
  
const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};
const { Option } = Select;
interface IProps {
  type?: string;
  discard?: Function;
  feed?: IFeed;
  performer: IPerformer;
  settings: ISettings;
}

class CreateTicketNftForm extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  pollIds = [];

  thumbnailId = null;

  teaserId = null;

  state = {
    uploading: false,
    thumbnail: null,
    teaser: null,
    fileList: [],
    fileIds: [],
    text: '',
    isShowPreviewTeaser: false,
    uploadToIC: true,
    shareTip: false,
    featuring: [],
    royaltyCut: [],
    performers: []
  };

  async componentDidMount() {
    const { feed, performer } = this.props;

    if (feed) {
      this.setState({
        fileList: feed.files ? feed.files : [],
        fileIds: feed.fileIds ? feed.fileIds : [],
        thumbnail: feed.thumbnail,
        text: feed.text
      });
      this.teaserId = feed.teaserId;
      this.thumbnailId = feed.thumbnailId;
    }
    this.pushFeaturedArtists([performer?._id]);
    this.getPerformers('', feed?.feedParticipants || [performer._id]);
  }

  pushFeaturedArtists = debounce(async (ids) => {
    try {
      const result = [];

      for (let i = 0; i < ids.length; i += 1) {
        const resp = await performerService.findOne(ids[i]);
        if (resp.data.wallet_icp) {
          result.push(resp.data);
        } else {
          message.config({ duration: 6 });
          message.info('This artist cannot benefit from royalty sharing as they have not connected their wallet.');
        }
        
      }

      this.setState({ featuring: result });
    } catch (e) {
      const err = await e;

      message.error(err?.message || 'Error occured');
    }
  }, 500);

  getPerformers = debounce(async (q, performerIds) => {
    try {
      const resp = await (
        await performerService.search({
          q,
          performerIds: performerIds || '',
          limit: 500
        })
      ).data;
      const performers = resp.data || [];
      this.setState({ performers: performers });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
    }
  }, 500);

  changeShareTipPreference = (val:any) => {
    this.setState({ shareTip: val });
  }

  handleDeleteFile = (field: string) => {
    if (field === 'thumbnail') {
      this.setState({ thumbnail: null });
      this.thumbnailId = null;
    }
    if (field === 'teaser') {
      this.setState({ teaser: null });
      this.teaserId = null;
    }
  };

  onUploading = (file, resp: any) => {
    // eslint-disable-next-line no-param-reassign
    file.percent = resp.percentage;
    // eslint-disable-next-line no-param-reassign
    if (file.percent === 100) file.status = 'done';
    this.forceUpdate();
  };

  blobToImage(blob) {
    return new Promise(function(resolve) {
      const url = URL.createObjectURL(blob)
      let img = new Image()
      img.src = url
      resolve(img);
    })
  }

  onsubmit = async (feed, values) => {
    const { type, settings } = this.props;
    try {
      this.setState({ uploading: true });

      let identity, agent, nftActor;
      const host = settings.icHost;
      const authClient = await AuthClient.create();
      if (this.state.fileList.length < 1) {
        return;
      }
      let file = this.state.fileList[0];
      const MAX_CHUNK_SIZE = 1024 * 500;
      const chunkCount = BigInt(Number(Math.ceil(file.size / MAX_CHUNK_SIZE)));
  
  
      if (settings.icNetwork !== true) {
        identity = authClient.getIdentity();
        await authClient.login({
          identityProvider: cryptoService.getIdentityProviderLink(),
          onSuccess: async () => {
            agent = new HttpAgent({
              identity,
              host
            });
      
            await agent.fetchRootKey();
  
            nftActor = Actor.createActor<_SERVICE_TRAX_NFT>(idlFactoryTraxNFT, {
              agent,
              canisterId: settings.icNFT
            });

            const id = await nftActor.createTicket(await nftActor.getCallerId(), {
              id: "0",
              name: values.title,
              description: values.description,
              totalSupply: values.totalSupply,
              location: values.location,
              eventDate: values.eventDate,
              eventTime: values.eventTime,
              royalty: [
                {
                  participantID: await nftActor.getCallerId(),
                  participantPercentage: 1,
                }
              ],
              price: values.price,
              status: 'active',
              schedule: 0,
              ticker: 'ICP',
              chunkCount,
              extension: getFileExtension(file),
              size: file.size,
              logo: encodeArrayBuffer(await (new Response(this.state.thumbnail).arrayBuffer()))
            });

            message.success('Posted successfully!');
            Router.push('/artist/studio');
          }
        });

      } else {

        await authClient.login({
          identityProvider: cryptoService.getIdentityProviderLink(),
          onSuccess: async () => {
            identity = await authClient.getIdentity();
            agent = new HttpAgent({
              identity,
              host
            });
  
            nftActor = Actor.createActor<_SERVICE_TRAX_NFT>(idlFactoryTraxNFT, {
              agent,
              canisterId: settings.icNFT
            });

            const id = await nftActor.createTicket(await nftActor.getCallerId(), {
              id: "0",
              name: values.name,
              description: values.description,
              totalSupply: values.totalSupply,
              royalty: [
                {
                  participantID: await nftActor.getCallerId(),
                  participantPercentage: 1,
                }
              ],
              price: values.price,
              status: 'active',
              schedule: 0,
              ticker: 'ICP',
              chunkCount,
              extension: getFileExtension(file),
              size: file.size,
              logo: encodeArrayBuffer(await (new Response(this.state.thumbnail).arrayBuffer()))
            });
            
            message.success('Posted successfully!');
            Router.push('/artist/studio');
          }
        });
      }

    } catch {
      message.success('Something went wrong, please try again later');
      this.setState({ uploading: false });
    }
  };

  onChangePollDuration = (numberDays) => {
    const date = !numberDays ? moment().endOf('day').add(99, 'years') : moment().endOf('day').add(numberDays, 'days');
    this.setState({ openPollDuration: false, expiredPollAt: date, expirePollTime: numberDays });
  };

  onClearPolls = () => {
    this.setState({ pollList: [] });
    this.pollIds = [];
  };

  onEmojiClick = (emoji) => {
    const { text } = this.state;
    this.setState({ text: `${text} ${emoji} ` });
  };

  remove = async (file) => {
    const { fileList, fileIds } = this.state;
    this.setState({
      fileList: fileList.filter((f) => f?._id !== file?._id || f?.uid !== file?.uid),
      fileIds: fileIds.filter((id) => id !== file?._id)
    });
  };

  beforeUpload = async (file, listFile) => {
    const { fileList, fileIds, uploadToIC } = this.state;
    if (file.type.includes('image')) {
      const valid = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE as any || 5);
      if (!valid) {
        message.error(`Image ${file.name} must be smaller than ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB!`);
        return false;
      }
    }
    if (file.type.includes('video')) {
      const valid = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_TEASER as any || 200);
      if (!valid) {
        message.error(`Video ${file.name} must be smaller than ${process.env.NEXT_PUBLIC_MAX_SIZE_TEASER || 200}MB!`);
        return false;
      }
    }
    if (listFile.indexOf(file) === listFile.length - 1) {
      const files = await Promise.all(
        listFile.map((f) => {
          const newFile = f;
          if (newFile.type.includes('image')) return f;
          const reader = new FileReader();
          reader.onloadend = () => {
            newFile.thumbnail = reader.result;
          };
          reader.readAsDataURL(newFile);
          return newFile;
        })
      );
      this.setState({
        fileList: file.type.includes('image') ? files : [...fileList, ...files]
      });
    }
    return true;
  };

  beforeUploadThumbnail = async (file) => {
    
    if (!file) {
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE as any || 5);
    if (!isLt2M) {
      message.error(`Image is too large please provide an image ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB or below`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      const blob = b64toBlob(encoded, file.type);
      this.setState({ thumbnail: blob });
    };
    reader.readAsDataURL(file);
  };

  submit = async (payload: any) => {
    const { feed, type } = this.props;
    const {
      fileIds, text, royaltyCut
    } = this.state;
    const formValues = { ...payload };

    if (formValues.price < 0) {
      message.error('Price must be greater than 0');
      return;
    }
    formValues.text = text;
    formValues.fileIds = fileIds;
    const participantsSharing = payload.feedParticipants ? payload.feedParticipants : [];
    formValues.feedParticipants = [...[], ...participantsSharing];
    // let royaltySharing = [...[], ...this.state.royaltyCut];
    formValues.royaltySharing = [...[], ...royaltyCut];

    if (['video', 'photo'].includes(feed?.type || type) && !fileIds.length) {
      message.error(`Please add ${feed?.type || type} file`);
      return;
    }
    this.onsubmit(feed, formValues);
  }

  updatePercentages(performerId, walletId, e) {
    // performer[e.target.id] = e.target.value;
    const { royaltyCut } = this.state;
    const currentState = [...royaltyCut];
    if (currentState.length > 0) {
      for (let i = 0; i < currentState.length; i += 1) {
        if (currentState[i].performerId === performerId) {
          const item = { ...currentState[i] };
          item.percentage = e;
          currentState[i] = item;
          this.setState({ royaltyCut: currentState });
          return;
        }
      }
      const res = {
        wallet_id: walletId,
        performerId,
        percentage: e
      };
      currentState.push(res);
    } else {
      const res = {
        wallet_id: walletId,
        performerId,
        percentage: e
      };
      currentState.push(res);
    }
    this.setState({ royaltyCut: currentState });
  }

  columns = [
    {
      title: 'Allocation',
      key: 'Name',
      render: (performers) => (
        <div>
          <Avatar src={performers.avatar || '/static/no-avatar.png'} />
          {' '}
          {' '}
          {performers.name || performers?.username || 'N/A'}

        </div>
      )
    },
    {
      title: ' ',
      key: 'percentageCut',
      render: (performers) => (
        <div style={{
          width: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
        }}
        >
          <Form.Item style={{ width: '50%' }} name="percentageCut">
            <InputNumber id={performers._id} defaultValue={0} onChange={(e) => this.updatePercentages(performers._id, performers.wallet_icp, e)} style={{ width: '100%' }} min={1} max={100} />
            {' '}
            %
          </Form.Item>
        </div>
      )
    }
  ]

  render() {
    const {
      feed, type, discard, performer
    } = this.props;
    const {
      uploading, fileList, fileIds, text, isShowPreviewTeaser, uploadToIC, thumbnail, teaser, shareTip, performers, featuring
    } = this.state;
    const dataSource = featuring.map((p) => ({ ...p, key: p._id }));
    
    return (
      <div>
        <div className="feed-form">
          <Form
            {...layout}
            onFinish={(values) => {
              this.submit(values);
            }}
            validateMessages={validateMessages}
            initialValues={feed || ({
              text: '',
              price: 4.99,
              status: 'active',
              uploadToIC: true,
              shareTip: false,
              feedParticipants: [feed?.performer._id]
            })}
            scrollToFirstError
          >
          <div className="input-f-desc">
              <p style={{ fontSize: '1.5rem', color: 'white' }}>
              Ticket NFT
              </p>
              {(!feed || !feed._id) && (
              <Button
                  className="new-post-delete-btn"
                  onClick={() => discard()}
                  style={{ backgroundColor: 'transparent', border: 'none' }}
                  disabled={uploading}
              >
                  <DeleteOutlined />
              </Button>
              )}

              {['video', 'photo'].includes(feed?.type || type) && (
              <Form.Item>
                  <UploadList
                  type={feed?.type || type}
                  files={fileList}
                  remove={this.remove.bind(this)}
                  onAddMore={this.beforeUpload.bind(this)}
                  uploading={uploading}
                  />
              </Form.Item>
              )}
              <div className="post-option-btns">
              {['video', 'photo'].includes(feed?.type || type) && [
                  <Upload
                  key="upload_thumb1"
                  customRequest={() => true}
                  accept={'image/*'}
                  beforeUpload={this.beforeUploadThumbnail.bind(this)}
                  multiple={false}
                  showUploadList={false}
                  disabled={uploading}
                  listType="picture"
                  style={{ width: '100%' }}
                  >
                  <Button className="new-post-thumbnail-btn" style={{ color: '#000' }}>
                      <PictureOutlined />
                      {' '}
                      Add thumbnail
                  </Button>
                  </Upload>
              ]}
              </div>
              <Form.Item
              name="title"
              rules={[{ required: true, message: 'Please input title!' }]}
              label="Title"
              >
                  <Input style={{backgroundColor: '#161616'}} />
              </Form.Item>
              <Form.Item
              name="description"
              label="Description"
              >
                  <Input.TextArea style={{backgroundColor: '#161616'}} rows={3} />
              </Form.Item>
          </div>

          <Form.Item
              name="location"
              rules={[{ required: true, message: 'Please input location!' }]}
              label="Location"
          >
              <Input style={{backgroundColor: '#161616'}} />
          </Form.Item>
          <Form.Item
              name="eventDate"
              rules={[{ required: true, message: 'Please input event date!' }]}
              label="Event Date"
          >
              <Input style={{backgroundColor: '#161616'}} />
          </Form.Item>
          <Form.Item
              name="eventTime"
              rules={[{ required: true, message: 'Please input event time!' }]}
              label="Event Time"
          >
              <Input style={{backgroundColor: '#161616'}} />
          </Form.Item>
          <Form.Item
            name="totalSupply"
            rules={[{ required: true, message: 'Please input the total supply' }]}
            label="Total Supply"
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item
            name="price"
            rules={[{ required: true, message: 'Please input the price' }]}
            label="Price"
          >
            <InputNumber className="currencyInput" min={1} />
          </Form.Item>

            <div className="tipping-rs-wrapper">
              <p className="new-post-subheading">Share tip royalties?</p>
              <p className="new-post-info">Add your content collaborators and their royalty cut for the tips your post recieves</p>
              <Form.Item name="shareTip">
                <Switch
                  className="switch"
                  checkedChildren="Yes"
                  unCheckedChildren="Not today"
                  checked={shareTip}
                  onChange={(val) => this.changeShareTipPreference(val)}
                />
              </Form.Item>
              {shareTip && (
                <>
                  <Form.Item name="feedParticipants">

                      <Select
                        mode="multiple"
                        style={{ width: '100%', backgroundColor: 'transparent', border: 'none' }}
                        showSearch
                        placeholder="Search performers here"
                        optionFilterProp="children"
                        onSearch={this.getPerformers.bind(this)}
                        loading={uploading}
                        onChange={(e) => {
                          this.pushFeaturedArtists(e);
                        }}
                        defaultValue={feed?.feedParticipants || []}
                      >
                        {performers
                        && performers.length > 0
                        && performers.map((p) => (
                          <Option key={p._id} value={p._id}>
                            <Avatar src={p?.avatar || '/static/no-avatar.png'} />
                            {' '}
                            {' '}
                            {p?.name || p?.username || 'N/A'}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <div style={{ marginTop: '1rem' }}>

                      <Form.Item label="Royalty sharing">
                        <Table
                          dataSource={dataSource}
                          columns={this.columns}
                          className="table royalty-table"
                          rowKey="_id"
                          showSorterTooltip={false}
                        />
                      </Form.Item>
                    </div>
                  </>
                )}
              </div>
            <Row>
              {thumbnail && (
                <Col md={8} xs={12}>
                  <Form.Item label="Thumbnail">
                    <div style={{ position: 'relative' }}>
                      <Button type="primary" onClick={() => this.handleDeleteFile('thumbnail')} style={{ position: 'absolute', top: 2, left: 2 }}><DeleteOutlined /></Button>
                      <ImageComp alt="thumbnail" src={thumbnail?.url} width="150px" />
                    </div>
                  </Form.Item>
                </Col>
              )}
            </Row>
            <div className="submit-btns-wrapper">
              <div className="submit-btns">
                <div className="submit-content-wrapper">
                  <Button
                    className="new-post-options-btn"
                    htmlType="submit"
                    loading={uploading}
                    disabled={uploading}
                    style={{ marginRight: 10 }}
                  >
                    <PlusIcon />
                    {' '}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Form>
          <Modal
            width={767}
            footer={null}
            onOk={() => this.setState({ isShowPreviewTeaser: false })}
            onCancel={() => this.setState({ isShowPreviewTeaser: false })}
            open={isShowPreviewTeaser}
            destroyOnClose
          >
            <VideoPlayer
              {...{
                autoplay: true,
                controls: true,
                playsinline: true,
                fluid: true,
                sources: [
                  {
                    src: teaser?.url,
                    type: 'video/mp4'
                  }
                ]
              }}
            />
          </Modal>
        </div>
      </div>
    );
  }
}

CreateTicketNftForm.defaultProps = {
  type: '',
  discard: () => {},
  feed: {} as IFeed
} as Partial<IProps>;

const mapStates = (state: any) => ({
  settings: { ...state.settings }
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(CreateTicketNftForm);
