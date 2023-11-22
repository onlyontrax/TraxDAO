/* eslint-disable no-nested-ternary */
import { PureComponent } from 'react';
import { ICountry, IPerformer, IUser } from 'src/interfaces';
import Link from 'next/link';
import { connect } from 'react-redux';
import { message, Button } from 'antd';
// import Router from 'next/router';
import { followService } from 'src/services';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import styles from './performer.module.scss';

interface IProps {
  performer: IPerformer;
  user: IUser;
  countries: ICountry[];
}

class PerformerGridCard extends PureComponent<IProps> {
  state = {
    isFollowed: false,
    requesting: false,
    isMobile: false
  }

  componentDidMount() {
    const { performer } = this.props;
    this.setState({ isFollowed: !!performer?.isFollowed });
    this.setState({ isMobile: window.innerWidth < 450 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 450 });
  };

  handleFollow = async () => {
    const { performer, user } = this.props;
    const { isFollowed, requesting } = this.state;
    if (!user._id) {
      message.error('Please log in or register!');
      return;
    }
    if (requesting || user.isPerformer) return;
    try {
      this.setState({ requesting: true });
      if (!isFollowed) {
        await followService.create(performer?._id);
        this.setState({ isFollowed: true, requesting: false });
      } else {
        await followService.delete(performer?._id);
        this.setState({ isFollowed: false, requesting: false });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
      this.setState({ requesting: false });
    }
  }

  isUpperCase(str) {
    return str === str.toUpperCase();
  }

  renderArtistName(name: string){
    let res;
    if(this.isUpperCase(name)){
      res = name.length > 9 ? `${name.substring(0, 9)}...` : name
    } else {
      res = name.length > 12 ? `${name.substring(0, 12)}...` : name
    }
    return res;
  };

  render() {
    const { performer, user } = this.props;
    const { isFollowed } = this.state;

    return (
      <div className={styles.componentsPerformerVerificationFormModule}>
        <Link
          href={`/artist/profile?id=${performer?.username || performer?._id}`}
          as={`/artist/profile?id=${performer?.username || performer?._id}`}
          style={{ cursor: 'pointer' }}
        >
          <div className="grid-card" style={{ backgroundImage: `url(${performer?.avatar || '/static/no-avatar.png'})` }}>
            <div className="card-stat">
            </div>
            <div className="artist-name-wrapper">
              <div className="artist-name">
                {this.renderArtistName(performer?.name)}
                {performer?.verifiedAccount && <BadgeCheckIcon className="performer-grid-card-v-badge" />}
                {performer?.wallet_icp && (
                <img src="/static/infinity-symbol.png" style={{ marginLeft: '3px', marginTop: '1px' }} className="profile-icp-badge-feed" />
                )}
                  &nbsp;
              </div>
              <div className="artist-section-username">
                @
                {performer?.username}
              </div>

              <div className="genre-tags-wrapper" style={{ display: `${!performer?.genreOne && !performer?.genreTwo && !performer?.genreThree && !performer?.genreFour && !performer?.genreFive ? 'none' : 'flex'}` }}>
                <div className="genre-tags">
                  <div className="genre-row">
                    <div className="genre-val" style={{ display: `${performer?.genreOne === 'Unset' || !performer.genreOne ? 'none' : 'block'}` }}>
                      {performer?.genreOne}
                    </div>
                    <div className="genre-val" style={{ display: `${performer?.genreTwo === 'Unset' || !performer.genreOne ? 'none' : 'block'}` }}>
                      {performer?.genreTwo}
                    </div>
                  </div>
                  <div className="genre-row">
                    <div className="genre-val" style={{ display: `${performer?.genreThree === 'Unset' || !performer?.genreOne ? 'none' : 'block'}` }}>
                      {performer?.genreThree}
                    </div>
                    <div className="genre-val" style={{ display: `${performer?.genreFour === 'Unset' || !performer?.genreOne ? 'none' : 'block'}` }}>
                      {performer?.genreFour}
                    </div>
                  </div>
                  <div className="genre-row">
                    <div className="genre-val" style={{ display: `${performer?.genreFive === 'Unset' || !performer?.genreOne ? 'none' : 'block'}` }}>
                      {performer?.genreFive}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div>
              {!user?.isPerformer && (

              <div className="follow-wrapper-artists-page">
                <Button className={`${isFollowed ? 'profile-following-btn-card' : 'profile-follow-btn-card'} `} onClick={() => this.handleFollow()}>
                  <p>{isFollowed ? 'Following' : 'Follow'}</p>
                </Button>
              </div>
              )}
            </div>

            {/* </div> */}
          </div>
        </Link>
      </div>
    );
  }
}

const maptStateToProps = (state) => ({ user: { ...state.user.current } });
export default connect(maptStateToProps)(PerformerGridCard);
