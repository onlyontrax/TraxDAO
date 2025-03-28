/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-prototype-builtins */
import {
    Tabs, message, Modal
  } from 'antd';
  import { PureComponent } from 'react';
  import { connect } from 'react-redux';
  import {
    getComments, moreComment, createComment, deleteComment
  } from 'src/redux/comment/actions';
  import { updateBalance } from "@redux/user/actions";
  import {
    authService, videoService, followService, performerService
  } from '@services/index';
  import { ListComments, CommentForm } from '@components/comment';
  import { shortenLargeNumber, formatDate } from '@lib/index';
  import {
    IVideo, IUser, IUIConfig, IPerformer, ISettings,
    IAccount
  } from 'src/interfaces';
  import Link from 'next/link';
  import Router from 'next/router';
  import type { _SERVICE as _SERVICE_PPV, Content } from '../../smart-contracts/declarations/ppv/ppv2.did.js';
  import type { _SERVICE as _SERVICE_LEDGER } from '../../smart-contracts/declarations/ledger/ledger2.did.js';
  import { debounce } from 'lodash';
  import { PICK_GENRES } from 'src/constants';
  import TraxButton from '@components/common/TraxButton';
  // import { TipFunction } from '@components/user/tip-service';
  import TipPerformerForm from '@components/performer/TipPerformerForm';
  import { tokenTransctionService } from '@services/index';
  import {
    requestConnectPlug,
    tipCrypto,
    requestPlugBalance
  } from "../../../src/crypto/transactions/plug-tip";
  import PaymentProgress from '@components/user/payment-progress';
  import { Principal } from "@dfinity/principal";

  const { TabPane } = Tabs;

  interface IProps {
    commentMapping: any;
    comment: any;
    account: IAccount;
    getComments: Function;
    moreComment: Function;
    createComment: Function;
    deleteComment: Function;
    contentUnlocked: boolean;
    ui: IUIConfig;
    video: IVideo;
    settings: ISettings;
    user: IUser;
    isMobile: boolean;
    updateBalance: Function;
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
      const { video } = this.props;
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
      activeTags: null,
      isFollowed: false,
      showFollowModal: false,
      openTipModal: false,
      performer: [],
      openProgressModal: false,
      confetti: false,
      tipProgress: 0,
      participants: []
    };

    getMatchingTextValues(genres, valueArray) {
      return valueArray
        .map(value => {
          if(value !== "featuredVideoOne" || value !== "traxOriginal"){
            const matchingGenre = genres.find(genre => genre.value === value);
            return matchingGenre ? matchingGenre.text : null;
          }

        })
        .filter(text => text !== null);
    }

    async componentDidMount() {
      const { video, performer } = this.state;

      if (video === null) {
        const data = await this.getData();
        this.promptSignIn()


        const _id = data.video.performer._id
        const [performer] = await Promise.all([
          performerService.findOne(_id as string, {
            Authorization: authService.getToken() || "",
          }),
        ]);
        this.setState({performer: performer?.data})



        this.setState({ video: data.video }, () => this.updateDataDependencies());

        this.setState({ isFollowed: !!performer?.data.isFollowed })
        let tags = data.video.tags;

        if(tags.length > 0){


          let activeTags = this.getMatchingTextValues(PICK_GENRES, tags);
          this.setState({activeTags});
        }
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


  handleFollow = async () => {
    const { user, video } = this.props;
    if (video.performer === null) return;
    const { isFollowed, requesting } = this.state;
    if (!user._id) {
      message.error("Please log in or register!");
      return;
    }
    if (requesting || user.isPerformer) return;
    try {
      this.setState({ requesting: true });
      if (!isFollowed) {
        this.setState({ showFollowModal: false })
        await followService.create(video?.performer?._id);
        this.setState({ isFollowed: true, requesting: false });
        // this.openFollowNotification();
      } else {
        await followService.delete(video?.performer?._id);
        this.setState({ isFollowed: false, requesting: false });
        // this.closeFollowNotification()
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || "An error occured, please try again later");
      this.setState({ requesting: false });
    }
  };

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

  async beforeSendTipCrypto(amount: number, ticker: string, wallet: string) {
    const { settings, video } = this.props;
    const { performer } = this.state;
    const whitelist = [settings.icTipping, settings.icTraxToken];
    const host = settings.icHost;

    if(await requestConnectPlug(whitelist, host)) {
        try {
            this.setState({
              tipProgress: 0,
              openTipModal: false,
              tipStatus: '',
              requesting: true,
              submiting: true,
              openTipProgressModal: true
            });

            //TODO: Work out edge cases for participants

            // console.log(video)
            // let participants: any = [];

            const artist: any = [{
              participantID: video.performer && Principal.fromText(video.performer.account?.wallet_icp),
              participantPercentage: 1.0
            }];


            // participants.push(artist)

            // video.participants.map((artist, index)=>{
            //   if(artist.account?.wallet_icp){
            //     const part: any = [{
            //       participantID: Principal.fromText(artist.account?.wallet_icp),
            //       participantPercentage: 1.0
            //     }];
            //   }
            // })

            const res = await tipCrypto(
                artist,
                amount,
                ticker,
                settings,
                (update) => {
                    this.setState({
                        tipProgress: update.progress,
                    });
                }
            );

            if (res) {
                this.setState({requesting: false, submiting: false, confetti: true });
                setTimeout(()=>{
                  this.setState({openTipProgressModal: true})
                }, 6000)
                message.success('Tip sent successfully!');
            }else{

            }
        } catch (error) {

            this.setState({openTipProgressModal: false, requesting: false, submiting: false });
            message.error(error.message);
        }
    } else {
      this.setState({openTipProgressModal: false, requesting: false, submiting: false });
        message.error('Failed to connect to Plug wallet');
    }
  }


    async handleTip(price: number, ticker: string, paymentOption: string) {

      if(paymentOption === "card" || paymentOption === "credit"){
        const { user, updateBalance: handleUpdateBalance, video } = this.props;
        const { performer } = this.state;
        if (performer === null) return;
        if (user?.account?.balance < price) {
          message.error("You have an insufficient wallet balance. Please top up.");
          Router.push("/user/wallet/");
          return;
        }
        try {
          this.setState({ requesting: true });
          await tokenTransctionService.sendTip(video.performer?._id, { performerId: video.performer?._id, price });
          message.success(`Thank you for supporting ${video.performer.name}! Your tip has been sent successfully`, 5);
          handleUpdateBalance({ token: -price });
        } catch (e) {
          const err = await e;
          message.error(err.message || "error occured, please try again later");
        } finally {
          this.setState({ requesting: false, openTipModal: false });
        }

      }else if(paymentOption === "plug" || paymentOption === "II"){
        await this.beforeSendTipCrypto(price, ticker, paymentOption);
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
      const {   user, commentMapping, comment, ui, settings, video, contentUnlocked, isMobile, account } = this.props;
      const {  videoStats, showComments, showCollabs, showFollowModal, openProgressModal, confetti, tipProgress, showDescription, openTipModal, submiting, requesting, activeTab, isFollowed, activeTags, isFirstLoadComment } = this.state;
      const { requesting: commenting } = comment;
      const fetchingComment = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].requesting : false;
      const comments = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].items : [];
      const totalComments = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].total : 0;

      return (
            <div className={`vid-tab-wrapper ${video.trackType === 'video' ? 'pr-4 sm:pr-0' : 'pr-0'}`}>
              {/* {user._id && (
                <div className='flex flex-row gap-x-2 mb-4'>
                  <TraxButton
                    htmlType="button"
                    disabled={video.limitSupply && video.supply === 0}
                    styleType="primary"
                    buttonSize={'full'}
                    buttonText='Support'
                    loading={false}
                    onClick={() => this.setState({ openTipModal: true })}
                  />
                  <TraxButton
                    htmlType="button"
                    styleType="secondary"
                    buttonSize={"full"}
                    buttonText={isFollowed ? "Following" : "Follow"}
                    disabled={!user._id}
                    onClick={() => !isFollowed ? this.setState({showFollowModal: true}) : this.handleFollow()}
                  />
                </div>
              )} */}

              <Tabs
                defaultActiveKey="comment"
                activeKey={activeTab}
                onChange={(tab) => this.onChangeTab(tab)}
                className="flex flex-col"
              >
                <TabPane key="description">

                  <div className='bg-transparent p-0 sm:px-3 sm:pb-3 rounded-lg backdrop-blur mb-2'>
                    <div className='flex flex-row justify-between w-full text-trax-white'>
                      <span className='text-base align-top font-body font-light mr-2'>({comments.length})</span>
                      <span className='flex w-full font-heading uppercase font-bold text-3xl pb-1'>{`${comments.length > 1 || comments.length === 0 ? 'comments' : 'comments'}`}</span>
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

                  <div style={{display: video?.participants?.length < 2 && 'none'}}>
                    <div className='bg-transparent p-0 sm:p-3 rounded-lg mt-4'>
                      <div className='flex flex-row justify-between w-full text-trax-white '>
                        <span className='text-base align-top font-body font-light mr-2'>({video?.participants?.length})</span>
                        <span className='flex w-full text-3xl  font-bold font-heading uppercase'>collaborators</span>
                      </div>
                        <div style={reveal(showCollabs)} className='flex flex-row gap-2 justify-start overflow-auto pt-3'>
                        {video?.participants && video?.participants?.length > 0 && (
                          video?.participants?.map((per: IPerformer) => (
                            <Link
                              key={per._id}
                              href={`/artist/profile/?id=${per?.username || per?._id}`}
                              as={`/artist/profile/?id=${per?.username || per?._id}`}
                              legacyBehavior
                            >
                              <div key={per._id} className="participant-card">
                                <img
                                  alt="per_atv"

                                  src={per?.avatar || '/static/no-avatar-dark-mode.png'}
                                />
                                <div className="participant-info">
                                  <h4>
                                    {per?.name || 'N/A'}
                                  </h4>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}

                      </div>
                    </div>
                  </div>

                  <div className=' p-0 sm:p-3 rounded-lg mt-4 backdrop-blur'>
                    <div className='descriptions-wrapper'>
                      <span className='uppercase font-heading text-trax-white text-3xl font-bold'>About</span>
                    </div>
                    <div style={reveal(showDescription)}>
                      {video.description && (
                        <p className='text-trax-white mt-2 flex'>{video.description}</p>
                      )}
                      <span>
                        {activeTags && activeTags.length > 0 && (
                          <div className='flex flex-row gap-[5px] mt-4 overflow-auto'>
                            {activeTags.map((tag) => (
                              <span className='genre-tag-video' key={tag} style={{ marginRight: 5 }}>
                              {tag || 'tag'}
                            </span>
                            ))}
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                </TabPane>
              </Tabs>

              <Modal
                key="follow_performer"
                className="subscription-modal border border-[#282828]"
                open={showFollowModal}
                centered
                onOk={() => this.setState({ showFollowModal: false })}
                footer={null}
                title={null}
                onCancel={() => this.setState({ showFollowModal: false })}
              >
                <div className="text-trax-white mx-auto px-4 pb-6 pt-16 gap-4 flex flex-col">
                  <span className="flex justify-center uppercase font-heading font-extrabold text-5xl text-custom-green text-center">
                    Communication Consent
                  </span>
                  <span className="text-base px-4 text-center">By following, you'll allow us to share your name and email with {video?.performer?.name} so you can receive exclusive updates about new music, upcoming shows, and special announcements.</span>
                  <div className="flex justify-center mt-3">
                    <TraxButton
                      htmlType="button"
                      styleType="secondary"
                      buttonSize={isMobile ? "full" : "medium"}
                      buttonText="Follow"
                      disabled={!user._id || user.isPerformer}
                      onClick={() => this.handleFollow()}
                    />
                  </div>
                </div>
              </Modal>
              {/* <Modal
                key="tip_performer"
                className="ppv-purchase-common ppv-purchase-desktop"
                open={openTipModal}
                centered
                onOk={() => this.setState({ openTipModal: false })}
                footer={null}
                title={null}
                onCancel={() => this.setState({ openTipModal: false })}
              >
                <TipPerformerForm
                  user={user}
                  account={account}
                  performer={video.performer}
                  submiting={submiting}
                  onFinish={this.handleTip.bind(this)}
                />
              </Modal> */}
              <Modal
                key="progress"
                className="ppv-purchase-common ppv-purchase-desktop"
                open={openProgressModal}
                centered
                onOk={() => this.setState({ openProgressModal: false })}
                footer={null}
                title={null}
                onCancel={() => this.setState({ openProgressModal: false })}
              >
              {openProgressModal && (
                <PaymentProgress stage={tipProgress}  confetti={confetti}/>
              )}
              </Modal>
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
    updateBalance
  };
  export default connect(mapStates, mapDispatch)(ContentData);
