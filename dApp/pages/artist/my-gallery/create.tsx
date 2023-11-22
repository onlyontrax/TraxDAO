/* eslint-disable react/no-unused-prop-types */
import { ReadOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import PageHeading from '@components/common/page-heading';
import FormGallery from '@components/gallery/form-gallery';
import { getResponseError } from '@lib/utils';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

import { IPerformer, ISettings, IUIConfig } from 'src/interfaces';
import { galleryService } from 'src/services';

interface IProps {
  ui: IUIConfig;
  user: IPerformer;
  settings: ISettings;
}

interface IStates {
  submiting: boolean;
}

class GalleryCreatePage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    submiting: false
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user.verifiedDocument) {
      message.warning('Your ID documents are not verified yet! You could not post any content right now.');
      Router.back();
    }
  }

  async onFinish(data) {
    try {
      await this.setState({ submiting: true });
      const resp = await galleryService.create(data);
      message.success('New gallery created successfully');
      Router.replace(`/artist/my-gallery/update?id=${resp.data._id}`);
    } catch (e) {
      message.error(getResponseError(e) || 'An error occurred, please try again!');
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const { ui } = this.props;
    const { submiting } = this.state;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | New Album`}</title>
        </Head>
        <div className="main-container">
          <PageHeading title="New Album" icon={<ReadOutlined />} />
          <FormGallery submiting={submiting} onFinish={this.onFinish.bind(this)} />
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current },
  settings: { ...state.settings }
});
export default connect(mapStates)(GalleryCreatePage);
