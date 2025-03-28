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
import ImgCrop from 'antd-img-crop';
import { debounce } from 'lodash';
import moment from 'moment';
import { PureComponent } from 'react';
import { IPerformer, IVideo } from 'src/interfaces/index';
import styles from './video.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PICK_GENRES } from 'src/constants';
import {BsCheckCircleFill} from 'react-icons/bs';
import { faXmark, faBullhorn, faImage, faVideo, faSquarePollHorizontal, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { Capacitor } from '@capacitor/core';


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
    previewThumbnailMobile: null,
    previewTeaser: null,
    previewVideo: null,
    selectedThumbnail: null,
    selectedThumbnailMobile: null,
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
    removedThumbnailMobile: false,
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
    selectedCurrency: 'USD',
    filter: {sortBy: 'latest'} as any
  };

  changeTrackType(val: any) {
    this.setState({ trackType: val });
  }

  async componentDidMount() {
    const { video, user } = this.props;
    let {selectedThumbnail, featuring} = this.state;
    if (video && Object.keys(video).length) {
      video?.thumbnail && this.setState({selectedThumbnail: video?.thumbnail})
      video?.video && this.setState({selectedVideo: video?.video});
      video.royaltyCut = video?.royaltyCut && typeof video?.royaltyCut === 'string' ? JSON.parse(video.royaltyCut) : video.royaltyCut;

      if (video?.royaltyCut) {
        for (let i = 0; i < video?.royaltyCut.length; i += 1) {
          //console.log(video?.royaltyCut[i])
          const resp = await performerService.findOne(video?.royaltyCut[i].performerId);
          if (resp.data._id) {
            resp.data.percentage = video?.royaltyCut[i].percentage;
            featuring.push(resp.data);
          } else {
            message.config({ duration: 6 });
            message.info('This artist cannot be found. Please try again.');
          }
        }
      } else {
        await this.pushFeaturedArtists([user._id]);
      }

      //console.log("featuring", featuring);
      //console.log("video", video);
      this.setState({
        previewThumbnail: video?.thumbnail,
        previewThumbnailMobile: video?.thumbnailMobile,
        previewVideo: video?.video,
        trackType: video?.trackType,
        previewTeaser: video?.teaser,
        isSale: video.isSale,
        isSchedule: video.isSchedule,
        scheduledAt: video.scheduledAt ? moment(video.scheduledAt) : moment(),
        royaltyCut: video.royaltyCut || [],
        active: video?.status === 'active',
        limitSupply: video.limitSupply || false,
        supply: video.supply || 0,
        selectedCurrency: video.selectedCurrency || 'USD'
      });
    } else {
      await this.pushFeaturedArtists([user._id]);
    }

    this.getPerformers_('', video?.participantIds || [user._id]);
  }

  handleRemovefile = (field: string) => {
    const { video } = this.props;
    switch (field) {
      case 'thumbnail':
        this.setState({ removedThumbnail: true, selectedThumbnail: null, previewThumbnail: null });
        break;
      case 'thumbnailMobile':
        this.setState({ removedThumbnailMobile: true, selectedThumbnailMobile: null, previewThumbnailMobile: null });
        break;
      case 'teaser':
        this.setState({ removedTeaser: true, selectedTeaser: null });
        break;
      case 'video':
        this.setState({ selectedVideo: null, previewVideo: null });
        break;
      default:
        break;
    }
  };

  getPerformers_ = debounce(async (q, performerIds) => {
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
      const { user } = this.props;
      const result = [];
      const { royaltyCut } = this.state;
      const royaltyCutChanged = [];

      for (let i = 0; i < ids.length; i += 1) {
        const resp = await performerService.findOne(ids[i]);
        if (resp.data._id) {
          resp.data.percentage = user._id === ids[i] ? 100 : 0;
          result.push(resp.data);
          royaltyCutChanged.push({ performerId: resp.data._id, wallet_id: resp.data.account?.wallet_icp, percentage: royaltyCut.length > i ? royaltyCut[i].percentage : resp.data.percentage })
        } else {
          message.config({ duration: 6 });
          message.info('This artist cannot be found. Please try again.');
        }
      }

      this.setState({ featuring: result, royaltyCut: royaltyCutChanged });
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
    if (!user.account?.wallet_icp) {
      message.info('You must connect your wallet id to TRAX in order to make use of web3 features.');
    }
    this.setState({ uploadToIC: option });
  };

  beforeUpload(file: File, field: string) {
    const { beforeUpload: beforeUploadHandler } = this.props;
    const { trackType } = this.state;
    let trackTypeChanged = trackType;
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    if (field === 'thumbnail' || field === 'thumbnailMobile') {
      const isValid = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE as any || 100);
      if (!isValid) {
        message.error(`File is too large please provide an file ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 100}MB or below`);
        return isValid;
      }

      if (field === 'thumbnail') {
        this.setState({ selectedThumbnail: file, previewThumbnail: file });
      } else if (field === 'thumbnailMobile') {
        this.setState({ selectedThumbnailMobile: file, previewThumbnailMobile: file });
      }
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

      if (trackType === 'audio' && isVideo) {
        trackTypeChanged = 'video';
      }

      if (trackType === 'video' && isAudio) {
        trackTypeChanged = 'audio';
      }

      this.setState({ selectedVideo: file, previewVideo: file, trackType: trackTypeChanged });
    }

    return beforeUploadHandler(file, field);
  }

  updatePercentages(performerId, walletId, e) {
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


  handleLimitSupply(val){
    const {isSale} = this.state;

    this.setState({limitSupply: val})
    if(val && isSale !== 'pay' ){
      message.info("Only pay-per-access content can have a limited supply. Please enter the price at which you want to sell the content. ", 10)
      this.setState({isSale: 'pay', stage: 5})
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

  setTrackTypeState(trackType: string){
    this.setState({trackType: trackType, selectedVideo: null, previewVideo: null, selectedTeaser: null, selectedThumbnail: null, selectedThumbnailMobile: null, previewThumbnailMobile: null});
  }

  checkPercentages(setStage = true) {
    const { royaltyCut, isSale, isCrypto } = this.state;

    if (isSale !== 'pay') {
      setStage && this.setState({ stage: 6 });
      return true;
    }

    const { user } = this.props;
    let total = 0;
    const state = [...royaltyCut];

    for (let i = 0; i < state.length; i += 1) {
      total += state[i].percentage;
    }

    if (total !== 100) {
      message.error('Total percentage must be equal to 100%');
      return false;
    }
    isCrypto && this.setState({openConnectModal: true});
    setStage && this.setState({ stage: 6 });
    return true;
  }

  columns = [
    {
      title: 'Collaborator',
      key: 'Name',
      render: (performers) => (
        <div>
          <Avatar src={performers.avatar || '/static/no-avatar-dark-mode.png'} />
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
              defaultValue={performers.percentage}
              onChange={(e) => this.updatePercentages(performers._id, performers.account?.wallet_icp, e)}
              style={{ width: '100%' }}
              min={1}
              max={100}
              precision={0}
              step={1}
            />
            {' '}
            %
          </Form.Item>
        </div>
      )
    }
  ];

  handleSubmit = async (values: any) => {
    const {
      video, submit, uploading, uploadPercentage, user
    } = this.props;
    const {
      selectedThumbnail,
      selectedThumbnailMobile,
      selectedTeaser,
      selectedVideo,
      removedTeaser,
      removedThumbnail,
      removedThumbnailMobile,
      trackType,
      performers,
      isSale,
      isCrypto,
      isSchedule,
      scheduledAt,
      featuring,
      royaltyCut,
      uploadToIC,
      active,
      limitSupply,
      walletOption,
      supply,
      selectedCurrency
    } = this.state;

    const formData = {
      ...values,
      trackType,
      performers,
      isSale,
      isCrypto,
      isSchedule,
      scheduledAt,
      featuring,
      royaltyCut,
      uploadToIC,
      active,
      limitSupply,
      walletOption,
      supply,
      selectedCurrency
    };

    if (video?._id) {
      formData._id = video._id;
    }

    if (selectedThumbnail) {
      formData.thumbnail = selectedThumbnail;
    }

    if (selectedThumbnailMobile) {
      formData.thumbnailMobile = selectedThumbnailMobile;
    }

    if (selectedTeaser) {
      formData.teaser = selectedTeaser;
    }

    if (selectedVideo) {
      formData.video = selectedVideo;
    }

    if (removedTeaser) {
      formData.removedTeaser = true;
    }

    if (removedThumbnail) {
      formData.removedThumbnail = true;
    }

    if (removedThumbnailMobile) {
      formData.removedThumbnailMobile = true;
    }

    submit(formData);
  };

  render() {
    const {
      video, submit, uploading, uploadPercentage, user
    } = this.props;
    const {
      previewThumbnail,
      previewThumbnailMobile,
      selectedThumbnailMobile,
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
      removedThumbnailMobile,
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

    const imgCropPropsDesktop: any = {
      aspect: 16/9,
      cropShape: 'rect',
      quality: 1,
      modalTitle: 'Edit thumbnail image',
      modalWidth: 767,
      fillColor: 'white'
    };
    const imgCropPropsMobile: any = {
      aspect: 1/2,
      cropShape: 'rect',
      quality: 1,
      modalTitle: 'Edit thumbnail image',
      modalWidth: 767,
      fillColor: 'white'
    };

    const dataSource = featuring.map((p) => ({ ...p, key: p._id }));
    //console.log("royaltyCut u form-upload renderu", royaltyCut);


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
              message.error("Only pay-per-access content can have a limited supply")
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
                  <h1 className='upload-header'>Upload video or track</h1>
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
                      disabled={!user.account?.wallet_icp}
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
                    accept="video/*, audio/*"
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
                        <span className='span-upload-msg'>Upload</span>
                        <br />
                        <span className='span-upload-sub-msg'> File should be 50GB or less</span>
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
                      <h1 className='upload-header'>Upload</h1>
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
                    <ImgCrop modalClassName='img-crop-modal' {...imgCropPropsDesktop} className="img-crop-modal">
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
                        <span className='span-upload-msg'>Upload desktop thumbnail</span>
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
                    </ImgCrop>

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
                      <h1 className='upload-header'>Upload</h1>
                      <div className="new-post-create-btn-wrapper">
                        <Button
                          className="new-post-create-btn"
                          loading={uploading}
                          disabled={uploading || !previewThumbnailMobile || !selectedThumbnailMobile}
                          style={{ marginRight: 10, marginTop: 3 }}
                          onClick={() => this.setState({ stage: 3 })}
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
                      (previewThumbnailMobile && !removedThumbnailMobile && (
                        <a
                          aria-hidden
                          className='uploaded-badge'
                          // style={{marginTop: 10}}
                          onClick={() => this.setState({
                            isShowPreview: true,
                            previewUrl: previewThumbnailMobile?.url,
                            previewType: 'thumbnailMobile'
                          })}
                        >
                          {/* {previewThumbnail?.name || 'Click here to preview'} */}
                          <FontAwesomeIcon width={20} icon={faCircleCheck} /> Upload complete
                        </a>
                      ))
                      || (selectedThumbnailMobile && <a className='uploaded-badge'> <FontAwesomeIcon width={20} icon={faCircleCheck} /> Upload complete</a>)
                    }
                  >
                    <ImgCrop modalClassName='img-crop-modal' {...imgCropPropsMobile} className="img-crop-modal">
                    <Upload
                      listType="picture-card"
                      className="avatar-uploader"
                      accept="image/*"
                      multiple={false}
                      showUploadList={false}
                      disabled={uploading}
                      beforeUpload={(file) => this.beforeUpload(file, 'thumbnailMobile')}
                    >
                      <div>
                        <img src="/static/add-photo.png" className='upload-photos-img' width={50} style={{width: '70px'}}/>
                        <span className='span-upload-msg'>Upload mobile thumbnail</span>
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
                    </ImgCrop>

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
                      <h1 className='upload-header'>Upload</h1>
                      <div className="new-post-create-btn-wrapper">
                        <Button
                          className="new-post-create-btn"
                          loading={uploading}
                          disabled={uploading}
                          style={{ marginRight: 10, marginTop: 3 }}
                          onClick={() => this.setState({ stage: 4 })}
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
                      accept="video/*, audio/*"
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
                  <h1 className='upload-header'>Upload</h1>
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
                        <p className="create-post-info">Add genre tags for better discoverability</p>
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
                  <h1 className='upload-header'>Upload</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.checkPercentages()}
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
                      {!Capacitor.isNativePlatform() && (
                      <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem'}}>
                        <p className="create-post-subheading">
                          Select currency
                        </p>
                        <p className="create-post-info">
                         Select the currency you wish to recieve payment in
                        </p>
                        <Form.Item style={{ width: '100%'}} name="selectedCurrency" label="">
                        <div className='currency-picker-btns-container' style={{marginTop: '1rem'}}>
                          <div className='currency-picker-btns-wrapper'>
                            <div
                              className='currency-picker-btn-wrapper'
                              onClick={(v)=> {
                                this.changeTicker('USD')
                                this.setState({isCrypto: false})
                              }}
                            >
                              <img src='/static/credit.png' width={40} height={40} style={{border: selectedCurrency === 'USD' ? '1px solid #c8ff02' : '1px solid grey'}}/>
                            </div>
                            {(user.account?.wallet_icp) && (
                              <>
                                {/* <div className='currency-picker-btn-wrapper' onClick={()=> this.changeTicker('ICP')}>
                                  <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                                </div>
                                <div className='currency-picker-btn-wrapper' onClick={()=> this.changeTicker('ckBTC')}>
                                  <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
                                </div> */}
                                <div
                                  className='currency-picker-btn-wrapper'
                                  onClick={()=> {
                                    this.changeTicker('TRAX')
                                    this.setState({isCrypto: true})
                                  }}
                                >
                                  <img src='/static/logo_48x48.png' width={40} height={40} style={{border: selectedCurrency === 'TRAX' ? '1px solid #c8ff02' : '1px solid grey'}}/>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        </Form.Item>
                      </div>
                      )}
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
                
{/*
                  {user.account?.wallet_icp && isSale === 'pay' && (
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
                  )} */}


                  <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem' }}>
                  <p className="create-post-subheading">Collaborators</p>
                    <p className="create-post-info">Add other trax artists who collaborated on this content</p>
                    <Form.Item name="participantIds">
                      <Select
                      className='upload-select'
                        mode="multiple"
                        style={{ width: '100%', backgroundColor: 'transparent', border: 'none',}}
                        showSearch={true}
                        placeholder="Search performers here"
                        filterOption={false}
                        optionFilterProp="children"
                        onSearch={this.getPerformers_.bind(this)}
                        loading={uploading}
                        onChange={(e) => {
                          this.pushFeaturedArtists(e);
                        }}
                        defaultValue={[user._id]}
                        optionLabelProp="label"
                      >
                        {performers
                        && performers.length > 0
                        && performers.map((p) => (
                          <Option
                            key={p._id}
                            value={p._id}
                            label={  // Add this to define how selected values should appear
                              <div className='flex flex-row gap-[6px]'>
                                <Avatar className='flex w-[27px] h-[27px]' src={p?.avatar || '/static/no-avatar.png'} />
                                <span className='flex items-center'>{p?.name || p?.username || 'N/A'}</span>
                              </div>
                            }
                          >
                            <div className='flex flex-row gap-[6px]'>
                              <Avatar className='flex w-[27px] h-[27px]' src={p?.avatar || '/static/no-avatar.png'} />
                              <span className='flex items-center'>{p?.name || p?.username || 'N/A'}</span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
              {isSale === 'pay' && (
                <div className='form-access-wrapper' style={{ marginTop: '0.5rem' }}>
                 <p className="create-post-subheading">Royalty split</p>
                        <p className="create-post-info">
                        Distribute the revenue of this post with collaborators.
                        </p>
                  <Form.Item>
                    <Table
                      dataSource={dataSource}
                      columns={this.columns}
                      className="royalty-table"
                      rowKey="_id"
                      showSorterTooltip={false}
                    />
                  </Form.Item>
                </div>
              )}
          </div>
            </div>
            <div style={{ display: `${stage === 6 ? 'contents' : 'none'}` }}>
            <div className='form-top-wrapper'>
              <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 5 })}
                    >
                      Back
                    </Button>
                  </div>
                  <h1 className='upload-header'>Upload</h1>
                  <div className="new-post-create-btn-wrapper">
                    {(
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

            <div style={{ display: `${stage === 7 ? 'contents' : 'none'}` }}>
              <div className='form-top-wrapper'>
                <div className="new-post-create-btn-wrapper">
                        <Button
                          className="new-post-create-btn"
                          loading={uploading}
                          disabled={uploading}
                          style={{ marginRight: 10, marginTop: 3 }}
                          onClick={() => this.setState({ stage: 5 })}
                        >
                          Back
                        </Button>
                      </div>
                      <h1 className='upload-header'>Upload</h1>
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
                      accept="video/*, audio/*"
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


          {uploadPercentage ? (
            <div className='flex w-5/6 mx-auto mt-4'>
              <Progress percent={Math.round(uploadPercentage)} />
            </div>
          ) : null }

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
                  <span style={{fontSize: '23px', fontWeight: '600', color: 'white'}}>Select wallet</span>
                  <span style={{ fontSize: '14px', color: 'grey'}}>Select your preferred wallet and click Continue. Make sure it is the same one that you have connected to your account.</span>
              </div>
              <div className='connect-wallets-wrapper'>
                <div className={`wallet-wrapper ${walletOption === 'plug' && 'border border-custom-green'}`} onClick={()=> this.setState({walletOption: 'plug'})}>
                  <img src="/static/plug-favicon.png" alt="" className='plug-icon-sign'/>
                  <span>Plug Wallet</span>
                  {walletOption === 'plug' && (
                    <FontAwesomeIcon width={25} height={25} icon={faCircleCheck} className="tick-icon-wallet"/>
                  )}
                </div>
                <div className={`wallet-wrapper ${walletOption === 'II' && 'border border-custom-green'}`} onClick={()=> this.setState({walletOption: 'II'})}>
                  <img src="/static/icp-logo.png" alt="" className='icp-icon-sign'/>
                  <span>Internet Identity</span>
                  {walletOption === 'II' && (
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
                Confirm
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
