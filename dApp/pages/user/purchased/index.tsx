import ScrollListFeed from '@components/post/scroll-list';
import { ScrollListProduct } from '@components/product/scroll-list-item';
import { ScrollListVideo } from '@components/video/scroll-list-item';
import {PurchasedScrollListTicket} from '@components/ticket/purchased-scroll-list-item';
import { Layout, message, Tabs } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ICountry, IFeed, IUIConfig, IUser
} from 'src/interfaces';
import {
  feedService,
  galleryService,
  productService,
  utilsService,
  videoService,
  ticketService
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
    video: number;
    product: number;
  };
  limit: number;
  videos: any[];
  totalVideos: number;
  galleries: any[];
  totalGalleries: number;
  products: any[];
  totalProducts: number;
  tickets: any[],
  totalTickets: number;
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
    video: 0,
    product: 0
  },
  limit: 12,
  videos: [],
  totalVideos: 0,
  galleries: [],
  totalGalleries: 0,
  products: [],
  totalProducts: 0,
  tickets: [],
  totalTickets: 0,
  tab: 'videos',
  countries: null
};

class PurchasedPage extends PureComponent<IProps, IStates> {
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
    this.getPurchasedVideos();
  }

  async handlePagechange(key: 'feeds' | 'videos' | 'galleries' | 'products' | 'tickets') {
    const { currentPage } = this.state;
    this.setState({
      currentPage: { ...currentPage, [key]: currentPage[key] + 1 }
    });

    if (key === 'feeds') {
      this.getPurchasedPosts();
    }
    if (key === 'videos') {
      this.getPurchasedVideos();
    }
    if (key === 'galleries') {
      this.getPurchasedGalleries();
    }
    if (key === 'products') {
      this.getPurchasedProducts();
    }
    if(key === 'tickets'){
      this.getPurchasedTickets();
    }
  }

  async onTabsChange(key: string) {
    await this.setState({ ...initialState, tab: key });
    this.loadData(key);
  }

  async getPurchasedPosts() {
    const { currentPage, limit, feeds } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await feedService.getPurchased({
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

  async getPurchasedVideos() {
    const { currentPage, limit, videos } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await videoService.getPurchased({
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

  async getPurchasedGalleries() {
    const { currentPage, limit, galleries } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await galleryService.getPurchased({
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

  async getPurchasedProducts() {
    const { currentPage, limit, products } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await productService.getPurchased({
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

  async getPurchasedTickets() {
    const { currentPage, limit, tickets } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await ticketService.getPurchased({
        limit,
        offset: currentPage.product * limit
      });
      this.setState({
        tickets: [...tickets, ...resp.data.data],
        totalTickets: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async loadData(key: string) {
    if (key === 'feeds' || undefined) {
      await this.getPurchasedPosts();
    }
    if (key === 'videos') {
      await this.getPurchasedVideos();
    }
    if (key === 'galleries') {
      await this.getPurchasedGalleries();
    }
    if (key === 'products') {
      await this.getPurchasedProducts();
    }
    if (key === 'tickets') {
      await this.getPurchasedTickets();
    }
  }

  render() {
    const {
      loading,
      feeds,
      totalFeeds,
      videos,
      totalVideos,
      products,
      totalProducts,
      tickets,
      totalTickets,
      tab,
      countries 
    } = this.state;
    const { ui} = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Purchased`}</title>
        </Head>
        <div className="main-container">
          <h1 className="library-page-heading" style={{marginBottom: '2rem'}}>Purchased</h1>
          <div className="user-account">
            <Tabs defaultActiveKey={tab || 'products'} size="large" onChange={this.onTabsChange.bind(this)}>
              <Tabs.TabPane tab="Posts" key="feeds">
                <div className="heading-tab">
                  <h4>
                    {totalFeeds > 0 && totalFeeds}
                    {' '}
                    {totalFeeds > 1 ? 'POSTS' : 'POST'}
                  </h4>
                </div>
                <ScrollListFeed
                  isGrid
                  items={feeds.map((f) => f.objectInfo)}
                  loading={loading}
                  canLoadmore={totalFeeds > feeds.length}
                  loadMore={this.handlePagechange.bind(this, 'feeds')}
                  notFoundText="No purchased posts found"
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Tracks" key="videos">
                <div className="heading-tab">
                  <h4>
                    {totalVideos > 0 && totalVideos}
                    {' '}
                    {totalVideos > 1 ? 'TRACKS' : 'TRACK'}
                  </h4>
                </div>
                <ScrollListVideo
                  items={videos.map((f) => f)}
                  loading={loading}
                  canLoadmore={totalVideos > videos.length}
                  loadMore={this.handlePagechange.bind(this, 'videos')}
                  notFoundText="No purchased videos found"
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Products" key="products">
                <div className="heading-tab">
                  <h4>
                    {totalProducts > 0 && totalProducts}
                    {' '}
                    {totalProducts > 1 ? 'PRODUCTS' : 'PRODUCT'}
                  </h4>
                </div>
                <ScrollListProduct
                  loading={loading}
                  items={products.map((p) => p)}
                  canLoadmore={totalProducts > products.length}
                  loadMore={this.handlePagechange.bind(this, 'products')}
                  notFoundText="No purchased products found"
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Tickets" key="tickets">
                <div className="heading-tab">
                  <h4>
                    {totalTickets > 0 && totalTickets}
                    {' '}
                    {totalTickets > 1 ? 'TICKETS' : 'TICKET'}
                  </h4>
                </div>
                <PurchasedScrollListTicket
                  loading={loading}
                  items={tickets.map((p) => p)}
                  canLoadmore={totalTickets > tickets.length}
                  loadMore={this.handlePagechange.bind(this, 'tickets')}
                  notFoundText="No purchased tickets found"
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
export default connect(mapState)(PurchasedPage);
