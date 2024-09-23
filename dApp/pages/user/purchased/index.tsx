import { ScrollListProduct } from '@components/product/scroll-list-item';
import { ScrollListVideo } from '@components/video/scroll-list-item';
import {PurchasedScrollListTicket} from '@components/ticket/purchased-scroll-list-item';
import { Layout, message, Tabs } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ICountry, IUIConfig, IUser
} from 'src/interfaces';
import {
  productService,
  utilsService,
  videoService,
  ticketService
} from 'src/services';
import UrlToggle from '../UrlToggle';

interface IProps {
  ui: IUIConfig;
  user: IUser;
  countries: ICountry[];
}
interface IStates {
  loading: boolean;
  currentPage: {
    video: number;
    product: number;
  };
  limit: number;
  videos: any[];
  totalVideos: number;
  music: any[];
  totalMusic: number;
  products: any[];
  totalProducts: number;
  tickets: any[],
  totalTickets: number;
  tab: string;
  countries: any;
  isMobile: boolean;
}

const initialState = {
  loading: false,
  currentPage: {
    video: 0,
    product: 0
  },
  limit: 12,
  videos: [],
  totalVideos: 0,
  products: [],
  totalProducts: 0,
  tickets: [],
  totalTickets: 0,
  tab: 'videos',
  countries: null,
  music: [],
  totalMusic: 0,
  isMobile: false
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

      this.setState({isMobile: window.innerWidth < 450});
      window.addEventListener('resize', this.updateMedia);

      this.setState({ countries: data.countries }, () => this.updateDataDependencies());

      return () => window.removeEventListener('resize', this.updateMedia);
    } else {
      this.updateDataDependencies();
    }
  }

  updateMedia = () => {
    this.setState({isMobile: window.innerWidth < 450});
  };

  updateDataDependencies() {
    this.getPurchasedVideos();
  }

  async handlePagechange(key: 'videos' | 'products' | 'tickets' | 'music') {
    const { currentPage } = this.state;
    this.setState({
      currentPage: { ...currentPage, [key]: currentPage[key] + 1 }
    });

    if (key === 'videos') {
      this.getPurchasedVideos();
    }
    if (key === 'music') {
      this.getPurchasedMusic();
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

  async getPurchasedVideos() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });

      const resp = await videoService.getPurchased({
        limit,
        offset: currentPage.video * limit
      });
      let filteredVideos = resp.data.data.filter(d => d.trackType === 'video');

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

  async getPurchasedMusic() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await videoService.getPurchased({
        limit,
        offset: currentPage.video * limit
      });

      let filteredMusic = resp.data.data.filter(d => d.trackType === 'audio');

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
    if (key === 'videos') {
      await this.getPurchasedVideos();
    }
    if (key === 'music') {
      await this.getPurchasedMusic();
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
      videos,
      totalVideos,
      products,
      totalProducts,
      tickets,
      totalTickets,
      tab,
      music,
      totalMusic,
      isMobile
    } = this.state;
    const { ui} = this.props;


    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Purchased`}</title>
        </Head>
        <div className="main-container pt-2 px-4">
          <div className='flex justify-start m-4 absolute top-12 right-0 z-[12] sm:relative sm:top-auto sm:right-auto'>
          {!isMobile && (
            <h1 className="library-page-heading">Purchased</h1>
          )}
            <UrlToggle checked={true}/>
          </div>

          <div className="user-account">
            <Tabs defaultActiveKey={tab || 'products'} size="large" onChange={this.onTabsChange.bind(this)}>
              <Tabs.TabPane tab="Videos" key="videos">
                <ScrollListVideo
                 items={videos.map((f) => f)}
                  loading={loading}
                  canLoadmore={totalVideos > videos.length}
                  loadMore={this.handlePagechange.bind(this, 'videos')}
                  notFoundText="No purchased videos found"
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Music" key="music">
                <ScrollListVideo
                  items={music.map((f) => f)}
                  loading={loading}
                  canLoadmore={totalMusic > music.length}
                  loadMore={this.handlePagechange.bind(this, 'videos')}
                  notFoundText="No purchased music found"
                />
              </Tabs.TabPane>
              {/* <Tabs.TabPane tab="Products" key="products">
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
              </Tabs.TabPane> */}
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
