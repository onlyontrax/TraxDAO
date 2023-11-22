import FeedCard from '@components/post/post-card';
import { ArrowLeftIcon } from '@heroicons/react/outline';
import {
  IError, IFeed, IUIConfig, IUser
} from '@interfaces/index';
import { authService, feedService } from '@services/index';
import { Layout, message, Spin } from 'antd';
import Error from 'next/error';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

interface IProps {
  error: IError;
  ui: IUIConfig;
  feed: IFeed;
  user: IUser;
}

class PostDetails extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  state = {
    feed: null
  };

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const feed = (await (
        await feedService.findOne(id as string, {
          Authorization: authService.getToken() || ''
        })
      ).data);
      return { feed };
    } catch (e) {
      return {};
    }
  }

  async componentDidMount() {
    const { feed } = this.state;
    if (feed === null) {
      const data = await this.getData();

      this.setState({ feed: data.feed }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {}

  async onDelete(feed: IFeed) {
    const { user } = this.props;
    if (user._id !== feed.fromSourceId) {
      message.error('Permission denied');
      return;
    }
    if (!window.confirm('Are you sure to delete this post?')) return;
    try {
      await feedService.delete(feed._id);
      message.success('Deleted the post successfully');
      Router.back();
    } catch {
      message.error('Something went wrong, please try again later');
    }
  }

  render() {
    const { ui, error } = this.props;
    const { feed } = this.state;
    if (feed === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Post was not found'} />;
    }
    const { performer } = feed;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | ${performer?.name || performer?.username}`}</title>
          <meta name="keywords" content={`${performer?.name}, ${performer?.username}, ${feed?.text}`} />
          <meta name="description" content={feed?.text} />
          {/* OG tags */}
          <meta property="og:title" content={`${ui?.siteName} | ${performer?.name || performer?.username}`} />
          <meta property="og:image" content={performer?.avatar || '/static/no-avatar.png'} />
          <meta property="og:description" content={feed?.text} />
          {/* Twitter tags */}
          <meta name="twitter:title" content={`${ui?.siteName} | ${performer?.name || performer?.username}`} />
          <meta name="twitter:image" content={performer?.avatar || '/static/no-avatar.png'} />
          <meta name="twitter:description" content={feed?.text} />
        </Head>
        <div className="main-container">
          <div className="post-heading">
            <a aria-hidden onClick={() => Router.back()}>
              <ArrowLeftIcon className="post-heading-icon" />
            </a>
          </div>
          <div className="main-container custom">
            <FeedCard isPostDetails={true} feed={feed} onDelete={this.onDelete.bind(this)} />
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui },
  user: state.user.current
});
const dispatch = {};
export default connect(mapStates, dispatch)(PostDetails);
