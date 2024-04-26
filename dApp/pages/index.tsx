import { SearchOutlined } from '@ant-design/icons';
import { BannerNew } from '@components/common';
import  Carousel  from '@components/common/banner-new-new';
import ExploreListFeed from '@components/post/explore-list';
import FeedCard from '@components/post/post-card';
import { getContentFeeds, moreContentFeeds, removeFeedSuccess } from '@redux/feed/actions';
import {
  bannerService, feedService, performerService, streamService, utilsService
} from '@services/index';
import {
  Alert, Layout, Modal, message, Spin
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IBanner, ICountry, IFeed, IPerformer, ISettings, IStream, IUIConfig, IUser
} from 'src/interfaces';
import HotTracks from '@components/video/hot-track';
import HotEvents from '@components/ticket/hot-events';
import NewReleases from '@components/video/new-releases';
import TrendingTracks from '@components/video/trending-tracks';

interface IProps {
  countries: ICountry[];
  banners: IBanner[];
  streams: IStream[];
  ui: IUIConfig;
  settings: ISettings;
  user: IUser;
  performers: IPerformer[];
  getContentFeeds: Function;
  moreContentFeeds: Function;
  feedState: any;
  removeFeedSuccess: Function;
  from: String;
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  const bodyHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom <= bodyHeight + 250;
}

class ExplorePage extends PureComponent<IProps> {
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
    randomPerformers: [],
    orientation: '',
    keyword: '',
    openSearch: false,
    showFooter: false,
    openCardModal: false,
    isGrid: true,
    banners: null,
    countries: null,
    streams: null
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
    const { user } = this.props;
    try {
      await this.setState({ loadingPerformer: true });
      const performers = await (await performerService.randomSearch()).data.data;
      this.setState({
        randomPerformers: performers.filter((p) => p._id !== user._id),
        loadingPerformer: false
      });
    } catch {
      this.setState({ loadingPerformer: false });
    }
  }

  async loadmoreFeeds() {
    const { feedState, moreContentFeeds: handleGetMore } = this.props;
    const { items: posts, total: totalFeeds } = feedState;
    const { feedPage, itemPerPage } = this.state;
    if (posts.length >= totalFeeds) return;
    this.setState({ feedPage: feedPage + 1 }, () => {
      handleGetMore({
        limit: itemPerPage,
        offset: (feedPage + 1) * itemPerPage
      });
    });
  }

  render() {
    const {
      ui, feedState, user, settings
    } = this.props;
    const { banners } = this.state;
    if (banners === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    const { items: feeds, total: totalFeeds, requesting: loadingFeed } = feedState;
    const topBanners = banners && banners.length > 0 && banners.filter((b) => b.position === 'top');
    const { openCardModal } = this.state;

    return (
      <Layout>
        <>
          <Head>
            <title>{`${ui?.siteName} | Explore`}</title>
          </Head>
          <div className="home-page" style={{ background: '#00000000', maxWidth: '1400px', margin: 'auto', width: '100%'  }}>
            {/* <Banner banners={topBanners} /> */}
            <BannerNew banners={topBanners} />
            {/* <Carousel/> */}
            <div className="feed-container main-container">
              <div className="home-container">
                <div className="left-explore-container">
                  <NewReleases />
                  <HotTracks />
                  {user._id && !user.verifiedEmail && settings.requireEmailVerification && (
                    <Link href={user.isPerformer ? '/artist/account' : '/user/account'}>
                      <Alert
                        type="error"
                        style={{ margin: '15px 0', textAlign: 'center' }}
                        message="Please verify your email address, click here to update!"
                      />
                    </Link>
                  )}
                  <HotEvents />
                  <TrendingTracks />
                  {/* <div className="header-explore">
                    <span>What&apos;s Happening</span>
                  </div>
                  <ExploreListFeed
                    items={feeds}
                    canLoadmore={feeds && feeds.length < totalFeeds}
                    loading={loadingFeed}
                    onDelete={this.onDeleteFeed.bind(this)}
                    loadMore={this.loadmoreFeeds.bind(this)}
                    fromExplore
                    isGrid
                  /> */}
                  {/* {!loadingFeed && !totalFeeds && (
                    <div className="main-container custom text-center" style={{ margin: 'auto' }}>
                      <Alert
                        type="warning"
                        className="follow-prompt"
                        message={(
                          <Link href="/artist">
                            <SearchOutlined />
                            {' '}
                            Find someone to follow
                          </Link>
                        )}
                      />
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </div>
          <Modal
            key="tip_performer"
            className="tip-modal"
            title={null}
            width={1000}
            open={openCardModal}
            footer={null}
            onCancel={() => this.setState({ openCardModal: false })}
          >
            <div className="main-container custom">
              <FeedCard feed={feeds} />
            </div>
          </Modal>
        </>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current },
  feedState: { ...state.feed.feeds },
  settings: { ...state.settings }
});

const mapDispatch = {
  getContentFeeds,
  moreContentFeeds,
  removeFeedSuccess
};
export default connect(mapStates, mapDispatch)(ExplorePage);
