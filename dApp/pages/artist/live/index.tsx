/* eslint-disable dot-notation */
import { connect } from 'react-redux';
import {
  ClockCircleOutlined, EditOutlined, EyeOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import ChatBox from '@components/stream-chat/chat-box';
import { StreamPriceForm } from '@components/streaming/set-price-session';
import { videoDuration } from '@lib/index';
import { getStreamConversation, resetAllStreamMessage, resetStreamMessage } from '@redux/stream-chat/actions';
import {
  Button, Card, Col, Layout, Modal, Row, message
} from 'antd';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router, { Router as RouterEvent } from 'next/router';
import { PureComponent, createRef, forwardRef } from 'react';
import {
  IPerformer, IStream, IUIConfig, IUser, StreamSettings
} from 'src/interfaces';
import { streamService } from 'src/services';
import { Event, SocketContext } from 'src/socket';
import styles from './index.module.scss';

const AgoraProvider = dynamic(() => import('src/agora/AgoraProvider'), { ssr: false });
const Publisher = dynamic(() => import('@components/streaming/agora/publisher'), { ssr: false });
function PublisherWithRef(
  props: {
    uid: string;
    onStatusChange: Function;
    conversationId: string;
    sessionId: string;
  },
  ref
) {
  return <Publisher {...props} forwardedRef={ref} />;
}
const ForwardedPublisher = forwardRef(PublisherWithRef);

// eslint-disable-next-line no-shadow
enum EVENT_NAME {
  ROOM_INFORMATIOM_CHANGED = 'public-room-changed',
  ADMIN_END_SESSION_STREAM = 'admin-end-session-stream',
  LEAVE_STREAM = 'public-stream/leave',
}

interface IProps {
  ui: IUIConfig;
  settings: StreamSettings;
  resetStreamMessage: Function;
  resetAllStreamMessage: Function;
  getStreamConversation: Function;
  activeConversation: any;
  user: IPerformer;
}

interface IStates {
  loading: boolean;
  initialized: boolean;
  total: number;
  members?: IUser[];
  openPriceModal: boolean;
  callTime: number;
  activeStream: IStream;
  editting: boolean;
}

class PerformerLivePage extends PureComponent<IProps, IStates> {
  static layout = 'stream';

  static authenticate = true;

  private publisherRef = createRef<{ publish: any; leave: any }>();

  private streamDurationTimeOut: any;

  private setDurationStreamTimeOut: any;

  private descriptionRef = createRef<any>();

  state = {
    loading: false,
    initialized: false,
    total: 0,
    openPriceModal: false,
    callTime: 0,
    activeStream: null,
    editting: false
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user || !user.verifiedDocument) {
      message.warning('Your account is not verified ID documents yet! You could not post any content right now.');
      Router.back();
      return;
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.onbeforeunload.bind(this));
    }
    RouterEvent.events.on('routeChangeStart', this.onbeforeunload.bind(this));
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.onbeforeunload.bind(this));
    }
    RouterEvent.events.off('routeChangeStart', this.onbeforeunload.bind(this));
  }

  // eslint-disable-next-line react/sort-comp
  handleDuration() {
    const { callTime } = this.state;
    this.streamDurationTimeOut && clearTimeout(this.streamDurationTimeOut);
    this.setState({ callTime: callTime + 1 });
    this.streamDurationTimeOut = setTimeout(this.handleDuration.bind(this), 1000);
  }

  onRoomChange = ({ total, conversationId }) => {
    const { activeConversation } = this.props;
    if (activeConversation?.data?._id && activeConversation.data._id === conversationId) {
      this.setState({ total });
    }
  };

  onStreamStatusChange = (started: boolean) => {
    if (started) {
      this.setState({ initialized: true, loading: false });
      this.handleDuration();
      this.updateStreamDuration();
    } else {
      this.streamDurationTimeOut && clearTimeout(this.streamDurationTimeOut);
      this.setDurationStreamTimeOut && clearTimeout(this.setDurationStreamTimeOut);
    }
  };

  onbeforeunload = () => {
    this.streamDurationTimeOut && clearTimeout(this.streamDurationTimeOut);
    this.setDurationStreamTimeOut && clearTimeout(this.setDurationStreamTimeOut);
    this.leavePublicRoom();
  };

  async joinPublicRoom(payload: any) {
    const { getStreamConversation: dispatchGetStreamConversation } = this.props;
    const socket = this.context;
    try {
      await this.setState({ loading: true });
      const resp = await (await streamService.goLive(payload)).data;
      this.setState({
        activeStream: resp,
        openPriceModal: false
      });
      dispatchGetStreamConversation({
        conversation: resp.conversation
      });
      // @ts-ignore
      socket
        && (socket as any).emit('public-stream/join', {
          conversationId: resp.conversation._id
        });
      this.publisherRef.current && this.publisherRef.current.publish();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Stream server error, please try again later');
    } finally {
      this.setState({ loading: false });
    }
  }

  leavePublicRoom() {
    const { activeConversation, resetStreamMessage: reset } = this.props;
    const socket = this.context;
    const conversation = { ...activeConversation.data };
    if (socket && conversation && conversation._id) {
      // @ts-ignore
      socket.emit(EVENT_NAME.LEAVE_STREAM, { conversationId: conversation._id });
      reset();
    }
  }

  async updateStreamDuration() {
    this.setDurationStreamTimeOut && clearTimeout(this.setDurationStreamTimeOut);
    const { callTime, activeStream } = this.state;
    if (!activeStream) return;
    await streamService.updateStreamDuration({ streamId: activeStream._id, duration: callTime });
    this.setDurationStreamTimeOut = setTimeout(this.updateStreamDuration.bind(this), 15 * 1000);
  }

  async editLive() {
    try {
      const { activeStream } = this.state;
      if (!activeStream) return;
      const description = this.descriptionRef.current.value;
      await streamService.editLive(activeStream._id, { description });
      this.setState({ activeStream: { ...activeStream, description } });
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Stream server error, please try again later');
    } finally {
      this.setState({ editting: false });
    }
  }

  render() {
    const { user, ui } = this.props;
    const {
      loading, initialized, total, openPriceModal, callTime, activeStream, editting
    } = this.state;
    const agoraProps: any = { config: { mode: 'live', codec: 'h264', role: 'host' } };

    return (
      <AgoraProvider {...agoraProps}>
        <Layout className={styles.pagesArtistLiveModule}>
          <Head>
            <title>{`${ui?.siteName} | Live`}</title>
          </Head>
          <Event event={EVENT_NAME.ROOM_INFORMATIOM_CHANGED} handler={this.onRoomChange.bind(this)} />
          <div>
            <Row className="main-container">
              <Col xs={24} sm={24} md={16} style={{ padding: 10 }}>
                <ForwardedPublisher
                  uid={user._id}
                  onStatusChange={(val) => this.onStreamStatusChange(val)}
                  ref={this.publisherRef}
                  conversationId={activeStream?.conversation?._id}
                  sessionId={activeStream?.sessionId}
                />
                <p className="stream-duration">
                  <span>
                    <ClockCircleOutlined />
                    {' '}
                    {videoDuration(callTime)}
                  </span>
                  <span>
                    $
                    {user?.account?.balance?.toFixed(2)}
                  </span>
                  <span>
                    <EyeOutlined />
                    {' '}
                    {total}
                  </span>
                </p>
                <div className="stream-description">
                  {!initialized ? (
                    <Button
                      key="start-btn"
                      className="primary"
                      onClick={() => this.setState({ openPriceModal: true })}
                      disabled={loading}
                      block
                    >
                      <PlayCircleOutlined />
                      {' '}
                      Start Broadcasting
                    </Button>
                  ) : (
                    <Button
                      key="start-btn"
                      className="primary"
                      onClick={() => Router.push(
                        { pathname: `/artist/profile/?id=${user?.username || user?._id}` },
                        `/artist/profile/?id=${user?.username || user?._id}`
                      )}
                      disabled={loading}
                      block
                    >
                      <PlayCircleOutlined />
                      {' '}
                      Stop Broadcasting
                    </Button>
                  )}
                </div>
                <Card bordered={false} bodyStyle={{ padding: 0 }}>
                  <Card.Meta
                    title={activeStream?.title}
                    description={
                      activeStream?.description && (
                        <p>
                          {editting ? (
                            <Row>
                              <Col xs={24}>
                                <textarea
                                  className="ant-input"
                                  ref={this.descriptionRef}
                                  defaultValue={activeStream.description}
                                />
                              </Col>
                              <Col xs={24}>
                                <Button className="primary" icon={<EditOutlined />} onClick={() => this.editLive()}>
                                  Update
                                </Button>
                              </Col>
                            </Row>
                          ) : (
                            <>
                              {activeStream.description}
                              {' '}
                              <EditOutlined onClick={() => this.setState({ editting: true })} />
                            </>
                          )}
                        </p>
                      )
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8} style={{ padding: 10 }}>
                <ChatBox {...this.props} />
              </Col>

              <Modal
                centered
                key="update_stream"
                title="Update stream information"
                open={openPriceModal}
                footer={null}
                onCancel={() => this.setState({ openPriceModal: false })}
              >
                <StreamPriceForm submiting={loading} performer={user} onFinish={this.joinPublicRoom.bind(this)} />
              </Modal>
            </Row>
          </div>
        </Layout>
      </AgoraProvider>
    );
  }
}

PerformerLivePage.contextType = SocketContext;

const mapStateToProps = (state) => ({
  ui: { ...state.ui },
  ...state.streaming,
  user: { ...state.user.current },
  activeConversation: { ...state.streamMessage.activeConversation }
});
const mapDispatchs = {
  getStreamConversation,
  resetStreamMessage,
  resetAllStreamMessage
};
export default connect(mapStateToProps, mapDispatchs)(PerformerLivePage);
