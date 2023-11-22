import { connect } from 'react-redux';
import { PerformerAdvancedFilter } from '@components/common/base/performer-advanced-filter';
import PerformerGridCard from '@components/performer/grid-card';
import styles from '@components/performer/performer.module.scss';
import {
  Col, Layout, Pagination, Row, Spin, message
} from 'antd';
import Link from 'next/link';
import Head from 'next/head';
import { PureComponent } from 'react';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { IUIConfig } from 'src/interfaces/';
import { performerService, utilsService } from 'src/services';

interface IProps {
  ui: IUIConfig;
  countries: any;
  musicInfo: any;
}

class Performers extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  async getData() {
    try {
      const [countries, musicInfo] = await Promise.all([utilsService.countriesList(), utilsService.musicInfo()]);
      return {
        countries: countries?.data || [],
        musicInfo: musicInfo?.data
      };
    } catch (e) {
      return {
        countries: [],
        musicInfo: null
      };
    }
  }

  state = {
    offset: 0,
    limit: 15,
    filter: {
      sortBy: 'latest'
    } as any,
    trendingArtistsFilter: {
      sortBy: 'popular'
    } as any,
    recentlyJoinedFilter: {
      sortBy: 'latest'
    } as any,
    performers: [],
    total: 0,
    fetching: true,
    trendingPerformers: [],
    recentlyJoinedPerformers: [],
    isSearchEmpty: true,
    countries: null,
    musicInfo: null
  };

  async componentDidMount() {
    const { countries } = this.state;
    if (countries === null) {
      const data = await this.getData();

      this.setState({ musicInfo: data.musicInfo, countries: data.countries }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {
    const { filter, limit } = this.state;
    this.getPerformers(0, filter, limit);
    this.getTopPerformers();
    this.getRecentlyJoinedPerformers();
  }

  handleFilter(values: any) {

    const { filter, limit } = this.state;
    const f = { ...filter, ...values };
    this.setState({ offset: 0, filter: f });
    this.getPerformers(0, f, limit);
  }

  changeEmptySearchBar(bool){
    this.setState({isSearchEmpty: bool})
  }

  async getTopPerformers() {
    const { trendingArtistsFilter } = this.state;
    try {
      this.setState({ fetching: true });
      const limit = 6;
      const resp = await performerService.search({
        limit,
        ...trendingArtistsFilter
      });
      this.setState({ trendingPerformers: resp.data.data });
    } catch {
      message.error('Error occured, please try again later');
      this.setState({ fetching: false });
    }
  }

  async getRecentlyJoinedPerformers() {
    const { recentlyJoinedFilter } = this.state;
    try {
      const limit = 20;
      this.setState({ fetching: true });
      const resp = await performerService.search({
        limit,
        ...recentlyJoinedFilter
      });
      const result = [];
      for (let i = 0; i < resp.data.data.length; i += 1) {
        if (resp.data.data[i].avatar !== '' || resp.data.data[i].cover !== '') {
          result.push(resp.data.data[i]);
        }
        if (result.length > 8) {
          break;
        }
      }
      this.setState({ recentlyJoinedPerformers: result });
    } catch {
      message.error('Error occured, please try again later');
      this.setState({ fetching: false });
    }
  }

  async getPerformers(offset: any, filter: any, limit: any) {

    try {
      this.setState({ fetching: true });
      const resp = await performerService.search({
        limit,
        ...filter,
        offset: limit * offset
      });

      this.setState({ performers: resp.data.data, total: resp.data.total, fetching: false });
    } catch {
      message.error('Error occured, please try again later');
      this.setState({ fetching: false });
    }
  }

  pageChanged = (page: number) => {
    const { filter, limit } = this.state;
    this.setState({ offset: page - 1 });
    this.getPerformers(page - 1, filter, limit);
  };

  render() {
    const { ui } = this.props;
    const { countries, musicInfo } = this.state;
    const {
      limit, offset, performers, fetching, total, trendingPerformers, recentlyJoinedPerformers, isSearchEmpty
    } = this.state;

    if (countries === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }

    return (
      <Layout className={styles.componentsPerformerVerificationFormModule}>
        <Head>
          <title>{`${ui?.siteName} | Artists`}</title>
        </Head>
        <div className="main-container" style={{maxWidth: 'unset', width: '95% !important'}}>
          <div className="artist-explore-wrapper">
            <div className="explore-sidebar">
              <PerformerAdvancedFilter
                onSubmit={this.handleFilter.bind(this)}
                countries={countries}
                musicInfo={musicInfo}
                onSearch={this.changeEmptySearchBar.bind(this)}
              />
            </div>
            <div className="explore-main">
              {isSearchEmpty && (
                <>
              <div className="trending-artists-container">
                <p className="trending-artists-header">Trending</p>
                <div className="trending-artists-wrapper">
                  {trendingPerformers.map((artist) => (
                    <div key={artist._id} className="t-artist-wrapper">
                      <Link
                        href={`/artist/profile?id=${artist?.username || artist?._id}`}
                        as={`/artist/profile?id=${artist?.username || artist?._id}`}
                        style={{ cursor: 'pointer' }}
                        className="t-artist-link"
                      >
                        <div className="t-artist-thumb">
                          <div className="t-artist-bg" style={{ backgroundImage: `url( ${artist?.cover || '/static/no-avatar.png'} )` }} />
                          <div className='t-artist-bg-filter'/>
                        </div>
                        <div className="t-artist-info-wrapper">
                          <div className="t-artist-avatar-wrapper">
                            <div className="t-artist-avatar" style={{ backgroundImage: `url( ${artist?.avatar || '/static/no-avatar.png'} )` }} />
                          </div>
                          <div className="artist-names-wrapper">
                            <p className="t-artist-title">
                              { artist?.name }
                              <span>
                                { artist?.verifiedAccount && <BadgeCheckIcon className="recently-joined-v-badge" /> }
                              </span>
                            </p>
                            <p className="t-artist-artist">
                              @
                              { artist?.username }
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="new-joined-container">
                <p className="new-joined-header">Recently Joined</p>
                <div className="new-joined-wrapper">
                  {recentlyJoinedPerformers.map((artist) => (
                    <div key={artist._id} className="new-join-wrapper">
                      <Link
                        href={`/artist/profile?id=${artist?.username || artist?._id}`}
                        as={`/artist/profile?id=${artist?.username || artist?._id}`}
                        style={{ cursor: 'pointer' }}
                        className="new-join-link"
                      >
                        <div className="new-join-thumb">
                          <div className="new-join-bg" style={{ backgroundImage: `url(${artist?.avatar || artist?.cover})` }} />
                        </div>
                        <div className="join-info-wrapper">
                          <p className="join-title">
                            { artist.name }
                            <span>
                              { artist?.verifiedAccount && <BadgeCheckIcon className="recently-joined-v-badge" /> }
                            </span>
                          </p>
                          <p className="join-artist">
                            @
                            { artist.username }
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              </>
              )}
              <div className="header-artists">
                <span>Discover</span>
              </div>
              <Row>
                {performers
                  && performers.length > 0
                  && performers.map((p) => (
                    <Col xs={10} sm={6} md={5} lg={4} key={p._id}>
                      <PerformerGridCard performer={p} countries={countries} />
                    </Col>
                  ))}
              </Row>
              {!total && !fetching && (
                <p className="text-center" style={{ margin: 20 }}>
                  No profile was found
                </p>
              )}
              {fetching && (
                <div className="text-center" style={{ margin: 30 }}>
                  <Spin />
                </div>
              )}
              {total && total > limit ? (
                <Pagination
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: 'auto'
                  }}
                  defaultCurrent={offset + 1}
                  total={total}
                  pageSize={limit}
                  onChange={this.pageChanged}
                />
              ) : null}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui }
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(Performers);
