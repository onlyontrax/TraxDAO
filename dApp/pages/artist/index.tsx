import { connect } from 'react-redux';
import { PerformerAdvancedFilter } from '@components/common/base/performer-advanced-filter';
import PerformerGridCard from '@components/performer/grid-card';
import styles from '@components/performer/performer.module.scss';
import {
  Col, Layout, Pagination, Row, Spin, message
} from 'antd';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { PureComponent } from 'react';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { IUIConfig } from 'src/interfaces/';
import { performerService, utilsService } from 'src/services';

interface IProps {
  ui: IUIConfig;
  countries: any;
  musicInfo: any;
}


const genres = [
  { value: 'all', text: 'All' },
  { value: 'acoustic', text: 'Acoustic' },
  { value: 'alternative', text: 'Alternative' },
  { value: 'anime', text: 'Anime' },
  { value: 'ambient', text: 'Ambient' },
  { value: 'breakbeat', text: 'Breakbeat' },
  { value: 'classical', text: 'Classical' },
  { value: 'drum & base', text: 'Drum and base' },
  { value: 'drill', text: 'Drill' },
  { value: 'dance', text: 'Dance' },
  { value: 'dub', text: 'Dub' },
  { value: 'easy listening', text: 'Easy Listening' },
  { value: 'electronic', text: 'Electronic' },
  { value: 'electronica', text: 'Electronica' },
  { value: 'funk', text: 'Funk' },
  { value: 'garage', text: 'Garage' },
  { value: 'grime', text: 'Grime' },
  { value: 'hip-hop/rap', text: 'Hip-Hop/Rap' },
  { value: 'holiday', text: 'Holiday' },
  { value: 'house', text: 'House' },
  { value: 'indie pop', text: 'Indie Pop' },
  { value: 'jazz', text: 'Jazz' },
  { value: 'jungle', text: 'Jungle' },
  { value: 'k-pop', text: 'K-Pop' },
  { value: 'latin', text: 'Latin' },
  { value: 'lo-fi', text: 'Lo-fi' },
  { value: 'metal', text: 'Metal' },
  { value: 'opera', text: 'Opera' },
  { value: 'pop', text: 'Pop' },
  { value: 'reggae', text: 'Reggae' },
  { value: 'rock', text: 'Rock' },
  { value: 'r&b', text: 'R&B' },
  { value: 'soundtrack', text: 'Soundtrack' },
  { value: 'soul', text: 'Soul' },
  { value: 'techno', text: 'Techno' },
  { value: 'trance', text: 'Trance' },
  { value: 'trap', text: 'Trap' },
];


