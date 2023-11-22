/* eslint-disable react/require-default-props */
import { PureComponent } from 'react';
import {
  Avatar, message, Button, Image
} from 'antd';
import { IPerformer, ICountry, IUser } from 'src/interfaces';
import Link from 'next/link';
import { connect } from 'react-redux';
import Router from 'next/router';
import { followService } from 'src/services';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import styles from './performer.module.scss';

interface IProps {
  performer: IPerformer;
  countries: ICountry[];
  user: IUser;
  onFollow?: Function;
}

class PerformerCard extends PureComponent<IProps> {
  state = {
    isFollowed: false,
    requesting: false
  };

  componentDidMount(): void {
    const { performer } = this.props;
    this.setState({ isFollowed: !!performer?.isFollowed });
  }

  handleJoinStream = (e) => {
    e.preventDefault();
    const { user, performer } = this.props;
    if (!user._id) {
      message.error('Please log in or register!');
      return;
    }
    if (user.isPerformer) return;
    if (!performer?.isSubscribed) {
      message.error('Please subscribe to this artist!');
      return;
    }
    Router.push({
      pathname: `/streaming/details?id=${performer?.username || performer?._id}`
    }, `/streaming/details?id=${performer?.username || performer?._id}`);
  }

  handleFollow = async () => {
    const { performer, user, onFollow } = this.props;
    const { isFollowed, requesting } = this.state;
    if (requesting || user.isPerformer) return;
    if (!user._id) {
      message.error('Please log in or register!');
      return;
    }
    try {
      this.setState({ requesting: true });
      if (!isFollowed) {
        await followService.create(performer?._id);
        this.setState({ isFollowed: true, requesting: false });
      } else {
        await followService.delete(performer?._id);
        this.setState({ isFollowed: false, requesting: false });
      }
      onFollow && onFollow();
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
      this.setState({ requesting: false });
    }
  };

  render() {
    const { performer, user } = this.props;
    const { isFollowed } = this.state;

    return (
      <div className={styles.componentsPerformerVerificationFormModule}>
        <div
          className="artist-card"
          style={{
            backgroundImage: `url(${performer?.cover || '/static/banner-image.jpg'})`
          }}
        >
          <div className="artist-card-filter">

            <div className="hovering">
              {performer?.isFreeSubscription && (
              <span style={{ display: 'none' }} className="card-free">Free</span>
              )}
              {performer?.live > 0 && <span className="live-status" aria-hidden onClick={this.handleJoinStream.bind(this)}>Live</span>}
              <div className="card-img">
                <Avatar alt="avatar" src={performer?.avatar || '/static/no-avatar.png'} />
              </div>
              <Link
                href={`/artist/profile?id=${performer?.username || performer?._id}`}
                as={`/artist/profile?id=${performer?.username || performer?._id}`}
              >
                <div className="artist-name">
                  <div className="name">
                    {performer?.name || 'N/A'}
                    {' '}
                    {' '}
                    {performer?.verifiedAccount && <BadgeCheckIcon className="feed-v-badge" />}
                &nbsp;
                    {performer?.wallet_icp && (

                    <Image src="/static/infinity-symbol.png" className="profile-icp-badge-feed" />
                    )}

                  </div>
                  <p>
                    {`@${performer?.username || 'n/a'}`}
                  </p>
                </div>
              </Link>
              {!user?.isPerformer && (
              <Button
                className={`${isFollowed ? 'profile-following-btn-card' : 'profile-follow-btn-card'} `}
                onClick={() => this.handleFollow()}
              >
                <p>{isFollowed ? 'Following' : 'Follow'}</p>
              </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const maptStateToProps = (state) => ({ user: { ...state.user.current } });
export default connect(maptStateToProps)(PerformerCard);
