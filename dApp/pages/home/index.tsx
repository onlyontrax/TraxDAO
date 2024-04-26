import { SearchOutlined } from '@ant-design/icons';
import { Banner } from '@components/common';
import HomeFooter from '@components/common/layout/footer';
import { HomePerformers } from '@components/performer';
import ScrollListFeed from '@components/post/scroll-list';

import { getFeeds, moreFeeds, removeFeedSuccess } from '@redux/feed/actions';

import { getContentFeeds, moreContentFeeds } from '@redux/feed/actions';


import {
  bannerService, feedService, performerService, streamService, utilsService
} from '@services/index';
import { Alert, Layout, message, Spin } from 'antd';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IBanner, ICountry, IFeed, IPerformer, ISettings, IStream, IUIConfig, IUser
} from 'src/interfaces';
import TrendingTracks from '@components/video/trending-tracks';
import styles from './index.module.scss';

const StreamListItem = dynamic(() => import('@components/streaming/stream-list-item'), { ssr: false });

interface IProps {
  countries: ICountry[];
  banners: IBanner[];
  streams: IStream[];
  ui: IUIConfig;
  settings: ISettings;
  user: IUser;
  performers: IPerformer[];
  getFeeds: Function;
  getContentFeeds: Function;
  moreFeeds: Function;
  moreContentFeeds: Function;
  feedState: any;
  contentFeedState: any;
  removeFeedSuccess: Function;
  all: any;
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  const bodyHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom <= bodyHeight + 250;
}

