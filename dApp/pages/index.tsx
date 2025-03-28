import { SplideBanner } from '@components/common';
import {
  bannerService, streamService} from '@services/index';
import {
  Layout, Modal, message, Spin
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import {
  IBanner, ISettings, IStream, IUIConfig, IUser
} from 'src/interfaces';
import FeedContainer from '@components/common/FeedContainer';

interface IProps {
  banners: IBanner[];
  streams: IStream[];
  ui: IUIConfig;
  settings: ISettings;
  user: IUser;
  getContentFeeds: Function;
  moreContentFeeds: Function;
  feedState: any;
  removeFeedSuccess: Function;
  from: String;
}

class ExplorePage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  // moved countries and featuredArtist to FeedContainer
  async getData() {
    try {
      const [banners, streams] = await Promise.all([
        bannerService.search({ limit: 99 }),
        streamService.search({ limit: 99 })
      ]);
      return {
        banners: banners?.data?.data || [],
        streams: streams?.data?.data || []
      };
    } catch (e) {
      return {
        banners: [],
        streams: []
      };
    }
  }

  state = {
    itemPerPage: 12,
    feedPage: 0,
    limit: 30,
    offset: 0,
    hasMore: true,
    sortBy: 'latest',

    //loadingPerformer: false,
    //randomPerformers: [],
    orientation: '',
    keyword: '',
    openCardModal: false,
    isGrid: true,
    banners: null,
    streams: null,
    cards: null,
  };

  async componentDidMount() {
    const data = await this.getData();
    this.setState({
      banners: data.banners,
      streams: data.streams
    })
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

  // async getPerformers() {
  //   const { user } = this.props;
  //   try {
  //     await this.setState({ loadingPerformer: true });
  //     const performers = await (await performerService.randomSearch()).data.data;
  //     this.setState({
  //       randomPerformers: performers.filter((p) => p._id !== user._id),
  //       loadingPerformer: false
  //     });
  //   } catch {
  //     this.setState({ loadingPerformer: false });
  //   }
  // }

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

  //loadMoreTracks function has been moved to the FeedContainer
  //loadTracks function has been moved to the FeedContainer
  //loadVideoHero function has been moved to the FeedContainer

  render() {
    const { ui, settings } = this.props;
    const { banners, cards } = this.state;
    if (banners === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-40 m-auto'/></div>;
    }

    const topBanners = banners && banners.length > 0 && banners.filter((b) => b.position === 'top');
    return (
      <Layout>
        <>
          <Head>
            <title>{`${ui?.siteName || "Home"}`}</title>
          </Head>
          <div className="home-page " style={{width: '100%'  }}>
            <SplideBanner banners={topBanners}/>
            <FeedContainer options={{ type: 'homepage', genresTag: 'homepage' }} />
          </div>
        </>
      </Layout>
    );
  }
}

export default ExplorePage;
