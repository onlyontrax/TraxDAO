/* eslint-disable react/no-unused-prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { connect } from 'react-redux';
import FeedForm from '@components/post/form';
import {
  CameraIcon, MusicNoteIcon, ShoppingBagIcon, SpeakerphoneIcon, VideoCameraIcon, PlayIcon
} from '@heroicons/react/solid';
import { IPerformer, ISettings, IUIConfig } from '@interfaces/index';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';
import {BsFillTicketPerforatedFill} from 'react-icons/bs';
import {PiVinylRecordFill} from 'react-icons/pi';


interface IProps {
  ui: IUIConfig;
  user: IPerformer;
  settings: ISettings;
}

class CreatePost extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    createPost: false
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user || !user.verifiedDocument) {
      message.warning('Your Identity has not been verified yet! You can\'t post any content right now. Please to to Account settings to verify your account.');
      Router.back();
    }
  }

  render() {
    const { ui, user } = this.props;
    const { createPost } = this.state;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | New Post`}</title>
        </Head>
        <div className="main-container">
          <div className="post-header-wrapper">
          </div>
          <div className="content-placement-wrapper">
            {!createPost ? (
              <div className="story-switch-type">
                <div className="post-wrapper-wrapper">
                  <div className="post-wrapper" onClick={() => this.setState({ createPost: true })}>
                    <div aria-hidden className="type-item left">
                      <span>
                        <CameraIcon className="shopping-bag-icon"/>
                      </span>
                    </div>
                    <div className="post-type-info-wrapper">
                      <h2>Feed Post</h2>
                      <p>Let your fans know what you&apos;re up to</p>
                    </div>
                  </div>
                  <Link href="/artist/my-video/upload">
                    <div className="post-wrapper">
                      <div aria-hidden className="type-item middle">
                        <span>
                          <MusicNoteIcon className="shopping-bag-icon"/>
                        </span>
                      </div>
                      <div className="post-type-info-wrapper">
                        <h2>Track</h2>
                        <p>Upload a track to your store</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/artist/my-store/create">
                    <div className="post-wrapper">
                      <div aria-hidden className="type-item middle">
                        <span>
                          <ShoppingBagIcon className="shopping-bag-icon" />
                        </span>
                      </div>
                      <div className="post-type-info-wrapper">
                        <h2>Product </h2>
                        <p>Add a product to your store</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/artist/my-events/create">
                    <div className="post-wrapper" >
                      <div aria-hidden className="type-item right">
                        <span>
                          <BsFillTicketPerforatedFill style={{position: 'relative', top: '1px', left: '1px', fontSize: '25px'}}/>
                        </span>
                      </div>
                      <div className="post-type-info-wrapper">
                        <h2>Tickets</h2>
                        <p>Release tickets for your latest event</p>
                      </div>
                    </div>
                  </Link>
                    {/* <div className="post-wrapper-disabled">
                      <div aria-hidden className="type-item middle">
                        <span>
                          <PlayIcon />
                        </span>
                      </div>
                      <div className="post-type-info-wrapper">
                        <h2>NFT Tickets</h2>
                        <p>Add a song/ticket nft to marketplace</p>
                      </div>
                    </div>
                  <div className="post-wrapper-disabled" >
                    <div aria-hidden className="type-item middle">
                      <span>
                        <PiVinylRecordFill style={{position: 'relative', top: '1px', left: '1px', fontSize: '25px'}}/>
                      </span>
                    </div>
                    <div className="post-type-info-wrapper">
                      <h2>NFT Track</h2>
                      <p>Release a song as an NFT</p>
                    </div>
                  </div> */}
                </div>
              </div>
            ) : (
              <FeedForm performer={user} discard={() => this.setState({ createPost: false})} />
            )}
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui },
  user: { ...state.user.current },
  settings: { ...state.settings }
});
export default connect(mapStates)(CreatePost);
