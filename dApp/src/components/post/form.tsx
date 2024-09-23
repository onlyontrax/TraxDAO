/* eslint-disable no-await-in-loop, no-nested-ternary */
import {
  Upload, message, Button, Tooltip, Select, Modal, Image, Radio,
  Input, Form, InputNumber, Progress, Popover, Row, Col, Switch, Avatar, Table
} from 'antd';
import {
  PictureOutlined, VideoCameraAddOutlined,
  PlayCircleOutlined, SmileOutlined, DeleteOutlined, OrderedListOutlined
} from '@ant-design/icons';
import { UploadList } from '@components/file/list-media';
import { IFeed, IPerformer } from 'src/interfaces';
import { performerService, feedService } from '@services/index';
import moment from 'moment';
import { formatDate } from '@lib/date';
import { Emotions } from '@components/messages/emotions';
import Router from 'next/router';
import { PureComponent } from 'react';
import { VideoPlayer } from '@components/common';
import { PlusIcon } from 'src/icons';
import { debounce } from 'lodash';
import styles from './index.module.scss';
import AddPollDurationForm from './add-poll-duration';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faBullhorn, faImage, faVideo, faSquarePollHorizontal } from '@fortawesome/free-solid-svg-icons';
const { TextArea } = Input;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};
const { Option } = Select;
interface IProps {
  discard?: Function;
  feed?: IFeed;
  performer: IPerformer;
}

