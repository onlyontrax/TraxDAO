import { ScrollListPerformers } from '@components/performer/scroll-list';
import { ScrollListProduct } from '@components/product/scroll-list-item';
import { ScrollListVideo } from '@components/video/scroll-list-item';
import { Layout, message, Tabs } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ICountry, IUIConfig, IUser
} from 'src/interfaces';
import {
  performerService,
  productService,
  utilsService,
  videoService
} from 'src/services';
import UrlToggle from '../UrlToggle';
import styles from '../index.module.scss';

interface IProps {
  ui: IUIConfig;
  user: IUser;
  countries: ICountry[];
}
interface IStates {
  loading: boolean;
  currentPage: {
    performer: number;
    video: number;
    product: number;
  };
  limit: number;
  videos: any[];
  music: any[];
  totalMusic: number;
  totalVideos: number;
  performers: any[];
  totalPerformers: number;
  products: any[];
  totalProducts: number;
  tab: string;
  countries: any;
  isMobile: boolean;
}

const initialState = {
  loading: false,
  currentPage: {
    performer: 0,
    video: 0,
    product: 0
  },
  limit: 12,
  videos: [],
  music: [],
  totalVideos: 0,
  totalMusic: 0,
  performers: [],
  totalPerformers: 0,
  products: [],
  totalProducts: 0,
  tab: 'videos',
  countries: null,
  isMobile: false,
};

class FavouriteVideoPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  async getData() {
    try {
      await this.getBookmarkedVideos()
      const [countries] = await Promise.all([utilsService.countriesList()]);
      return {
        countries: countries?.data || []
      };
    } catch (e) {
      return {
        countries: []
      };
    }
  }

  state = initialState;

  async componentDidMount() {
    const { countries } = this.state;


    if (countries === null) {
      const data = await this.getData();

      this.setState({isMobile: window.innerWidth < 450});
      window.addEventListener('resize', this.updateMedia);

      this.setState({ countries: data.countries });

      return () => window.removeEventListener('resize', this.updateMedia);
    }
  }

  updateMedia = () => {
    this.setState({isMobile: window.innerWidth < 450});
  };

  async handlePagechange(key: 'videos' | 'products' | 'performers' | 'music') {
    const { currentPage } = this.state;
    this.setState({
      currentPage: { ...currentPage, [key]: currentPage[key] + 1 }
    });

    if (key === 'videos') {
      this.getBookmarkedVideos();
    }
    if (key === 'music') {
      this.getBookmarkedMusic();
    }
    if (key === 'products') {
      this.getBookmarkedProducts();
    }
    if (key === 'performers') {
      this.getBookmarkedPerformers();
    }
  }

  async onTabsChange(key: string) {
    this.setState({ ...initialState, tab: key });
    this.loadData(key);
  }

  async getBookmarkedMusic() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await videoService.getBookmarks({
        limit,
        offset: currentPage.video * limit
      });
      let filteredMusic = resp.data.data.filter(d => d.objectInfo.trackType === 'audio');

      this.setState(prevState => ({
        music: currentPage.video === 0 ? filteredMusic : [...prevState.music, ...filteredMusic],
        totalMusic: resp.data.total
      }));
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedVideos() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await videoService.getBookmarks({
        limit,
        offset: currentPage.video * limit
      });
      let filteredVideos = resp.data.data.filter(d => d.objectInfo.trackType === 'video');

      this.setState(prevState => ({
        videos: currentPage.video === 0 ? filteredVideos : [...prevState.videos, ...filteredVideos],
        totalVideos: resp.data.total
      }));
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedProducts() {
    const { currentPage, limit, products } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await productService.getBookmarked({
        limit,
        offset: currentPage.product * limit
      });
      this.setState({
        products: [...products, ...resp.data.data],
        totalProducts: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedPerformers() {
    const { currentPage, limit, performers } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await performerService.getBookmarked({
        limit,
        offset: currentPage.performer * limit
      });

      this.setState({
        performers: [...performers, ...resp.data.data],
        totalPerformers: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async loadData(key: string) {
    if (key === 'videos') {
      await this.getBookmarkedVideos();
    }
    if (key === 'music') {
      await this.getBookmarkedMusic();
    }
    if (key === 'products') {
      await this.getBookmarkedProducts();
    }
    if (key === 'performers') {
      await this.getBookmarkedPerformers();
    }
  }


  render() {
    const {
      loading,
      videos,
      totalVideos,
      totalMusic,
      performers,
      totalPerformers,
      products,
      totalProducts,
      tab,
      music,
      countries,
      isMobile
    } = this.state;
    const { ui } = this.props;

    return (
      <Layout className={styles.pagesUserBookmarksModule}>
        <Head>
          <title>{`${ui?.siteName} | Saved`}</title>
        </Head>
        <div className="main-container pt-2 px-3 md:px-8">
          <div className=''>
            {!isMobile && (
              <h1 className="content-heading">Library</h1>
            )}
            <UrlToggle checked={false}/>
          </div>
          <div className="user-account">
            <Tabs defaultActiveKey={tab || 'videos'} size="large" onChange={this.onTabsChange.bind(this)}>
            <Tabs.TabPane tab="Videos" key="videos">
                <ScrollListVideo
                isProfileGrid={false}
                  items={videos.map((f) => f.objectInfo)}
                  loading={loading}
                  canLoadmore={totalVideos > videos.length}
                  loadMore={this.handlePagechange.bind(this, 'videos')}
                  notFoundText="No bookmarked videos found"
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Music" key="music">
                <ScrollListVideo
                isProfileGrid={false}
                  items={music.map((f) => f.objectInfo)}
                  loading={loading}
                  canLoadmore={totalMusic > music.length}
                  loadMore={this.handlePagechange.bind(this, 'music')}
                  notFoundText="No bookmarked music found"
                />
              </Tabs.TabPane>

            </Tabs>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapState = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});
export default connect(mapState)(FavouriteVideoPage);