const someGenres = [
  { value: 'all', text: 'All' },
  { value: 'acoustic', text: 'Acoustic' },
  { value: 'alternative', text: 'Alternative' },
  { value: 'anime', text: 'Anime' },
  { value: 'ambient', text: 'Ambient' },
  { value: 'breakbeat', text: 'Breakbeat' },
  { value: 'classical', text: 'Classical' },
  { value: 'drum & base', text: 'Drum and base' },
  { value: 'drill', text: 'Drill' },
  { value: 'dance', text: 'Dance' },
  { value: 'dub', text: 'Dub' },
  { value: 'easy listening', text: 'Easy Listening' },
  { value: 'electronic', text: 'Electronic' },
];

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
    musicInfo: null,
    genre: 'all',
    showMoreGenres: false,
    showFeaturedArtists: true,
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
    this.setState({showFeaturedArtists: !values.searchValue ? true : false});
    const { filter, limit } = this.state;
    const f = { ...filter, ...values };
    this.setState({ offset: 0, filter: f });
    this.getPerformers(0, f, limit);
  }

  handleGenreFilter(values: any) {
    let vals = values;
    const { filter, limit } = this.state;
    let f;
    if(values !== 'all'){

      vals = {searchValue: values, q: values}
      f = { ...filter, ...vals };
      this.setState({ offset: 0, filter: f, showFeaturedArtists: false });
      this.getPerformersByGenre(0, f, limit);
    }else{
      // this.setState(() => this.updateDataDependencies())
      this.setState({showFeaturedArtists: true});
      vals = {searchValue: '', q: ''}
      this.handleFilter(vals);
      // this.updateDataDependencies();
    }

    // const { filter, limit } = this.state;
    // const f = { ...filter, ...vals };
    // this.setState({ offset: 0, filter: f });
    // this.getPerformersByGenre(0, f, limit);
    this.setState({genre: values})
  }

  changeEmptySearchBar(bool){
    this.setState({isSearchEmpty: bool})
  }

  async getTopPerformers() {
    const { trendingArtistsFilter } = this.state;
    try {
      this.setState({ fetching: true });
      const limit = 4;
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

  async getPerformersByGenre(offset: any, filter: any, limit: any) {
    try {
      this.setState({ fetching: true });
      const resp = await performerService.searchGenre({
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
      limit, offset, performers, fetching, total, trendingPerformers, recentlyJoinedPerformers, isSearchEmpty, genre, showMoreGenres, showFeaturedArtists
    } = this.state;

    if (countries === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }

    return (
      <Layout className={styles.componentsPerformerVerificationFormModule}>
        <Head>
          <title>{`${ui?.siteName} | Artists`}</title>
        </Head>
        <div className="main-container" style={{maxWidth: '1400px', width: '95% !important'}}>
          <div className="artist-explore-wrapper">
            <div className="explore-sidebar">
              <PerformerAdvancedFilter
                onSubmit={this.handleFilter.bind(this)}
                countries={countries}
                musicInfo={musicInfo}
                onSearch={this.changeEmptySearchBar.bind(this)}
              />
            </div>
            <div className='genre-select-wrapper'>
              {showMoreGenres ? (
                <>
                  {genres.map((g) => (
                    <span onClick={()=> this.handleGenreFilter(g.value)} className={`${g.value === genre ? "explore-genre-badge-active" : "explore-genre-badge" }`}>
                      {g.value}
                    </span>
                  ))}
                </>
              ) : (
                <>
                  {someGenres.map((g) => (
                    <span onClick={()=> this.handleGenreFilter(g.value)} className={`${g.value === genre ? "explore-genre-badge-active" : "explore-genre-badge" }`}>
                      {g.value}
                    </span>
                  ))}
                  <div className='genre-see-more' onClick={()=> this.setState({showMoreGenres: true})}>
                    <span>See more</span>
                  </div>
                </>
              )}
            </div>
            <div className="explore-main">
              {showFeaturedArtists && (
                <>
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
              <div className="trending-artists-container">
                <p className="trending-artists-header">Trending</p>
                <div className="trending-artists-wrapper">
                  {trendingPerformers.map((artist) => (
                    <div className='trending-artists-cont-relative' key={artist._id} >
                      <Link
                        href={`/artist/profile?id=${artist?.username || artist?._id}`}
                        as={`/artist/profile?id=${artist?.username || artist?._id}`}
                        style={{ cursor: 'pointer' }}
                        className=""
                      >
                      <div className='trending-artists-cont-relative'>
                        <div className='trending-artists-image-wrapper' style={{backgroundColor:'red'}}>
                        <div className="trending-artists-image" style={{ backgroundImage: `url( ${artist?.avatar || '/static/no-avatar.png'} )` }} />
                        </div>
                      </div>
                      <div className='trending-artists-cont-relative' style={{marginTop:'1rem'}}>
                        <p className='trending-artists-display-name'>{artist?.name}
                          <span className='-mt-1 pl-1'>
                            { artist?.verifiedAccount && <BadgeCheckIcon className="recently-joined-v-badge" /> }
                          </span>
                        </p>
                        <p className='trending-artists-username pt-3'>@{artist?.username}</p>
                      </div>
                      <div className='trending-artists-overlay-wrapper'>
                          <div className='trending-artists-overlay'>
                              <p className='trending-artists-score'>{artist?.score}</p>
                          </div>
                      </div>
                        {/* <div className="t-artist-thumb">
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
                        </div> */}
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
              <Row style={{marginLeft: '24px'}}>
                {performers
                  && performers.length > 0
                  && performers.map((p) => (
                    <Col xs={10} sm={6} md={6} lg={4} xl={3} key={p._id}>
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