export default class FeedForm extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  pollIds = [];

  thumbnailId = null;

  teaserId = null;

  state = {
    type: 'video',
    uploading: false,
    thumbnail: null,
    teaser: null,
    fileList: [],
    fileIds: [],
    pollList: [],
    addPoll: false,
    openPollDuration: false,
    expirePollTime: 7,
    expiredPollAt: moment().endOf('day').add(7, 'days'),
    text: '',
    isShowPreviewTeaser: false,
    isSale: 'subscription',
    uploadToIC: false,
    shareTip: false,
    featuring: [],
    royaltyCut: [],
    performers: [],
    active: true,
    isShowPreview: false,
    previewUrl: ''
  };

  componentDidMount() {
    const { feed, performer } = this.props;
    if (feed) {
      this.setState({
        fileList: feed.files ? feed.files : [],
        fileIds: feed.fileIds ? feed.fileIds : [],
        // eslint-disable-next-line no-nested-ternary
        isSale: feed.isSale ? feed.isSale : 'subscription',
        addPoll: !!feed.pollIds?.length,
        pollList: feed.polls,
        thumbnail: feed.thumbnail,
        teaser: feed.teaser,
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
    this.setState({shareTip: val === 'enable' ? true : false});
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

  onAddPoll = () => {
    const { addPoll } = this.state;
    this.setState({ addPoll: !addPoll });
    if (!addPoll) {
      this.pollIds = [];
      this.setState({ pollList: [] });
    }
  };

  onChangePoll = async (index, e) => {
    const { value } = e.target;
    this.setState((prevState: any) => {
      const newItems = [...prevState.pollList];
      newItems[index] = value;
      return { pollList: newItems };
    });
  };

  changeUploadToIC = (option: boolean) => {
    const { performer } = this.props;
    if (!performer?.wallet_icp) {
      message.info('You must connect your wallet id to TRAX in order to make use of web3 features.');
    }
    this.setState({ uploadToIC: option });
  };

  onsubmit = async (feed, values) => {
    const { type } = this.state;
    try {
      this.setState({ uploading: true });
      !feed || Object.keys(feed).length === 0
        ? await feedService.create({ ...values, type })
        : await feedService.update(feed._id, { ...values, type: feed.type });
      message.success('Posted successfully!');
      Router.push('/artist/studio');
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
          if (newFile.type.includes('video')) return f;
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            newFile.thumbnail = reader.result;
          });
          reader.readAsDataURL(newFile);
          return newFile;
        })
      );
      this.setState({
        fileList: file.type.includes('video') ? files : [...fileList, ...files],
        uploading: true
      });
      const newFileIds = file.type.includes('video') ? [] : [...fileIds];
      // eslint-disable-next-line no-restricted-syntax
      for (const fileItem of listFile) {
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(fileItem.status) || fileItem._id) continue;
          fileItem.status = 'uploading';
          const resp = (
            fileItem.type.indexOf('image') > -1
              ? await feedService.uploadPhoto(fileItem, { uploadToIC }, this.onUploading.bind(this, fileItem))
              : await feedService.uploadVideo(fileItem, { uploadToIC }, this.onUploading.bind(this, fileItem))
          ) as any;
          newFileIds.push(resp.data._id);
          fileItem._id = resp.data._id;
        } catch (e) {
          message.error(`File ${fileItem.name} error!`);
        }
      }
      this.setState({ uploading: false, fileIds: newFileIds });
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
    reader.addEventListener('load', () => {
      this.setState({ thumbnail: { url: reader.result } });
    });
    reader.readAsDataURL(file);
    try {
      const resp = (await feedService.uploadThumbnail(file, {}, this.onUploading.bind(this, file))) as any;
      this.thumbnailId = resp.data._id;
    } catch (e) {
      message.error(`Thumbnail file ${file.name} error!`);
    } finally {
      this.setState({ uploading: false });
    }
  };

  beforeUploadteaser = async (file) => {
    if (!file) {
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_TEASER as any || 200);
    if (!isLt2M) {
      message.error(
        `Teaser is too large please provide an video ${process.env.NEXT_PUBLIC_MAX_SIZE_TEASER || 200}MB or below`
      );
      return;
    }
    this.setState({ teaser: file });
    try {
      const resp = (await feedService.uploadTeaser(file, {}, this.onUploading.bind(this, file))) as any;
      this.teaserId = resp.data._id;
    } catch (e) {
      message.error(`teaser file ${file.name} error!`);
    } finally {
      this.setState({ uploading: false });
    }
  };

  submit = async (payload: any) => {
    const { feed } = this.props;
    const { type } = this.state;
    const {
      pollList, addPoll, expiredPollAt, fileIds, text, isSale, royaltyCut
    } = this.state;
    const formValues = { ...payload };

    if (text.length > 300) {
      message.error('Description is over 300 characters');
      return;
    }
    if (formValues.price < 0) {
      message.error('Price must be greater than 0');
      return;
    }

    if (this.state.type === 'video' && !this.thumbnailId) {
      message.error(`Please upload a thumbnail photo`);
      return;
    }

    formValues.teaserId = this.teaserId;
    formValues.thumbnailId = this.thumbnailId;
    formValues.isSale = isSale;
    formValues.text = text;
    formValues.fileIds = fileIds;
    const participantsSharing = payload.feedParticipants ? payload.feedParticipants : [];
    formValues.feedParticipants = [...[], ...participantsSharing];
    formValues.royaltySharing = [...[], ...royaltyCut];

    if (['video', 'photo'].includes(feed?.type || type) && !fileIds.length) {
      message.error(`Please add ${feed?.type || type} file`);
      return;
    }

    // create polls
    if (addPoll && pollList.length < 2) {
      message.error('Polls must have at least 2 options');
      return;
    }
    if (addPoll && pollList.length >= 2) {
      this.setState({ uploading: true });
      // eslint-disable-next-line no-restricted-syntax
      for (const poll of pollList) {
        try {
          // eslint-disable-next-line no-continue
          if (!poll.length || poll._id) continue;
          const resp = await feedService.addPoll({
            description: poll,
            expiredAt: expiredPollAt
          });
          if (resp && resp.data) {
            this.pollIds = [...this.pollIds, ...[resp.data._id]];
          }
        } catch (e) {
          // eslint-disable-next-line no-console
        }
      }
      formValues.pollIds = this.pollIds;
      formValues.pollExpiredAt = expiredPollAt;
      this.onsubmit(feed, formValues);
    } else {
      this.onsubmit(feed, formValues);
    }
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

  columns = [
    {
      title: 'Collaborator',
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
      title: 'Percentage split',
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
      feed, discard, performer
    } = this.props;
    const { type } = this.state;
    const {
      uploading, fileList, fileIds, isSale, pollList, text, isShowPreviewTeaser, uploadToIC,
      addPoll, openPollDuration, expirePollTime, thumbnail, teaser, shareTip, performers, featuring, active, isShowPreview,
      previewUrl
    } = this.state;
    const dataSource = featuring.map((p) => ({ ...p, key: p._id }));

    return (
      <div className={styles.componentsPostFormModule}>
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
              isSale: 'subscription',
              status: 'active',
              uploadToIC: false,
              active: false,
              shareTip: false,
              feedParticipants: [feed?.performer._id],
              type: 'video'
            })}
            scrollToFirstError
          >
            <div className='form-top-wrapper'>
                  {(!feed || !feed._id) && (
                    <div style={{width: '10%'}}>
                      <Button
                        className="new-post-delete-btn"
                        onClick={() => discard()}
                        style={{ backgroundColor: 'transparent', border: 'none' }}
                        disabled={uploading}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </Button>
                    </div>
                  )}
                  <h1 className='upload-header'>Create new post</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      htmlType="submit"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10 }}
                    >
                      Post
                    </Button>
                  </div>
                </div>
                <div className='form-middle-wrapper'>
                <div className="input-f-desc" style={{margin: -5}}>
                  <div className='create-post-heading-user'>
                      <div className='avatar-wrapper-earnings'>
                        <Avatar src={performer?.avatar || '/static/no-avatar.png'} alt="avatar" />
                      </div>
                      <span className='performer-name-earnings'>{performer?.name}</span>
                  </div>
                  <div className='form-caption' style={{width: '100%'}}>
            <Form.Item
              name="text"
              validateTrigger={['onChange', 'onBlur']}
              rules={[{ required: true, message: `${type === 'text'? 'Please add a description' : 'Please add a caption' }` }]}
            >
              <Input.TextArea 
                showCount 
                value={text} 
                onChange={(e) => this.setState({ text: e.target.value })}  
                style={{ width: '100%', marginLeft: '0.4rem' }} 
                rows={3} 
                minLength={1}
                      maxLength={500}
                placeholder={!fileIds.length ? 'Have something to share with your fans?' : 'Have something to share with your fans?'}
                />
            </Form.Item>
            </div>
                </div>
            </div>
                <div className='form-type-wrapper'>
                  <Form.Item name="type" >
                    <div style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '100%'}}>
                      <div className={`feed-type-option-wrapper ${type === 'photo' && 'selected'}`} onClick={(val) => this.setState({type: 'photo'})}>
                      <FontAwesomeIcon icon={faImage} />
                      <span>Photo</span>
                      </div>
                      <div className={`feed-type-option-wrapper ${type === 'video' && 'selected'}`} onClick={(val) => this.setState({type: 'video'})}>
                      <FontAwesomeIcon icon={faVideo} />
                        <span>Video</span>
                      </div>
                      <div className={`feed-type-option-wrapper ${type === 'text' && 'selected'}`} onClick={(val) => this.setState({type: 'text'})}>
                      <FontAwesomeIcon icon={faBullhorn} />
                      <span>Announcement</span>
                      </div>
                    </div>
                  </Form.Item>
                </div>
                <div className='form-middle-wrapper'>
                    {process.env.NEXT_PUBLIC_ENABLE_ICP_STORAGE === 'true' && (
                      <div className='form-option-wrapper' style={{marginTop: '0.5rem'}}>
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
                            disabled={!performer?.wallet_icp}
                            checked={uploadToIC}
                            style={{marginTop: '1rem'}}
                            onChange={(val) => this.changeUploadToIC(val)}
                            className={`${uploadToIC ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                          />
                      </Form.Item>
                      </div>
                    )}
                    {feed && (
                      <div className='form-option-wrapper' style={{marginTop: '0.5rem', marginBottom: '1.2rem'}}>
                      <div>
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
                    )}
                </div>

                <div className='form-type-wrapper' style={{padding: '20px 2.4rem'}}>
                  <div className="post-option-btns-form" style={{justifyContent: type === 'video' ? 'space-between' : 'space-evenly'}}>
                    {['video', 'photo'].includes(feed?.type || type) && [
                      <Upload
                        key="upload_thumb"
                        customRequest={() => true}
                        accept={'image/*'}
                        beforeUpload={this.beforeUploadThumbnail.bind(this)}
                        multiple={false}
                        showUploadList={false}
                        disabled={uploading}
                        listType="picture"
                      >
                        <div className='feed-extra-option-wrapper'>
                        <FontAwesomeIcon className='thumb-icon' icon={faImage} style={{marginRight: 7}}/>
                          Add thumbnail
                        </div>
                      </Upload>
                    ]}
                    {['video'].includes(feed?.type || type) && [
                      <Upload
                        key="upload_teaser"
                        customRequest={() => true}
                        accept={'video/*'}
                        beforeUpload={this.beforeUploadteaser.bind(this)}
                        multiple={false}
                        showUploadList={false}
                        disabled={uploading}
                        listType="picture"
                      >
                        <div className='feed-extra-option-wrapper'>
                        <FontAwesomeIcon className='teaser-icon' icon={faVideo} style={{marginRight: 7}}/>
                          Add teaser
                        </div>
                      </Upload>
                    ]}
                      <div onClick={this.onAddPoll.bind(this)} className='feed-extra-option-wrapper'>
                      <FontAwesomeIcon className='poll-icon' icon={faSquarePollHorizontal} style={{marginRight: 7}}/>
                      Add poll
                      </div>
                  </div>
                </div>

                {['video', 'photo'].includes(feed?.type || type) && (
                  <div className='form-upload-wrapper'>
                  <Form.Item>
                    <UploadList
                      type={feed?.type || type}
                      files={fileList}
                      remove={this.remove.bind(this)}
                      onAddMore={this.beforeUpload.bind(this)}
                      uploading={uploading}
                    />
                  </Form.Item>
                  </div>
                )}
                <AddPollDurationForm
                  onAddPollDuration={this.onChangePollDuration.bind(this)}
                  openDurationPollModal={openPollDuration}
                />
                <Row style={{padding: '1rem', display: 'flex', flexDirection: 'row', }}>
                  {thumbnail && (
                      <div className='form-access-wrapper' >
                      <p className="create-post-subheading">Thumbnail</p>
                      <Form.Item >
                        <div style={{ position: 'relative' }}>
                          <Button type="primary" onClick={() => this.handleDeleteFile('thumbnail')} style={{ position: 'absolute', top: 2, left: 2, zIndex: 1, background: '#d10303' }}><DeleteOutlined /></Button>
                          <Image alt="thumbnail" src={thumbnail?.url} width="150px" />
                        </div>
                      </Form.Item>
                      </div>
                  )}
                  {teaser && (
                      <div className='form-access-wrapper' >
                      <p className="create-post-subheading">Teaser</p>
                      <Form.Item >
                        <div className="f-upload-list">
                          <div className="f-upload-item">
                            <div
                              className="f-upload-thumb"
                              aria-hidden
                              onClick={() => this.setState({ isShowPreviewTeaser: !!teaser })}
                            >
                              <span className="f-thumb-vid">
                                <PlayCircleOutlined />
                              </span>
                            </div>
                            <div className="f-upload-name">
                              <Tooltip title={teaser?.name}>{teaser?.name}</Tooltip>
                            </div>
                            <div className="f-upload-size">
                              {(teaser.size / (1024 * 1024)).toFixed(2)}
                              {' '}
                              MB
                            </div>
                            <span className="f-remove" style={{ color: '#000' }}>
                              <Button type="primary" style={{ color: '#000', background: '#d10303' }} onClick={() => this.handleDeleteFile('teaser')}>
                                <DeleteOutlined style={{ color: '#000 !important' }} />
                              </Button>
                            </span>
                            {teaser.percent ? <Progress percent={Math.round(teaser.percent)} /> : null}
                          </div>
                        </div>
                      </Form.Item>
                      </div>
                  )}
                {addPoll && (
                  <div className='form-access-wrapper'>
                  <p className="create-post-subheading">Poll</p>
                    <div className="poll-form">
                      <div className="poll-top">
                        
                        {feed ? (
                          <>
                            <span aria-hidden="true" onClick={() => this.setState({ openPollDuration: true })}>
                              Poll duration -
                              {' '}
                              {!expirePollTime ? 'No limit' : `${expirePollTime} days`}
                            </span>
                            <a aria-hidden="true" onClick={this.onAddPoll.bind(this)}>
                              x
                            </a>
                          </>
                        ) : (
                          <span>
                            Poll expiration 
                            {' '}
                            {formatDate(feed?.pollExpiredAt)}
                          </span>
                        )}
                      </div>
                      <Form.Item
                        name="pollDescription"
                        className="form-item-no-pad"
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[{ required: true, message: 'Please add a question' }]}
                      >
                        <Input placeholder="Question" />
                      </Form.Item>
                      {/* eslint-disable-next-line no-nested-ternary */}
                      <Input
                        disabled={!!feed?._id}
                        className="poll-input"
                        placeholder="Poll 1"
                        value={
                            pollList.length > 0 && pollList[0]._id
                              ? pollList[0].description
                              : pollList[0]
                                ? pollList[0]
                                : ''
                          }
                        onChange={this.onChangePoll.bind(this, 0)}
                      />
                      {/* eslint-disable-next-line no-nested-ternary */}
                      <Input
                        disabled={!!feed?._id || !pollList.length}
                        placeholder="Poll 2"
                        className="poll-input"
                        value={
                            pollList.length > 1 && pollList[1]._id
                              ? pollList[1].description
                              : pollList[1]
                                ? pollList[1]
                                : ''
                          }
                        onChange={this.onChangePoll.bind(this, 1)}
                      />
                      {pollList.map((poll, index) => {
                        if (index === 0 || index === 1) return null;
                        return (
                          <Input
                            autoFocus
                            disabled={!!feed?._id}
                            placeholder={`Poll ${index + 1}`}
                            key={poll?.description || poll}
                            value={(poll._id ? poll.description : poll) || ''}
                            className="poll-input"
                            onChange={this.onChangePoll.bind(this, index)}
                          />
                        );
                      })}
                      {!feed && pollList.length > 1 && (
                      <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <a aria-hidden onClick={() => this.setState({ pollList: pollList.concat(['']) })}>
                          Add another option
                        </a>
                        <a aria-hidden onClick={this.onClearPolls.bind(this)}>
                          Clear polls
                        </a>
                      </p>
                      )}
                    </div>
                    </div>
                )}
                </Row>
            <div className='form-middle-wrapper' style={{borderBottom: shareTip ? '' : 'none'}}>
            {['video', 'photo'].includes(feed?.type || type) && (
              <div className='form-access-wrapper' style={{width: '100%'}}>
                <p className="create-post-subheading">Access</p>
                <p className="create-post-info">
                 Select who can view this post
                </p>
              <Form.Item>
                <Select
                  defaultValue="subscription"
                  style={{ width: '100%'}}
                  onChange={(val) => this.setState({ isSale: val })}
                  className='track-type-form'
                >
                  <Select.Option value="free">Free for everyone</Select.Option>
                  <Select.Option value="subscription">Subscribers only</Select.Option>
                  <Select.Option value="pay">Pay-to-access</Select.Option>
                </Select>
              </Form.Item>
              </div>
            )}
            {isSale === 'pay' && (
              <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem'}}>
              <p className="create-post-subheading">Price</p>
                <p className="create-post-info">
                 Input the price of this piece of content 
                </p>
              <Form.Item style={{ width: '100%'}} name="price" label="" rules={[{ required: true, message: 'Please add the price' }]}>
              
                <InputNumber
                  type="number" prefix="$" placeholder='0.00'
                  datatype="currency"
                  className='input-create-track'
                  min={1}
                />
              </Form.Item>
              </div>
            )}
            
            <div className='form-option-wrapper' style={{marginTop: '0.5rem'}}>
              <div>
                <p className="create-post-subheading">Earn crypto</p>
                <p className="create-post-info">
                  Allow users to purchase or tip your content with crypto
                </p>
              </div>
              <Form.Item name="shareTip">
                  <Switch
                    checkedChildren=""
                    unCheckedChildren=""
                    checked={shareTip}
                    style={{marginTop: '1rem', marginBottom: '1rem'}}
                    onChange={(val) => this.setState({shareTip: val})}
                    className={`${shareTip ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                  />
          
              </Form.Item>
              </div>
              </div>
              <div className='form-middle-wrapper' style={{borderBottom: 'none'}}>
              {shareTip && (
                <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem'}}>
                <p className="create-post-subheading">Collaborators</p>
                    <p className="create-post-info">Add other trax artists who collaborated on this content</p>
                  <Form.Item name="feedParticipants">
                      <Select
                      className='upload-select'
                        mode="multiple"
                        style={{ width: '100%', backgroundColor: 'transparent', border: 'none'}}
                        showSearch
                        placeholder="Search performers here"
                        optionFilterProp="children"
                        onSearch={this.getPerformers.bind(this)}
                        loading={uploading}
                        onChange={(e) => {
                          this.pushFeaturedArtists(e);
                        }}
                        defaultValue={[performer?._id] || []}
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
                    </div>
                </div>
                )}
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

FeedForm.defaultProps = {
  type: '',
  discard: () => {},
  feed: {} as IFeed
} as Partial<IProps>;
