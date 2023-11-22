import { ScrollListPerformers } from '@components/performer/scroll-list';
import ScrollListFeed from '@components/post/scroll-list';
import { ScrollListProduct } from '@components/product/scroll-list-item';
import { ScrollListVideo } from '@components/video/scroll-list-item';
import { Layout, message, Tabs, Spin } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ICountry, IFeed, IUIConfig, IUser
} from 'src/interfaces';
import {
  feedService,
  galleryService,
  performerService,
  productService,
  utilsService,
  videoService
} from 'src/services';
import styles from '../index.module.scss';

interface IProps {
  ui: IUIConfig;
  user: IUser;
  countries: ICountry[];
}
interface IStates {
  loading: boolean;
  feeds: any[];
  totalFeeds: number;
  currentPage: {
    feed: number;
    gallery: number;
    performer: number;
    video: number;
    product: number;
  };
  limit: number;
  videos: any[];
  totalVideos: number;
  galleries: any[];
  totalGalleries: number;
  performers: any[];
  totalPerformers: number;
  products: any[];
  totalProducts: number;
  tab: string;
  countries: any;
}

const initialState = {
  loading: false,
  feeds: [],
  totalFeeds: 0,
  currentPage: {
    feed: 0,
    gallery: 0,
    performer: 0,
    video: 0,
    product: 0
  },
  limit: 12,
  videos: [],
  totalVideos: 0,
  galleries: [],
  totalGalleries: 0,
  performers: [],
  totalPerformers: 0,
  products: [],
  totalProducts: 0,
  tab: 'feeds',
  countries: null
};

class FeedLibrary extends PureComponent<IProps, IStates> {
  static authenticate = true;

  async getData() {
    try {
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

      this.setState({ countries: data.countries }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {
    this.getBookmarkedPosts();
  }

  async handlePagechange(key: 'feeds' | 'videos' | 'galleries' | 'products' | 'performers') {
    const { currentPage } = this.state;
    this.setState({
      currentPage: { ...currentPage, [key]: currentPage[key] + 1 }
    });

    if (key === 'feeds') {
      this.getBookmarkedPosts();
    }
    if (key === 'videos') {
      this.getBookmarkedVideos();
    }
    if (key === 'galleries') {
      this.getBookmarkedGalleries();
    }
    if (key === 'products') {
      this.getBookmarkedProducts();
    }
    if (key === 'performers') {
      this.getBookmarkedPerformers();
    }
  }

  async onTabsChange(key: string) {
    await this.setState({ ...initialState, tab: key });
    this.loadData(key);
  }

  async onDeleteFeed(feed: IFeed) {
    const { user } = this.props;
    const { feeds } = this.state;
    if (user._id !== feed.fromSourceId) return;
    if (!window.confirm('All earnings related to this post will be refunded. Are you sure to remove it?')) return;
    try {
      await feedService.delete(feed._id);
      feeds.filter((f) => f._id !== feed._id);
      message.success('Post deleted successfully');
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Something went wrong, please try again later');
    }
  }

  async getBookmarkedPosts() {
    const { currentPage, limit, feeds } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await feedService.getBookmark({
        limit,
        offset: currentPage.feed * limit
      });
      this.setState({
        feeds: [...feeds, ...resp.data.data],
        totalFeeds: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedVideos() {
    const { currentPage, limit, videos } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await videoService.getBookmarks({
        limit,
        offset: currentPage.video * limit
      });
      this.setState({
        videos: [...videos, ...resp.data.data],
        totalVideos: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedGalleries() {
    const { currentPage, limit, galleries } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await galleryService.getBookmarks({
        limit,
        offset: currentPage.gallery * limit
      });
      this.setState({
        galleries: [...galleries, ...resp.data.data],
        totalGalleries: resp.data.total
      });
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
    if (key === 'feeds' || undefined) {
      await this.getBookmarkedPosts();
    }
    if (key === 'videos') {
      await this.getBookmarkedVideos();
    }
    if (key === 'galleries') {
      await this.getBookmarkedGalleries();
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
      feeds,
      totalFeeds,
      videos,
      totalVideos,
      performers,
      totalPerformers,
      products,
      totalProducts,
      tab,
      countries
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout className={styles.pagesUserBookmarksModule}>
        <Head>
          <title>{`${ui?.siteName} | Saved`}</title>
        </Head>
        <div className="main-container">
          <h1 className="library-page-heading">Posts</h1>
          <div className="user-account">
            <Tabs defaultActiveKey={tab || 'feeds'} size="large" onChange={this.onTabsChange.bind(this)}>
              <Tabs.TabPane  key="feeds">
                <div className="heading-tab">
                  <h4>
                    {totalFeeds > 0 && totalFeeds}
                    {' '}
                    {totalFeeds > 0 && (
                        <>
                        {totalFeeds > 1 ? 'Posts' : 'Post'}
                        </>
                    )}
                    
                  </h4>
                </div>
                <ScrollListFeed
                  isGrid
                  items={feeds.map((f) => f.objectInfo)}
                  loading={loading}
                  canLoadmore={totalFeeds > feeds.length}
                  onDelete={this.onDeleteFeed.bind(this)}
                  loadMore={this.handlePagechange.bind(this, 'feeds')}
                  notFoundText="No bookmarked posts found"
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
export default connect(mapState)(FeedLibrary);
