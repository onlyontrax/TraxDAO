
import { SplideBanner } from '@components/common';
import FeedCard from '@components/post/post-card';
import { getContentFeeds, moreContentFeeds, removeFeedSuccess } from '@redux/feed/actions';
import {
  bannerService, featuredArtistsService, feedService, performerService, streamService, utilsService
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
import VideoSearch from '@components/video/Video-search';
import {Carousel, Card} from '@components/ui/apple-cards-carousel'
import Image from 'next/image'



const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-trax-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          >
            <p className="text-trax-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                The first rule of Apple club is that you boast about Apple club.
              </span>{" "}
              Keep a journal, quickly jot down a grocery list, and take amazing
              class notes. Want to convert those notes to text? No problem.
              Langotiya jeetu ka mara hua yaar is ready to capture every
              thought.
            </p>
            {/* <Image
              src="/static/deijuvhs.jpg"
              alt="Macbook mockup from Aceternity UI"
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
            /> */}
            <div
              style={{ backgroundImage: `url(/static/Enoch_exp.png)`}}
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain w-[500px] h-[500px]"
            />
            </div>
        );
      })}
    </>
  );
};

const items = [
  {
    category: "HipHop/Rap",
    title: "GOLDLINK",
    src: "/static/Enoch_exp.png",
    content: <DummyContent />,
    profileUrl: "goldlink"
  },
  {
    category: "Drill",
    title: "BLANCO",
    src: "/static/BLANCO.png",
    content: <DummyContent />,
    profileUrl: "blanco"
  },
  {
    category: "Alternative Rap",
    title: "MASTER PEACE",
    src: "/static/master-peace.jpg",
    content: <DummyContent />,
    profileUrl: "masterpeace"
  },
  {
    category: "Alternative",
    title: "WHITE LIES",
    src: "/static/whitelies.jpg",
    content: <DummyContent />,
    profileUrl: "/whitelies"
  },
  {
    category: "Alternative",
    title: "ALIEN BLAZE",
    src: "/static/alienBlaze.jpg",
    content: <DummyContent />,
    profileUrl: "/alienblaze"
  },
  {
    category: "R&B",
    title: "IMANI",
    src: "/static/IMANI.jpg",
    content: <DummyContent />,
    profileUrl: "/imani"
  },

];

// const items = [
//   {title: 'BLANCO', content: 'The first rule of Apple club is that you boast about Apple club. Keep a journal, quickly jot down a grocery list, and take amazing class notes. Want to convert those notes to text? No problem. Langotiya jeetu ka mara hua yaar is ready to capture every thought.', category: 'Hip Hop/Rap', src: '/static/deijuvhs.jpg', },
//   {title: 'GOLDLINK', content: 'The first rule of Apple club is that you boast about Apple club. Keep a journal, quickly jot down a grocery list, and take amazing class notes. Want to convert those notes to text? No problem. Langotiya jeetu ka mara hua yaar is ready to capture every thought.', category: 'Hip Hop/Rap', src: '/static/deijuvhs.jpg', },
//   {title: 'WHITE LIES', content: 'The first rule of Apple club is that you boast about Apple club. Keep a journal, quickly jot down a grocery list, and take amazing class notes. Want to convert those notes to text? No problem. Langotiya jeetu ka mara hua yaar is ready to capture every thought.', category: 'Alternative', src: '/static/deijuvhs.jpg', },
//   {title: 'LEWIS KNAGGS', content: 'The first rule of Apple club is that you boast about Apple club. Keep a journal, quickly jot down a grocery list, and take amazing class notes. Want to convert those notes to text? No problem. Langotiya jeetu ka mara hua yaar is ready to capture every thought.', category: 'Alternative', src: '/static/deijuvhs.jpg', },
//   {title: 'MASTERPEACE', content: 'The first rule of Apple club is that you boast about Apple club. Keep a journal, quickly jot down a grocery list, and take amazing class notes. Want to convert those notes to text? No problem. Langotiya jeetu ka mara hua yaar is ready to capture every thought.', category: 'Alternative Rap', src: '/static/deijuvhs.jpg', },
// ]


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
      const [banners, featuredArtists, countries, streams] = await Promise.all([
        bannerService.search({ limit: 99 }),
        featuredArtistsService.search({ limit: 99 }),
        utilsService.countriesList(),
        streamService.search({ limit: 99 })
      ]);
      return {
        banners: banners?.data?.data || [],
        featuredArtists: featuredArtists.data?.data || [],
        countries: countries?.data || [],
        streams: streams?.data?.data || []
      };
    } catch (e) {
      return {
        banners: [],
        featuredArtists: [],
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
    featuredArtists: null,
    countries: null,
    streams: null,
    cards: null
  };

  async componentDidMount() {
    const { countries } = this.state;
    if (countries === null) {
      const data = await this.getData();
      this.setState({
        banners: data.banners,
        featuredArtists: data.featuredArtists,
        countries: data.countries,
        streams: data.streams
      }, () => this.updateDataDependencies());
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
    const { banners, cards, featuredArtists } = this.state;
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
          <div className="home-page sm:-mt-[55px] " style={{ margin: 'auto', width: '100%'  }}>

            {/* <BannerNew banners={topBanners} /> */}
            <div className='p-4 pt-[4.5rem] sm:p-0'>
              <SplideBanner banners={topBanners}/>

            </div>

            <div className="feed-container main-container">
              <div className="home-container">

                <div className="left-explore-container">
                <Carousel items={featuredArtists} />
                  <VideoSearch/>
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
