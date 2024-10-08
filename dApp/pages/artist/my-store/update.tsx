import { connect } from 'react-redux';
import { PureComponent } from 'react';
import Head from 'next/head';
import { message, Spin, Layout } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import PageHeading from '@components/common/page-heading';
import { productService } from '@services/product.service';
import { IProduct, IUIConfig } from 'src/interfaces';
import { FormProduct } from '@components/product/form-product';
import Router from 'next/router';
import { getResponseError } from '@lib/utils';

interface IProps {
  id: string;
  ui: IUIConfig;
}

interface IFiles {
  fieldname: string;
  file: File;
}

class ProductUpdate extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    submiting: false,
    fetching: true,
    product: {} as IProduct,
    uploadPercentage: 0,
    id: ''
  };

  _files: {
    image: File;
    digitalFile: File;
  } = {
    image: null,
    digitalFile: null
  };

  async componentDidMount() {
    const { id } = this.props;
    if (!id) {
      const data = await this.getData();

      this.setState({ product: data.product });
    } else {
      try {
        const resp = await productService.findById(id);
        this.setState({ product: resp.data });
      } catch (e) {
        const err = await Promise.resolve(e);
        message.error(getResponseError(err) || 'Product not found!');
        Router.back();
      } finally {
        this.setState({ fetching: false });
      }
    }
  }

  async getData() {
    try {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      this.setState({id});
      const resp = await productService.findById(id);

      return {
        product: resp?.data
      };
    } catch (e) {
      message.error('Product not found!');
      return {
        video: null
      };
    }finally {
      this.setState({ fetching: false });
    }
  }

  onUploading(resp: any) {
    if (this._files.image || this._files.digitalFile) {
      this.setState({ uploadPercentage: resp.percentage });
    }
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {
    try {
      const { id } = this.state;
      const files = Object.keys(this._files).reduce((tmpFiles, key) => {
        if (this._files[key]) {
          tmpFiles.push({
            fieldname: key,
            file: this._files[key] || null
          });
        }
        return tmpFiles;
      }, [] as IFiles[]) as [IFiles];

      this.setState({ submiting: true });

      const submitData = {
        ...data
      };
      await productService.update(
        id,
        files,
        submitData,
        this.onUploading.bind(this)
      );
      message.success('Changes saved.');
      this.setState({ submiting: false }, () => Router.push('/artist/studio'));
    } catch (e) {
      // TODO - check and show error here
      message.error(
        getResponseError(e) || 'Something went wrong, please try again!'
      );
      this.setState({ submiting: false });
    }
  }

  render() {
    const {
      product, submiting, fetching, uploadPercentage
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Edit Product`}</title>
        </Head>
        <div className="main-container">
          <PageHeading title="Edit Product" icon={<ShopOutlined />} />
          {!fetching && product && (
            <FormProduct
              product={product}
              submit={this.submit.bind(this)}
              uploading={submiting}
              beforeUpload={this.beforeUpload.bind(this)}
              uploadPercentage={uploadPercentage}
            />
          )}
          {fetching && <div className="text-center"><Spin /></div>}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(ProductUpdate);
