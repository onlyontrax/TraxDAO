/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-prototype-builtins */
import {
    Layout, Tabs, message, Button, Spin, Tooltip, Avatar, Modal, Progress, Image
  } from 'antd';
  import { BsCheckCircleFill } from 'react-icons/bs';
  import {
    PlusOutlined, FireOutlined, FireFilled, CommentOutlined, LoadingOutlined
  } from '@ant-design/icons';
  import { CheckBadgeIcon, LockClosedIcon } from '@heroicons/react/24/solid';

  import { PureComponent } from 'react';
  import { connect } from 'react-redux';
  import {
    getComments, moreComment, createComment, deleteComment
  } from 'src/redux/comment/actions';
  import { updateBalance } from '@redux/user/actions';
  import { getRelated } from 'src/redux/video/actions';
  import Head from 'next/head';
  import { motion } from 'framer-motion';
  import {
    authService, videoService, reactionService, tokenTransctionService, paymentService
  } from '@services/index';


  import { ListComments, CommentForm } from '@components/comment';
  import ConfirmSubscriptionPerformerForm from '@components/performer/confirm-subscription';
  import { PPVPurchaseModal } from '@components/performer';
  import { shortenLargeNumber, formatDate } from '@lib/index';
  import {
    IVideo, IUser, IUIConfig, IPerformer, ISettings
  } from 'src/interfaces';

  // import { ppv } from "../../src/smart-contracts/ppv";
  // import { idlFactorySUB } from "../../src/smart-contracts/declarations/subscriptions";
  import { Principal } from '@dfinity/principal';
  import { AccountIdentifier } from '@dfinity/nns';
  import { Actor, HttpAgent } from '@dfinity/agent';
  import { AuthClient } from '@dfinity/auth-client';
  import Link from 'next/link';
  import Router, { useRouter } from 'next/router';
  import Error from 'next/error';
  /*import { subscriptions } from '../../src/smart-contracts/declarations/subscriptions';
  import { SubType } from '../../src/smart-contracts/declarations/subscriptions/subscriptions.did';*/

  import { idlFactory as idlFactoryPPV } from '../../smart-contracts/declarations/ppv/ppv.did.js';
  import type { _SERVICE as _SERVICE_PPV, Content } from '../../smart-contracts/declarations/ppv/ppv2.did.js';

  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
  import { faEllipsis } from '@fortawesome/free-solid-svg-icons'

  import { idlFactory as idlFactoryLedger } from '../../smart-contracts/declarations/ledger/ledger.did.js';
  import type { _SERVICE as _SERVICE_LEDGER } from '../../smart-contracts/declarations/ledger/ledger2.did.js';
  import {
    TransferArgs, Tokens, TimeStamp, AccountBalanceArgs
  } from '../../smart-contracts/declarations/ledger/ledger2.did.js';
  import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
  import { faInstagram, faSoundcloud, faXTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons'
  import { faCheck } from '@fortawesome/free-solid-svg-icons'
  import PaymentProgress from '../user/payment-progress.js';
  import { debounce } from 'lodash';
  import LogInModal from 'src/components/log-in/log-in-modal';
  import SignUpModal from '@components/sign-up/sign-up-modal';
  import { Description } from '@headlessui/react/dist/components/description/description.js';
  import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

  const { TabPane } = Tabs;

  interface IProps {
    commentMapping: any;
    comment: any;
    getComments: Function;
    moreComment: Function;
    createComment: Function;
    deleteComment: Function;
    contentUnlocked: boolean;
    ui: IUIConfig;
    video: IVideo;
    settings: ISettings;
    user: IUser;
  }

  const variants = {
    isPlaying: { scale: 1, type: 'spring'},
    isPaused: { scale: 0.8, type: 'spring'},
  }


  const reveal = (show: boolean) => ({
    height: !show ? '0px' : '100%',
    opacity: !show ? '0' : '1',

    transition: `0.5s all ease-in-out`,
  })

  class ContentData extends PureComponent<IProps> {
    static authenticate = true;

    static noredirect = true;

    async getData() {
      if (this.props.video && this.props.video._id) {
        return { video: this.props.video };
      }

      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      try {
        const video = await (
          await videoService.findOne(id as string, {
            Authorization: authService.getToken() || ''
          })
        ).data;
        return { video };
      } catch (e) {
        return { video: [] };
      }
    }

    state = {
      videoStats: {
        likes: 0, comments: 0, views: 0, bookmarks: 0
      },


      itemPerPage: 24,
      commentPage: 0,
      isFirstLoadComment: true,
      totalComment: 0,
      submiting: false,
      requesting: false,
      activeTab: 'description',
      video: null,
      showComments: true,
      showCollabs: true,
      showDescription: true,
    };

    async componentDidMount() {
      const { video } = this.state;
      if (video === null) {
        const data = await this.getData();
        this.promptSignIn()

        this.setState({ video: data.video }, () => this.updateDataDependencies());
      } else {
        await this.updateDataDependencies();
      }

      Router.events.on('routeChangeComplete', this.onRouteChangeComplete);
    }

    componentWillUnmount() {
      Router.events.off('routeChangeComplete', this.onRouteChangeComplete);
    }

    promptSignIn = debounce(async () => {
      const { user } = this.props;
      this.setState({isSignedIn: user._id ? true : false})
    })

    onRouteChangeComplete = async (url) => {
      const data = await this.getData();

      this.setState({ video: data.video }, () => this.updateDataDependencies());
    };

    async updateDataDependencies() {
      const { settings } = this.props;
      const { video, activeTab } = this.state;
      if (video === null) {
        return;
      }
      this.onShallowRouteChange();
    //   await tokenTransctionService.sendCryptoPpv(video?.performer?._id, { performerId: video?.performer?._id, price: Number(amountToSendICP), tokenSymbol: 'ICP' }).then(() => {
    //   });
    }

    componentDidUpdate(prevProps, prevState) {
      const {
        commentMapping, comment
      } = this.props;
      const { video } = this.state;
      if (video === null) return;
      const { totalComment } = this.state;

      if (prevState.video && prevState.video._id !== video._id) {
        this.onShallowRouteChange();
      }

      if (
        (!prevProps.comment.data
          && comment.data
          && comment.data.objectId === video._id)
        || (prevProps.commentMapping[video._id]
          && totalComment !== commentMapping[video._id].total)
      ) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ totalComment: commentMapping[video._id].total });
      }
    }

    onShallowRouteChange() {
      const {   getComments: handleGetComments  } = this.props;
      const {   video, itemPerPage  } = this.state;

      if (video === null) return;
      this.setState({
        videoStats: video.stats,
      });

      handleGetComments({
        objectId: video._id,
        objectType: 'video',
        limit: itemPerPage,
        offset: 0
      });
    }

    onChangeTab(tab: string) {
      this.setState({ activeTab: tab });
      const { isFirstLoadComment, itemPerPage } = this.state;
      const { getComments: handleGetComments } = this.props;
      const { video } = this.state;
      if (tab === 'comment' && isFirstLoadComment) {
        this.setState(
          {
            isFirstLoadComment: false,
            commentPage: 0
          },
          () => {
            handleGetComments({
              objectId: video._id,
              objectType: 'video',
              limit: itemPerPage,
              offset: 0
            });
          }
        );
      }
    }

    async onSubmitComment(values: any) {
      const { createComment: handleComment } = this.props;
      handleComment(values);
    }

    loadMoreComment = async (videoId: string) => {
      const { moreComment: handleMoreComment } = this.props;
      const { itemPerPage, commentPage } = this.state;
      await this.setState({
        commentPage: commentPage + 1
      });
      handleMoreComment({
        limit: itemPerPage,
        objectType: 'video',
        offset: (commentPage + 1) * itemPerPage,
        objectId: videoId
      });
    };

    async deleteComment(item) {
      const { deleteComment: handleDeleteComment } = this.props;
      if (!window.confirm('Are you sure to remove this comment?')) return;
      handleDeleteComment(item._id);
    }



    render() {
      const {   user, commentMapping, comment, ui, settings, video, contentUnlocked } = this.props;

      const {  videoStats, showComments, showCollabs, showDescription, submiting, requesting, activeTab, isFirstLoadComment } = this.state;
      const { requesting: commenting } = comment;
      const fetchingComment = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].requesting : false;
      const comments = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].items : [];
      const totalComments = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].total : 0;

      return (
            <div className={video.trackType == 'video' ? 'vid-tab-wrapper-vid': 'vid-tab-wrapper'} style={{marginTop: (contentUnlocked && video.trackType == 'video') && '0rem'}}>
              <Tabs
                defaultActiveKey="comment"
                activeKey={activeTab}
                onChange={(tab) => this.onChangeTab(tab)}
                className="flex flex-col"
              >
                <TabPane key="description">
                  <div className='bg-[#1e1e1e] p-3 rounded-lg'>
                    <div className='descriptions-wrapper'>
                        <div className='flex flex-row gap-4 justify-between text-lg'>
                          <span className=''>
                            {shortenLargeNumber(videoStats?.views || 0)}
                            &nbsp;
                            <span>views</span>
                          </span>
                          <span>
                          {shortenLargeNumber(videoStats?.likes || 0)}
                          &nbsp;
                            <span>likes</span>
                          </span>
                          <span className=''>
                            {formatDate(video?.updatedAt, 'll')}
                          </span>
                        </div>
                    <div className='cursor-pointer text-trax-white px-2.5 py-0.5 flex-end flex' onClick={()=> this.setState({showDescription: !showDescription})}>
                      <span>{showDescription ? <MinusIcon width={20} height={20} className='text-trax-white'/> : <PlusIcon width={20} height={20} className='text-trax-white'/>}</span>
                    </div>
                  </div>
                  <div style={reveal(showDescription)}>
                  <span>
                      {video.tags && video.tags.length > 0 && (
                        <div className='flex flex-row gap-[5px] mt-2 overflow-auto'>
                          {video.tags.map((tag) => (
                            <span className='genre-tag-video' key={tag} style={{ marginRight: 5 }}>

                            {tag || 'tag'}
                          </span>
                          ))}
                        </div>
                      )}
                      </span>
                    <p className='text-trax-white mt-2 flex'>{video.description || 'No description...'}</p>
                    </div>
                  </div>

                  <div style={{display: video?.participants?.length < 2 && 'none'}}>
                    <div className='bg-[#1e1e1e] p-3 rounded-lg mt-2'>
                      <div className='flex flex-row justify-between w-full '>
                        <span className='flex w-full  text-base text-trax-white font-light '>{video?.participants?.length} {video?.participants?.length > 1 ? 'collaborators' : 'collaborator'}</span>
                        <div className='cursor-pointer text-trax-white px-2.5 py-0.5  flex-end flex' onClick={()=> this.setState({showCollabs: !showCollabs})}>
                          <span>{showCollabs ? <MinusIcon width={20} height={20} className='text-trax-white'/> : <PlusIcon width={20} height={20} className='text-trax-white'/>}</span>
                        </div>
                      </div>

                        <div style={reveal(showCollabs)} className='flex flex-row gap-2 justify-start overflow-auto pt-3'>
                        {video?.participants && video?.participants?.length > 0 && (
                          video?.participants?.map((per: IPerformer) => (
                            <Link
                              key={per._id}
                              href={`/${per?.username || per?._id}`}
                              as={`/${per?.username || per?._id}`}
                              legacyBehavior

                            >
                              <div key={per._id} className="participant-card">
                                <img
                                  alt="per_atv"
                                  src={per?.avatar || '/no-avatar.png'}
                                />
                                <div className="participant-info">
                                  <h4>
                                    {per?.name || 'N/A'}
                                    &nbsp;
                                    {per?.verifiedAccount && <CheckBadgeIcon style={{ height: '1rem', color: '#c8ff02' }} />}
                                    &nbsp;
                                    {per?.wallet_icp && (

                                      <Image src="/static/infinity-symbol.png" style={{ height: '1rem' }} />
                                    )}
                                  </h4>

                                  <h5>
                                    @
                                    {per?.username || 'n/a'}
                                  </h5>

                                </div>
                              </div>
                            </Link>
                          ))
                        )}

                      </div>
                    </div>
                  </div>
                  <div className='bg-[#1e1e1e] p-3 rounded-lg mt-2'>
                    <div className='flex flex-row justify-between w-full '>
                      <span className='flex w-full text-base text-trax-white font-light pb-1'>{`${comments.length} ${comments.length > 1 || comments.length === 0 ? 'comments' : 'comments'}`}</span>
                      <div className='cursor-pointer text-trax-white px-2.5 py-0.5  flex-end flex' onClick={()=> this.setState({showComments: !showComments})}>
                        <span>{showComments ? <MinusIcon width={20} height={20} className='text-trax-white'/> : <PlusIcon width={20} height={20} className='text-trax-white'/>}</span>
                      </div>
                    </div>
                    <div style={reveal(showComments)}>
                      <ListComments
                        key={`list_comments_${comments.length}`}
                        requesting={fetchingComment}
                        comments={comments}
                        total={totalComments}
                        onDelete={this.deleteComment.bind(this)}
                        user={user}
                        canReply
                      />
                      <CommentForm
                        creator={user}
                        onSubmit={this.onSubmitComment.bind(this)}
                        objectId={video._id}
                        requesting={commenting}
                        objectType="video"
                        siteName={ui?.siteName}
                      />
                      {comments.length < totalComments && (
                        <p className="text-center">
                          <a aria-hidden onClick={this.loadMoreComment.bind(this)}>
                            More comments
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>

      );
    }
  }
  const mapStates = (state: any) => {
    const { commentMapping, comment } = state.comment;
    return {
      commentMapping,
      comment,
    //   user: { ...state.user.current },
    //   ui: { ...state.ui },
    //   settings: { ...state.settings }
    };
  };

  const mapDispatch = {
    getComments,
    moreComment,
    createComment,
    deleteComment,
  };
  export default connect(mapStates, mapDispatch)(ContentData);