class HomePage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  async getData() {
    try {
      const [banners, countries, streams] = await Promise.all([
        bannerService.search({ limit: 99 }),
        utilsService.countriesList(),
        streamService.search({ limit: 99 })
      ]);
      return {
        banners: banners?.data?.data || [],
        countries: countries?.data || [],
        streams: streams?.data?.data || []
      };
    } catch (e) {
      return {
        banners: [],
        countries: [],
        streams: []
      };
    }
  }

  state = {
    itemPerPage: 12,
    feedPage: 0,
    loadingPerformer: false,
    isFreeSubscription: '',
    randomPerformers: [],
    orientation: '',
    keyword: '',
    openSearch: false,
    showFooter: false,
    banners: null,
    countries: null,
    streams: null,
    feedType: 'for-you'
  };

  async componentDidMount() {
    const { countries } = this.state;
    if (countries === null) {
      const data = await this.getData();

      this.setState({ banners: data.banners, countries: data.countries, streams: data.streams }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {
    this.getPerformers();
    this.getFeeds();
    this.getContentFeeds();
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  // eslint-disable-next-line react/sort-comp
  handleScroll = () => {
    const footer = document.getElementById('main-footer');
    if (isInViewport(footer)) {
      this.setState({ showFooter: false });
    } else {
      this.setState({ showFooter: true });
    }
  };

  async onDeleteFeed(feed: IFeed) {
    const { removeFeedSuccess: handleRemoveFeed } = this.props;
    if (!window.confirm('All earnings related to this post will be refunded. Are you sure to remove it?')) return;
    try {
      await feedService.delete(feed._id);
      message.success('Post deleted successfully');
      handleRemoveFeed({ feed });
    } catch (e) {
      message.error('Something went wrong, please try again later');
    }
  }

  async getFeeds() {
    const { getFeeds: handleGetFeeds, user } = this.props;
    const {
      itemPerPage, feedPage, keyword, orientation
    } = this.state;
    handleGetFeeds({
      q: keyword,
      orientation,
      limit: itemPerPage,
      offset: itemPerPage * feedPage,
      isHome: !!user.verifiedEmail
    });
  }

  async getContentFeeds() {
    const { getContentFeeds: handleGetFeeds } = this.props;
    const {
      itemPerPage, feedPage, keyword, orientation
    } = this.state;
    handleGetFeeds({
      q: keyword,
      orientation,
      limit: itemPerPage,
      offset: itemPerPage * feedPage
    });
  }

  async getPerformers() {
    const { isFreeSubscription } = this.state;
    const { user } = this.props;
    try {
      await this.setState({ loadingPerformer: true });
      const performers = await (await performerService.randomSearch({ isFreeSubscription })).data.data;
      this.setState({
        randomPerformers: performers.filter((p) => p._id !== user._id),
        loadingPerformer: false
      });
    } catch {
      this.setState({ loadingPerformer: false });
    }
  }

  async loadmoreFeeds() {
    const { feedState, moreFeeds: handleGetMore, user } = this.props;
    const { items: posts, total: totalFeeds } = feedState;
    const { feedPage, itemPerPage } = this.state;
    if (posts.length >= totalFeeds) return;
    this.setState({ feedPage: feedPage + 1 }, () => {
      handleGetMore({
        limit: itemPerPage,
        offset: (feedPage + 1) * itemPerPage,
        isHome: !!user.verifiedEmail
      });
    });
  }

  async loadmoreContentFeeds() {
    const { contentFeedState, moreContentFeeds: handleGetMore } = this.props;
    const { items: posts, total: totalContentFeeds } = contentFeedState;
    const { feedPage, itemPerPage } = this.state;
    if (posts.length >= totalContentFeeds) return;
    this.setState({ feedPage: feedPage + 1 }, () => {
      handleGetMore({
        limit: itemPerPage,
        offset: (feedPage + 1) * itemPerPage
      });
    });
  }

  render() {
    const { randomPerformers, loadingPerformer, showFooter, banners, countries, streams, feedType } = this.state;
    if (countries === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    const {
      ui, feedState, contentFeedState, user, settings, all
    } = this.props;

    const { items: feeds, total: totalFeeds, requesting: loadingFeed } = feedState;
    const { items: contentFeeds, total: totalContentFeeds, requesting: loadingContentFeed } = contentFeedState;
    // const topBanners = banners && banners.length > 0 && banners.filter((b) => b.position === 'top');
    return (
      <div className={styles.pagesHomeModule}>
        <Layout>
          <>
            <Head>
              <title>{`${ui?.siteName} | Home`}</title>
            </Head>
            <div className="home-page" style={{ background: '#00000000', width: '100%', margin: 'auto', maxWidth: '1400px' }}>
              <div className="feed-container">
                {/* <div className="home-top-container">
                  <div className="top-container">
                    <TrendingTracks />
                  </div>
                </div> */}
                <div className="home-container">
                  <div className="left-container">
                    {user._id && !user.verifiedEmail && settings.requireEmailVerification && (
                      <Link href={user.isPerformer ? '/artist/account' : '/user/account'}>
                        <Alert
                          type="error"
                          style={{ margin: '15px 0', textAlign: 'center' }}
                          message="Please verify your email address, click here to update!"
                        />
                      </Link>
                    )}
                    {streams?.length > 0 && (
                      <div className="visit-history">
                        <div className="top-story">
                          <a>Live Videos</a>
                          <Link href="/artist">
                            <small>View all</small>
                          </Link>
                        </div>
                        <div className="story-list">
                          {streams.length > 0
                            && streams.map((s) => <StreamListItem stream={s} user={user} key={s._id} />)}
                        </div>
                      </div>
                    )}
                    
                    <div className='feed-title'>
                      <span  onClick={()=> this.setState({feedType: 'for-you'})} className={`${feedType === 'for-you' && 'selected'} feed-btn`}>For you</span>
                      <span onClick={()=> this.setState({feedType: 'trending'})} className={`${feedType === 'trending' && 'selected'} feed-btn`}>Discover</span>
                    </div>
                    {feedType === 'for-you' ? (
                      <>
                        <ScrollListFeed
                          items={feeds}
                          canLoadmore={feeds && feeds.length < totalFeeds}
                          loading={loadingFeed}
                          onDelete={this.onDeleteFeed.bind(this)}
                          loadMore={this.loadmoreFeeds.bind(this) }
                        />
                        {!loadingFeed && !totalFeeds && (
                          <div className="main-container custom text-center" style={{ margin: 'auto' }}>
                            <Alert
                              type="warning"
                              message={(
                                <Link href="/artist">
                                  <SearchOutlined />
                                  {' '}
                                  Find someone to follow
                                </Link>
                              )}
                            />
                          </div>
                        )}
                      </>
                    ):(
                      <>
                        <ScrollListFeed
                          items={contentFeeds}
                          canLoadmore={contentFeeds && contentFeeds.length < totalContentFeeds}
                          loading={loadingContentFeed}
                          onDelete={this.onDeleteFeed.bind(this)}
                          loadMore={this.loadmoreContentFeeds.bind(this)}
                        />
                        {!loadingContentFeed && !totalContentFeeds && (
                          <div className="main-container custom text-center" style={{ margin: 'auto' }}>
                            <Alert
                              type="warning"
                              message={(
                                <Link href="/artist">
                                  <SearchOutlined />
                                  {' '}
                                  Could not load trending feed. Refresh the page.
                                </Link>
                              )}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="right-container" id="home-right-container">
                    <div className="suggestion-bl">
                      <div className="sug-top">
                        Suggested artists
                      </div>
                      <HomePerformers countries={countries} performers={randomPerformers} />
                      {!loadingPerformer && !randomPerformers?.length && (
                        <p className="text-center">No profile was found</p>
                      )}
                      <div style={{ display: 'none' }} className={!showFooter ? 'home-footer' : 'home-footer active'}>
                        <HomeFooter customId="home-footer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </Layout>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current },
  feedState: { ...state.feed.feeds },
  all: { ...state },
  contentFeedState: { ...state.feed.contentFeeds },
  settings: { ...state.settings }
});

const mapDispatch = {
  getFeeds,
  moreFeeds,
  removeFeedSuccess,
  getContentFeeds,
  moreContentFeeds
};
export default connect(mapStates, mapDispatch)(HomePage);
