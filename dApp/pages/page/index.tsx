import { ReadOutlined } from '@ant-design/icons';
import PageHeading from '@components/common/page-heading';
import { IPostResponse } from '@interfaces/post';
import { postService } from '@services/post.service';
import { authService } from '@services/index';
import { Layout, Spin } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import Script from 'next/script';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

interface IProps {
  ui: any;
  post: IPostResponse;
}
class PostDetail extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  state = {
    post: null
  };

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const post = await (await postService.findById(id)).data;
      return { post };
    } catch (e) {
      return { post: null };
    }
  }

  async componentDidMount() {
    const { post } = this.state;
    if (post === null) {
      const data = await this.getData();

      this.setState({ post: data.post }, () => this.updateDataDependencies());
    } else {
      await this.updateDataDependencies();
    }
  }

  async updateDataDependencies() {
    if (window.iframely) {
      document.querySelectorAll('oembed[url]').forEach((element: any) => {
        window.iframely.load(element, element.attributes.url.value);
      });
      document.querySelectorAll('div[data-oembed-url]').forEach((element: any) => {
        // Discard the static media preview from the database (empty the <div data-oembed-url="...">).
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }

        // Generate the media preview using Iframely.
        window.iframely.load(element, element.dataset.oembedUrl);
      });
    }
  }

  render() {
    const { ui } = this.props;
    const { post } = this.state;
    if (post === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | ${post?.title || ''}`}</title>
        </Head>
        <div className="main-container">
          <div className="page-container">
            <PageHeading title={post?.title || 'Page was not found'} icon={<ReadOutlined style={{fontSize: '27px'}} />} />
            <div
              className="page-content"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: post?.content }}
            />
          </div>
        </div>
        <Script charSet="utf-8" src="//cdn.iframe.ly/embed.js?api_key=7c5c0f5ad6ebf92379ec3e" />
      </Layout>
    );
  }
}

const mapProps = (state: any) => ({
  ui: state.ui
});

export default connect(mapProps)(PostDetail);
