import { connect } from 'react-redux';
import { LeftOutlined } from '@ant-design/icons';
import PageHeading from '@components/common/page-heading';
import FeedForm from '@components/post/form';
import { IFeed, IPerformer, IUIConfig } from '@interfaces/index';
import { authService, feedService } from '@services/index';
import { Layout, Spin } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

interface IProps {
  ui: IUIConfig;
  feed: IFeed;
  performer: IPerformer;
}

class EditPost extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;
  state = {
    feed: null
  }

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const feed = await (await feedService.findById(id, { Authorization: authService.getToken() || '' })).data;
      return { feed };
    } catch (e) {
      return {
        countries: []
      };
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

  updateDataDependencies() {
    const { feed } = this.state;
    if (!feed) {
      Router.back();
    }
  }

  render() {
    const { ui, performer } = this.props;
    const { feed } = this.state;

    if (feed === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    return (
      feed && (
        <Layout>
          <Head>
            <title>{`${ui?.siteName} | Edit Post`}</title>
          </Head>
          <div className="main-container">
            <PageHeading icon={<LeftOutlined />} title=" Edit Post" />
            <div>
              <FeedForm performer={performer} feed={feed} />
            </div>
          </div>
        </Layout>
      )
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(EditPost);
