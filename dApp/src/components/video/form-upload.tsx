/* eslint-disable no-await-in-loop */
import {
  CameraOutlined, DeleteOutlined, FileDoneOutlined, VideoCameraAddOutlined
} from '@ant-design/icons';
import Router from 'next/router';
import { VideoPlayer } from '@components/common';
import { DatePicker } from '@components/common/datePicker';
import { performerService, videoService } from '@services/index';
import {
  Avatar,
  Button,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Progress,
  Radio,
  Row,
  Select,
  Switch,
  Table,
  Tooltip,
  Upload,
  message
} from 'antd';
import { debounce } from 'lodash';
import moment from 'moment';
import { PureComponent } from 'react';
import { IPerformer, IVideo } from 'src/interfaces/index';
import styles from './video.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PICK_GENRES } from 'src/constants';
import {BsCheckCircleFill} from 'react-icons/bs';
import { faXmark, faBullhorn, faImage, faVideo, faSquarePollHorizontal, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
interface IProps {
  user: IPerformer;
  video?: IVideo;
  submit: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
  settings: any;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { Option } = Select;

const validateMessages = {
  required: 'This field is required!'
};

export class FormUploadVideo extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    previewThumbnail: null,
    previewTeaser: null,
    previewVideo: null,
    selectedThumbnail: null,
    selectedVideo: null,
    trackType: 'video',
    selectedTeaser: null,
    isSale: 'pay',
    isCrypto: false,
    isSchedule: false,
    scheduledAt: moment(),
    performers: [],
    participants: [],
    isShowPreview: false,
    previewUrl: '',
    previewType: '',
    removedTeaser: false,
    removedThumbnail: false,
    stage: 0,
    featuring: [],
    royaltyCut: [],
    uploadToIC: false,
    active: true,
    openConnectModal: false,
    walletOption: null,
    header: 'Upload',
    limitSupply: false,
    supply: 0,
    selectedCurrency: 'USD'
  };

  changeTrackType(val: any) {
    this.setState({ trackType: val });
  }

  componentDidMount() {
    const { video, user } = this.props;
    const {selectedThumbnail} = this.state;
    if (video && Object.keys(video).length) {
      video?.thumbnail && this.setState({selectedThumbnail: video?.thumbnail})
      video?.video && this.setState({selectedVideo: video?.video})
      this.setState({
        previewThumbnail: video?.thumbnail,
        previewVideo: video?.video,
        trackType: video?.trackType,
        previewTeaser: video?.teaser,
        isSale: video.isSale,
        isSchedule: video.isSchedule,
        scheduledAt: video.scheduledAt ? moment(video.scheduledAt) : moment(),
        limitSupply: video?.limitSupply,
        supply: video?.supply,
        active: video?.status === 'active'
      });
    }
    this.pushFeaturedArtists([user._id]);
    this.getPerformers('', video?.participantIds || [user._id]);
  }

  async handleRemovefile(type: string) {
    if (!window.confirm('Confirm to remove file!')) return;
    const { video } = this.props;
    try {
      await videoService.deleteFile(video._id, type);
      type === 'teaser' && this.setState({ removedTeaser: true });
      type === 'thumbnail' && this.setState({ removedThumbnail: true });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

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
      this.setState({ performers });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
    }
  }, 500);

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

  previewModal = () => {
    const { isShowPreview, previewUrl, previewType } = this.state;
    return (
      <Modal
        width={767}
        footer={null}
        onOk={() => this.setState({ isShowPreview: false })}
        onCancel={() => this.setState({ isShowPreview: false })}
        open={isShowPreview}
        destroyOnClose
      >
        {['teaser', 'video'].includes(previewType) && (
          <VideoPlayer
            {...{
              autoplay: true,
              controls: true,
              playsinline: true,
              fluid: true,
              sources: [
                {
                  src: previewUrl,
                  type: 'video/mp4'
                }
              ]
            }}
          />
        )}
        {previewType === 'thumbnail' && (
          <Image src={previewUrl} alt="thumbnail" width="100%" style={{ borderRadius: 5 }} />
        )}
      </Modal>
    );
  };

  changeUploadToIC = (option: boolean) => {
    const { user } = this.props;
    if (!user?.wallet_icp) {
      message.info('You must connect your wallet id to TRAX in order to make use of web3 features.');
    }
    this.setState({ uploadToIC: option });
  };

  beforeUpload(file: File, field: string) {
    const { beforeUpload: beforeUploadHandler } = this.props;
    if (field === 'thumbnail') {
      const isValid = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE as any || 100);
      if (!isValid) {
        message.error(`File is too large please provide an file ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 100}MB or below`);
        return isValid;
      }


      this.setState({ selectedThumbnail: file, previewThumbnail: file });
    }
    if (field === 'teaser') {
      const isValid = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_TEASER as any || 50000);
      if (!isValid) {
        message.error(
          `File is too large please provide an file ${process.env.NEXT_PUBLIC_MAX_SIZE_TEASER || 50000}MB or below`
        );
        return isValid;
      }
      this.setState({ selectedTeaser: file });
    }
    if (field === 'video') {
      const isValid = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_VIDEO as any || 50000);
      if (!isValid) {
        message.error(
          `File is too large please provide an file ${process.env.NEXT_PUBLIC_MAX_SIZE_VIDEO || 50000}MB or below`
        );
        return isValid;
      }
      this.setState({ selectedVideo: file, previewVideo: file });
    }

    return beforeUploadHandler(file, field);
  }

  updatePercentages(performerId, walletId, e) {
    const { royaltyCut } = this.state;
    const currentState = [...royaltyCut];
    if (currentState.length > 0) {
      for (let i = 0; i < currentState.length; i += 1) {
        if (currentState[i].wallet_id === walletId) {
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

  changeCryptoPaymentPreference(val: string){
    this.setState({isCrypto: val === 'enable' ? true : false});
  }


  handleLimitSupply(val){
    const {isSale} = this.state;

    this.setState({limitSupply: val})
    if(val && isSale !== 'pay' ){
      message.info("Only pay-per-access content can have a limited supply. Please enter the price at which you want to sell the content. ", 10)
      this.setState({isSale: 'pay', stage: 4})
    }
  }

  handleChangeAccess(val: string){
    const { limitSupply } = this.state;
    this.setState({isSale: val});
    if(val !== 'pay' && limitSupply){
      this.setState({limitSupply: false});
    }
  }

  changeTicker(ticker: string){
    if(ticker === 'ICP' || ticker === 'TRAX' || ticker === 'ckBTC'){
      this.setState({isCrypto: true})
    }else{
      this.setState({isCrypto: false})
    }
    this.setState({selectedCurrency: ticker})
  }

  checkPercentages() {
    const { user } = this.props;
    if(!user.wallet_icp){
      this.setState({openConnectModal: true})
    }
    let total = 0;
    const { royaltyCut, isSale, isCrypto } = this.state;
    const state = [...royaltyCut];

    for (let i = 0; i < state.length; i += 1) {
      total += state[i].percentage;
    }

    if (isSale !== 'pay' || !isCrypto) {
      this.setState({ stage: 4 });
    } else {
      total !== 100 ? message.error('Total percentage must be equal to 100%') : this.setState({ stage: 4 });
    }
  }

  columns = [
    {
      title: 'Collaborator',
      key: 'Name',
      render: (performers) => (
        <div>
          <Avatar src={performers.avatar || '/static/no-avatar.png'} />
          {' '}
          {performers.name || performers?.username || 'N/A'}
        </div>
      )
    },
    {
      title: 'Percentage split',
      key: 'percentageCut',
      render: (performers) => (
        <div
          style={{
            width: 150,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          <Form.Item style={{ width: '50%' }} name="percentageCut">
            <InputNumber
              id={performers._id}
              defaultValue={0}
              onChange={(e) => this.updatePercentages(performers._id, performers.wallet_icp, e)}
              style={{ width: '100%' }}
              min={1}
              max={100}
            />
            {' '}
            %
          </Form.Item>
        </div>
      )
    }
  ];

  render() {
    const {
      video, submit, uploading, uploadPercentage, user
    } = this.props;
    const {
      previewThumbnail,
      previewTeaser,
      previewVideo,
      trackType,
      performers,
      isSale,
      isCrypto,
      isSchedule,
      scheduledAt,
      selectedThumbnail,
      selectedTeaser,
      selectedVideo,
      removedTeaser,
      removedThumbnail,
      stage,
      featuring,
      royaltyCut,
      uploadToIC,
      active,
      previewUrl,
      openConnectModal,
      limitSupply,
      walletOption,
      supply,
      selectedCurrency
    } = this.state;

    const dataSource = featuring.map((p) => ({ ...p, key: p._id }));

    return (
      <div className={styles.componentVideoModule}>
        <div className="content-progress-bar">
          <div style={{borderTopLeftRadius: 10, borderBottomLeftRadius: 10}} className={`${stage >= 0 ? 'active' : ''}`} />
          <div className={`${stage >= 1 ? 'active' : ''}`} />
          <div className={`${stage >= 2 ? 'active' : ''}`} />
          <div className={`${stage >= 3 ? 'active' : ''}`} />
          <div className={`${stage >= 4 ? 'active' : ''}`} />
          <div style={{borderTopRightRadius: 10, borderBottomRightRadius: 10}} className={`${stage >= 5 ? 'active' : ''}`} />
        </div>
        <Form
          {...layout}
          onFinish={(values) => {
            const data = values;
            if (isSchedule) {
              data.scheduledAt = scheduledAt;
            }
            if (values.tags && values.tags.length) {
              data.tags = values.tags.map((tag) => tag.replace(/[^a-zA-Z0-9 ]/g, '_'));
            }

            data.isCrypto = isCrypto;
            data.limitSupply = limitSupply;
            !limitSupply ? data.supply = 0 : data.supply = supply;
            data.isSale = isSale;
            data.walletOption = walletOption;
            data.trackType = trackType;
            data.royaltyCut = royaltyCut;
            data.uploadToIC = uploadToIC;
            data.selectedCurrency = selectedCurrency;



            if(!data.participantIds){
              data.participantIds = [user._id];
            }
            if(isSale !== 'pay' && limitSupply){
              message.error("You cannot release a limited number of free or subscriber only songs. They must be pay-per-access.")
            }else{
              submit(data);
            }

          }}
          onFinishFailed={() => message.error('Please complete the required fields')}
          name="form-upload"
          validateMessages={validateMessages}
          initialValues={
            video || {
              title: '',
              description: '',
              price: 0,
              tags: [],
              isSale: 'pay',
              isCrypto: false,
              limitSupply: false,
              supply: 0,
              participantIds: [user._id],
              isSchedule: false,
              active: true,
              trackType: 'video',
              royaltyCut: []
            }
          }
          scrollToFirstError
          className="feed-form"
          style={{ width: '100%' }}
        >
            <Row style={{ display: `${stage === 0 ? 'contents' : 'none'}` }}>
              <div className='form-top-wrapper'>
                <div style={{width: '15%'}}>
                  <Button
                    className="new-post-delete-btn"
                    onClick={() => Router.back()}
                    style={{ backgroundColor: 'transparent', border: 'none' }}
                    disabled={uploading}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </Button>
                  </div>
                  <h1 className='upload-header'>Upload {trackType === 'audio' ? "music " : "a video" }</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading || !previewVideo || !selectedVideo}
                      style={{ marginRight: 10 }}
                      onClick={() => this.setState({ stage: 1 })}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              <div className='form-access-wrapper' style={{width: '100%'}}>
                <div className='form-type-wrapper'>
                  <Form.Item name="trackType" >
                    <div style={{display: 'flex', justifyContent: 'space-around', flexDirection: 'row', width: '100%'}}>
                      <div className={`feed-type-option-wrapper ${trackType === 'audio' && 'selected'}`} onClick={(val) => this.setState({trackType: 'audio'})}>
                        <FontAwesomeIcon icon={faImage} />
                        <span>Audio</span>
                      </div>
                      <div className={`feed-type-option-wrapper ${trackType === 'video' && 'selected'}`} onClick={(val) => this.setState({trackType: 'video'})}>
                        <FontAwesomeIcon icon={faVideo} />
                        <span>Video</span>
                      </div>
                    </div>
                  </Form.Item>
                </div>
              </div>
              {this.props.settings.icEnableIcStorage === 'true' && (
                <div className='form-middle-wrapper'>
                <div className='form-option-wrapper' style={{marginTop: -4}}>
                  <div>
                    <p className="create-post-subheading">Store on-chain?</p>
                    <p className="create-post-info">
                      Upload this post to the Internet Computer
                    </p>
                  </div>
                  <Form.Item name="upload-option">
                    <Switch
                      checkedChildren=""
                      unCheckedChildren=""
                      disabled={!user?.wallet_icp}
                      checked={uploadToIC}
                      style={{marginTop: '0.5rem'}}
                      onChange={(val) => this.changeUploadToIC(val)}
                      className={`${uploadToIC ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                    />
                  </Form.Item>
                </div>
                </div>
              )}
              <div style={{marginTop: '4rem'}}>
                <div className='form-upload-wrapper'>
                <Form.Item
                  className="upload-bl-track-form"
                  style={{padding: '10px 25px', margin: '10px 20px', borderRadius: '9px !important'}}
                  help={
                    (previewVideo && (
                      <a
                        aria-hidden
                        onClick={() => this.setState({
                          isShowPreview: true,
                          previewUrl: previewVideo?.url,
                          previewType: trackType
                        })}
                      >
                        {previewVideo?.name || 'Click here to preview'}
                      </a>
                    ))
                    || (selectedVideo && <a className='uploaded-badge'> <FontAwesomeIcon width={20} icon={faCircleCheck} /> Upload complete</a>)
                  }
                >
                  <div>
                  <Upload
                    customRequest={() => false}
                    listType="picture-card"
                    className="avatar-uploader"
                    accept={trackType === 'video' ? 'video/*' : 'audio/*'}
                    multiple={false}
                    showUploadList={false}
                    disabled={uploading}
                    beforeUpload={(file) => this.beforeUpload(file, 'video')}

                  >
                    <div >
                    {trackType === 'audio' ?
                      <img src="/static/add-song.png" className='upload-photos-img' width={70} style={{width: '70px'}}/>
                      : trackType === 'video' ?
                      <img src="/static/add-video.png" className='upload-video-img' width={70} style={{width: '70px'}}/>
                      : 'files'}

                        {' '}
                        <span className='span-upload-msg'>Upload {trackType === 'audio' ? 'audio' : trackType === 'video' ? 'a video' : 'files'}</span>
                        <br />
                        <span className='span-upload-sub-msg'> {trackType === 'audio' ? 'File should be 1GB or less' : trackType === 'video' ? 'Video file should be 50GB or less' : ''}</span>
                        {' '}
                        {previewVideo &&
                            <div className='uploaded-tag' >
                              <BsCheckCircleFill/>
                              <span>Uploaded</span>
                            </div>
                          }
                    </div>
                  </Upload>
                  </div>
                </Form.Item>
                </div>
              </div>
            </Row>
                  <div style={{ display: `${stage === 1 ? 'contents' : 'none'}` }}>
                  <div className='form-top-wrapper'>
                    <div className="new-post-create-btn-wrapper">
                        <Button
                          className="new-post-create-btn"
                          loading={uploading}
                          disabled={uploading}
                          style={{ marginRight: 10, marginTop: 3 }}
                          onClick={() => this.setState({ stage: 0 })}
                        >
                          Back
                        </Button>
                      </div>
                      <h1 className='upload-header'>Upload {trackType === 'audio' ? "music " : "a video" }</h1>
                      <div className="new-post-create-btn-wrapper">
                        <Button
                          className="new-post-create-btn"
                          loading={uploading}
                          disabled={uploading || !previewThumbnail || !selectedThumbnail}
                          style={{ marginRight: 10, marginTop: 3 }}
                          onClick={() => this.setState({ stage: 2 })}
                        >
                          Continue
                        </Button>
                      </div>
                  </div>
                  <div className='form-middle-wrapper' style={{padding: '10px 1rem', borderBottom: 'none'}}>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <Form.Item
                    className="upload-bl-track-form"

                    help={
                      (previewThumbnail && !removedThumbnail && (
                        <a
                          aria-hidden
                          className='uploaded-badge'
                          // style={{marginTop: 10}}
                          onClick={() => this.setState({
                            isShowPreview: true,
                            previewUrl: previewThumbnail?.url,
                            previewType: 'thumbnail'
                          })}
                        >
                          {/* {previewThumbnail?.name || 'Click here to preview'} */}
                          <FontAwesomeIcon width={20} icon={faCircleCheck} /> Upload complete
                        </a>
                      ))
                      || (selectedThumbnail && <a className='uploaded-badge'> <FontAwesomeIcon width={20} icon={faCircleCheck} /> Upload complete</a>)

                    }
                  >
                    <Upload
                      listType="picture-card"
                      className="avatar-uploader"
                      accept="image/*"
                      multiple={false}
                      showUploadList={false}
                      disabled={uploading}
                      beforeUpload={(file) => this.beforeUpload(file, 'thumbnail')}
                    >
                      <div>
                        <img src="/static/add-photo.png" className='upload-photos-img' width={50} style={{width: '70px'}}/>
                        <span className='span-upload-msg'>Upload a thumbnail</span>
                        <br />
                        <span className='span-upload-sub-msg'>Image should be 5MB or less</span>
                        {/* {previewThumbnail &&
                            <div className='uploaded-tag' >
                              <BsCheckCircleFill/>
                              <span>Uploaded</span>
                            </div>
                          } */}
                      </div>
                    </Upload>

                  </Form.Item>
                  </div>
                  </div>
                  </div>
                  <div style={{ display: `${stage === 2 ? 'contents' : 'none'}` }}>
                  <div className='form-top-wrapper'>
                    <div className="new-post-create-btn-wrapper">
                        <Button
                          className="new-post-create-btn"
                          loading={uploading}
                          disabled={uploading}
                          style={{ marginRight: 10, marginTop: 3 }}
                          onClick={() => this.setState({ stage: 1 })}
                        >
                          Back
                        </Button>
                      </div>
                      <h1 className='upload-header'>Upload {trackType === 'audio' ? "music " : "a video" }</h1>
                      <div className="new-post-create-btn-wrapper">
                        <Button
                          className="new-post-create-btn"
                          loading={uploading}
                          disabled={uploading}
                          style={{ marginRight: 10, marginTop: 3 }}
                          onClick={() => this.setState({ stage: 3 })}
                        >
                          {selectedTeaser ? 'Continue' : 'Skip'}
                        </Button>
                      </div>
                  </div>
                  <div className='form-middle-wrapper' style={{padding: '10px 1rem', borderBottom: 'none'}}>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <Form.Item
                    className="upload-bl-track-form"
                    help={
                      (previewTeaser && !removedTeaser && (
                        <a
                          aria-hidden
                          onClick={() => this.setState({
                            isShowPreview: true,
                            previewUrl: previewTeaser?.url,
                            previewType: 'teaser'
                          })}
                        >
                          {previewTeaser?.name || 'Click here to preview'}
                        </a>
                      ))
                      || (selectedTeaser && <a className='uploaded-badge'> <FontAwesomeIcon width={20} icon={faCircleCheck} /> Upload complete</a>)
                    }
                  >
                    <Upload
                      customRequest={() => false}
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={trackType === 'video' ? 'video/*' : 'audio/*'}
                      multiple={false}
                      showUploadList={false}
                      disabled={uploading}
                      beforeUpload={(file) => this.beforeUpload(file, 'teaser')}
                    >
                      <div>
                        <img src="/static/add-video.png" className='upload-photos-img' width={50} style={{width: '70px'}}/>
                        <span className='span-upload-msg'>Upload a trailer</span>
                        <br />
                        <span className='span-upload-sub-msg'>Video should be 200MB or less</span>
                        {previewTeaser &&
                            <div className='uploaded-tag' >
                              <BsCheckCircleFill/>
                              <span>Uploaded</span>
                            </div>
                          }
                      </div>
                    </Upload>

                  </Form.Item>
                  </div>
                  </div>
                  </div>


                  <div style={{ display: `${stage === 3 ? 'contents' : 'none'}` }}>
            <div className='form-top-wrapper'>
              <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"

                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 2 })}
                    >
                      Back
                    </Button>
                  </div>
                  <h1 className='upload-header'>Upload {trackType === 'audio' ? "music " : "a video" }</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 4 })}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              <div className='form-middle-wrapper' style={{borderBottom: 'none'}}>
              <div className='upload-track-text-wrapper'>
                <p className="create-post-subheading">Title</p>
                <p className="create-post-info">
                    Add the name of the track
                </p>
                <Form.Item style={{ width: '100%', margin: 0 }} name="title" rules={[{ required: true, message: 'Please input title of the track.' }]}>
                  <Input style={{ width: '100%', marginLeft: '0.1rem' }}/>
                </Form.Item>
                </div>
                <div className='upload-track-text-wrapper'>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                    <p className="create-post-subheading">Description</p>
                    <p className="create-post-info">
                        Give your listeners more info about on the track
                    </p>
                    <Form.Item style={{ width: '100%', margin: 0 }} name="description" label="">
                      <Input.TextArea style={{ width: '100%', marginLeft: '0.1rem' }} rows={3} />
                    </Form.Item>
                    </div>
                </div>
                <div className='upload-track-text-wrapper'>
                <div className='form-access-wrapper' style={{ marginTop: '0.5rem' }}>
              <p className="create-post-subheading">Tags</p>
                        <p className="create-post-info">Add hashtags for better discoverability</p>
                <Form.Item name="tags">
                  <Select
                    className='upload-select'
                    mode="multiple"
                    style={{ width: '100%', marginLeft: '0.1rem'}}
                    size="middle"
                    showArrow={false}
                    defaultValue={video?.tags || []}
                  >
                    {PICK_GENRES.map((genre) => (
                      <Select.Option key={genre.value} value={genre.value}>
                        {genre.text}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              </div>
              </div>
              </div>
            <div style={{ display: `${stage === 4 ? 'contents' : 'none'}` }}>
            <div className='form-top-wrapper'>
              <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"

                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 3 })}
                    >
                      Back
                    </Button>
                  </div>
                  <h1 className='upload-header'>Upload {trackType === 'audio' ? "music " : "a video" }</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 5 })}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              <div className='form-middle-wrapper' style={{borderBottom: 'none'}}>
              <div className='form-access-wrapper' style={{width: '100%'}}>
              <p className="create-post-subheading">Access</p>
                <p className="create-post-info">
                 Select who can view this post
                </p>
              <Form.Item>
                <Select
                  defaultValue="pay"
                  style={{ width: '70%' }}
                  onChange={(val) => this.handleChangeAccess(val)}
                  className='track-type-form'
                  value={isSale}
                >
                  <Select.Option value="free">Free for everyone</Select.Option>
                  <Select.Option value="subscription">Members only</Select.Option>
                  <Select.Option value="pay">Pay-to-access</Select.Option>
                </Select>
              </Form.Item>
              </div>
                  {isSale === 'pay' && (
                    <div>
                      <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem'}}>
                      <p className="create-post-subheading">Select currency</p>
                        <p className="create-post-info">
                         Select the currency you wish to recieve payment in
                        </p>
                      <Form.Item style={{ width: '100%'}} name="selectedCurrency" label="">
                      <div className='currency-picker-btns-container' style={{marginTop: '1rem'}}>
                        <div className='currency-picker-btns-wrapper'>
                          <div className='currency-picker-btn-wrapper' onClick={(v)=> this.changeTicker('USD')}>
                            <img src='/static/usd-logo.png' width={40} height={40} style={{border: selectedCurrency === 'USD' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                          </div>
                          {(user.wallet_icp) && (
                            <>
                              <div className='currency-picker-btn-wrapper' onClick={()=> this.changeTicker('ICP')}>
                                <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                              </div>
                              <div className='currency-picker-btn-wrapper' onClick={()=> this.changeTicker('ckBTC')}>
                                <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                              </div>
                              <div className='currency-picker-btn-wrapper' onClick={()=> this.changeTicker('TRAX')}>
                                <img src='/static/trax-token.png' width={40} height={40} style={{border: selectedCurrency === 'TRAX' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      </Form.Item>
                      </div>

                      <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem'}}>
                      <p className="create-post-subheading">Price</p>
                        <p className="create-post-info">
                         Input the price of this piece of content (USD)
                        </p>
                      <Form.Item style={{ width: '100%'}} name="price" label="" rules={[{ required: true, message: 'Please add the price' }]}>
                        <InputNumber
                          type="number"
                          prefix="$" placeholder='0.00'
                          datatype="currency"
                          className='input-create-track'

                          min={1}
                        />
                      </Form.Item>
                      </div>
                    </div>
                  )}

                  {user?.wallet_icp && isSale === 'pay' && (
                      <div className='form-option-wrapper' style={{marginTop: '0.5rem'}}>
                        <div>
                          <p className="create-post-subheading">Earn crypto</p>
                          <p className="create-post-info">
                          Allow users to purchase your content with crypto
                          </p>
                        </div>
                      <Form.Item name="isCrypto" >
                        <Switch
                            checkedChildren=""
                            unCheckedChildren=""
                            checked={isCrypto}
                            style={{marginTop: '1rem'}}
                            onChange={(val) => this.setState({isCrypto: val})}
                            className={`${isCrypto ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                          />
                      </Form.Item>
                      </div>

                  )}


                  <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem' }}>
                  <p className="create-post-subheading">Collaborators</p>
                    <p className="create-post-info">Add other trax artists who collaborated on this content</p>
                    <Form.Item name="participantIds">
                      <Select
                      className='upload-select'
                        mode="multiple"
                        style={{ width: '100%', backgroundColor: 'transparent', border: 'none',}}
                        showSearch
                        placeholder="Search performers here"
                        optionFilterProp="children"
                        onSearch={this.getPerformers.bind(this)}
                        loading={uploading}
                        onChange={(e) => {
                          this.pushFeaturedArtists(e);
                        }}
                        defaultValue={[user._id] || []}
                      >
                        {performers
                          && performers.length > 0
                          && performers.map((p) => (
                            <Option key={p._id} value={p._id}>
                              <Avatar src={p?.avatar || '/static/no-avatar.png'} />
                              {' '}
                              {p?.name || p?.username || 'N/A'}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </div>
              {isSale === 'pay' && isCrypto && (
                <div className='form-access-wrapper' style={{ marginTop: '0.5rem' }}>
                 <p className="create-post-subheading">Royalty split</p>
                        <p className="create-post-info">
                        Distribute the revenue of this post with collaborators. Only artists with a web3 wallet connected qualify for royalty sharing, and will be displayed below.
                        </p>
                  <Form.Item>
                    <Table
                      dataSource={dataSource}
                      columns={this.columns}
                      className="table royalty-table"
                      rowKey="_id"
                      showSorterTooltip={false}
                    />
                  </Form.Item>
                </div>
              )}
          </div>
            </div>
            <div style={{ display: `${stage === 5 ? 'contents' : 'none'}` }}>
            <div className='form-top-wrapper'>
              <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 4 })}
                    >
                      Back
                    </Button>
                  </div>
                  <h1 className='upload-header'>Upload {trackType === 'audio' ? "music " : "a video" }</h1>
                  <div className="new-post-create-btn-wrapper">
                    {isSale === 'pay' && isCrypto && !walletOption && (
                      <Button
                      className="new-post-create-btn"
                      // htmlType="submit"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={()=> this.checkPercentages()}
                    >
                      Continue
                    </Button>
                    )}
                    { !isCrypto && (
                      <Button
                      className="new-post-create-btn"
                      htmlType="submit"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      >
                        Upload
                      </Button>
                    )}


                    {isSale === 'pay' && isCrypto && walletOption && (
                      <Button
                        className="new-post-create-btn"
                        htmlType="submit"
                        loading={uploading}
                        disabled={uploading}
                        style={{ marginRight: 10, marginTop: 3 }}
                      >
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
                <div className='form-middle-wrapper' style={{borderBottom: 'none'}}>
              <div className='form-option-wrapper' style={{ marginTop: '0.5rem' }}>
                <div className='w-full'>
                <p className="create-post-subheading">Active</p>
                      <p className="create-post-info">
                       Set whether this post is visible or not
                      </p>
                </div>
                <Form.Item name="status">
                    <Switch
                      checkedChildren=""
                      unCheckedChildren=""
                      checked={active}
                      style={{marginTop: '1rem'}}
                      onChange={(val) => this.setState({active: val})}
                      className={`${active ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                    />
                </Form.Item>
                </div>
                    <div className='form-option-wrapper' style={{marginTop: '0.5rem'}}>
                        <div className='w-full'>
                          <p className="create-post-subheading">Limit the supply</p>
                          <p className="create-post-info">
                            Only release a limited number of music for more exlusive content.
                          </p>
                        </div>
                      <Form.Item name="limitSupply" >
                        <Switch
                            value={limitSupply}
                            checkedChildren=""
                            unCheckedChildren=""
                            checked={limitSupply}
                            style={{marginTop: '1rem'}}
                            onChange={(val) => this.handleLimitSupply(val)}
                            className={`${limitSupply ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                          />
                      </Form.Item>
                    </div>

                    {limitSupply && (
                     <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem'}}>
                     <p className="create-post-subheading">Supply</p>
                       <p className="create-post-info">
                        Input the total supply for this content.
                       </p>
                     <Form.Item style={{ width: '100%'}} name="supply" label="" rules={[{ required: true, message: 'Please add the price' }]}>
                       <InputNumber
                       value={supply}
                         type="number"
                         placeholder='0'
                         datatype="number"
                         className='input-create-track'
                         onChange={(e)=>this.setState({supply: e})}
                         min={1}
                       />
                     </Form.Item>
                     </div>
                )}


              <div className='form-option-wrapper' style={{ marginTop: '0.5rem' }}>
                <div className='w-full'>
                  <p className="create-post-subheading">Schedule</p>
                  <p className="create-post-info">
                   Set the date you want this post to be released
                  </p>
                </div>
                <Form.Item name="isSchedule">
                      <Switch
                      checkedChildren=""
                      unCheckedChildren=""
                      checked={isSchedule}
                      style={{marginTop: '1rem'}}
                      onChange={(val) => this.setState({isSchedule: val})}
                      className={`${isSchedule ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                    />
                </Form.Item>
                </div>
                {isSchedule && (
                  <div className='form-access-wrapper' style={{ marginTop: '0.5rem' }}>
                  <p className="create-post-subheading">Scheduled for</p>
                  <Form.Item>
                    <DatePicker
                      style={{ width: '100%', background: '#141414' }}
                      disabledDate={(currentDate) => currentDate && currentDate < moment().endOf('day')}
                      defaultValue={scheduledAt}
                      onChange={(val) => this.setState({ scheduledAt: val })}
                      className='upload-date-picker'
                    />
                  </Form.Item>
                  </div>
                )}
              </div>
            </div>
          {uploadPercentage ? <Progress percent={Math.round(uploadPercentage)} /> : null}
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }} />
          {this.previewModal()}
          <Modal
            className='selected-wallet-upload-modal'
            style={{backgroundColor: '#000000 !important'}}
            key="purchase_post"
            title={null}
            open={openConnectModal}
            footer={null}
            width={420}
            destroyOnClose
            onCancel={() => this.setState({openConnectModal: false})}
          >
            <div className='selected-wallet-upload-container'>
              <div className='selected-wallet-upload'>
                  <span style={{fontSize: '23px', fontWeight: '600', color: 'white'}}>Connect</span>
                  <span style={{ fontSize: '14px', color: 'grey'}}>Select your preferred wallet and click Continue</span>
              </div>
              <div className='connect-wallets-wrapper'>

                    <div className='wallet-wrapper' onClick={()=> this.setState({walletOption: 'plug'})}>
                      <img src="/static/plug-favicon.png" alt="" className='plug-icon-sign'/>
                      <span>Plug Wallet</span>
                      {walletOption === 'plug' && (
                        <FontAwesomeIcon width={25} height={25} icon={faCircleCheck} className="tick-icon-wallet"/>
                      )}
                    </div>
                    <div className='wallet-wrapper' onClick={()=> this.setState({walletOption: 'ii'})}>
                      <img src="/static/icp-logo.png" alt="" className='icp-icon-sign'/>
                      <span>Internet Identity</span>
                      {walletOption === 'ii' && (
                        <FontAwesomeIcon width={25} height={25} icon={faCircleCheck} className="tick-icon-wallet"/>
                      )}
                    </div>
              </div>
              <div>
              <Button
                className="upload-with-wallet-btn"
                loading={uploading}
                disabled={uploading}
                onClick={()=> this.setState({openConnectModal: false})}
              >
                Continue
              </Button>
              </div>

            </div>
          </Modal>
        </Form>

      </div>
    );
  }
}

FormUploadVideo.defaultProps = {
  video: {} as IVideo,
  beforeUpload: () => {},
  uploading: false,
  uploadPercentage: 0
} as Partial<IProps>;
