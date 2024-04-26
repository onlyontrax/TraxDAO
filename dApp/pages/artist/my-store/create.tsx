/* eslint-disable react/no-unused-prop-types */
import { connect } from 'react-redux';
import { FormProduct } from '@components/product/form-product';
import { getResponseError } from '@lib/utils';
import { productService } from '@services/product.service';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IPerformer, ISettings, IUIConfig } from 'src/interfaces';

interface IFiles {
  fieldname: string;
  file: File;
}

interface IProps {
  ui: IUIConfig;
  user: IPerformer;
  settings: ISettings;
}

class CreateProduct extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    uploading: false,
    uploadPercentage: 0
  };

  _files: {
    image: File;
    digitalFile: File;
  } = {
    image: null,
    digitalFile: null
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user || !user.verifiedDocument) {
      message.warning('Your Identity has not been verified yet! You can\'t post any content right now. Please to to Account settings to verify your account.');
      Router.back();
    }
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {
    const {user} = this.props;
    if (!this._files.image) {
      message.error('Please upload product image!');
      return;
    }
    
    if (data.type === 'digital' && !this._files.digitalFile) {
      message.error('Please select digital file!');
      return;
    }
    if (data.type === 'physical') {
      this._files.digitalFile = null;
    }

    const files = Object.keys(this._files).reduce((tmpFiles, key) => {
      if (this._files[key]) {
        tmpFiles.push({
          fieldname: key,
          file: this._files[key] || null
        });
      }
      return tmpFiles;
    }, [] as IFiles[]) as [IFiles];

    await this.setState({
      uploading: true
    });
    try {
      await productService.createProduct(files, data, this.onUploading.bind(this));
      message.success('New product was successfully created');
      Router.push(`/artist/profile?id=${user?.username || user?._id}`);
    } catch (error) {
      message.error(getResponseError(error) || 'Something went wrong, please try again!');
      this.setState({
        uploading: false
      });
    }
  }

  render() {
    const { uploading, uploadPercentage } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | New product`}</title>
        </Head>
        <div className="main-container">
          <FormProduct
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
          />
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui,
  user: state.user.current,
  settings: state.settings
});
export default connect(mapStates)(CreateProduct);
