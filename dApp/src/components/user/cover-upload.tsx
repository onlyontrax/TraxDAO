import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import ImgCrop from 'antd-img-crop';
import { PureComponent } from 'react';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isLt2M = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE as any || 5);
  if (!isLt2M) {
    message.error(`Cover must be less than ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB`);
  }
  return isLt2M;
}

interface IState {
  loading: boolean;
}

interface IProps {
  image?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  options?: any;
}

export class CoverUpload extends PureComponent<IProps, IState> {
  static defaultProps: Partial<IProps>;

  state = {
    loading: false
  };

  handleChange = (info) => {
    const { onUploaded } = this.props;
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl) => {
        this.setState({
          loading: false
        });
        onUploaded
          && onUploaded({
            response: info.file.response,
            base64: imageUrl
          });
      });
    }
  };

  onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow.document.write(image.outerHTML);
  };

  render() {
    const { loading } = this.state;
    const { headers, uploadUrl, options, image } = this.props;
    const imgCropProps: any = {
      aspect: 2 / 1,
      cropShape: 'rect',
      quality: 1,
      modalTitle: 'Edit cover image',
      modalWidth: 767
    };

    return (
      <div className="cover-img-modal">
        <ImgCrop {...imgCropProps}>
          <Upload
            accept="image/*"
            name={options.fieldName || 'file'}
            listType="picture-card"
            showUploadList={false}
            action={uploadUrl}
            beforeUpload={beforeUpload}
            onChange={this.handleChange}
            onPreview={this.onPreview}
            headers={headers}
          >
            {/* <div className="edit-avatar-wrapper">
            <div className="edit-avatar-btn" >
              {' '}
              Edit cover
            </div>
            </div> */}
            <div
                className="top-profile-account"
                style={{
                  position: 'relative',
                  marginBottom: -20,
                  minWidth: 200,
                  backgroundImage: image ? `url('${image}')` : "url('/static/banner-image.jpg')"
                }}
              />
          </Upload>
        </ImgCrop>
      </div>
    );
  }
}

CoverUpload.defaultProps = {
  image: '',
  uploadUrl: '',
  headers: {},
  onUploaded: () => {},
  options: {}
} as Partial<IProps>;
