import { CameraOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Image, Upload, message } from 'antd';
import { PureComponent } from 'react';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

interface IState {
  loading: boolean;
  imageUrl: string;
}

interface IProps {
  accept?: string;
  imageUrl?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  onFileReaded?: Function;
  options?: any;
  isArtistRegisterUpload?:boolean;
}

export class ImageUploadModel extends PureComponent<IProps, IState> {
  static defaultProps: Partial<IProps>;

  state = {
    loading: false,
    imageUrl: ''
  };

  componentDidMount() {
    const { imageUrl } = this.props;
    this.setState({ imageUrl });
  }

  beforeUpload(file) {
    const { onFileReaded } = this.props;
    const isLt5M = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE as any || 20);
    if (!isLt5M) {
      message.error(`Image is too large please provide an image ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 20}MB or below`);
      return false;
    }
    getBase64(file, (imageUrl) => {
      this.setState({
        imageUrl
      });
    });
    onFileReaded && onFileReaded(file);
    return true;
  }

  render() {
    const {
      options = {}, accept, headers, uploadUrl, isArtistRegisterUpload
    } = this.props;
    const { imageUrl, loading } = this.state;
    const uploadButton = <div>{loading ? <LoadingOutlined /> : <CameraOutlined />}</div>;
    return (
      <Upload
        customRequest={() => false}
        accept={accept || 'image/*'}
        name={options.fieldName || 'file'}
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={uploadUrl}
        beforeUpload={(file) => this.beforeUpload(file)}
        headers={headers}

      >
        {isArtistRegisterUpload ? (
          <>
          {imageUrl ? (
          <CheckCircleOutlined className='green-check-icon' style={{fontSize: '30px'}}/>
        ) : (
          uploadButton
        )}
          </>

        ) : (

          <>
          {imageUrl ? (
          <Image src={imageUrl} alt="file" style={{ width: '100%' }} />
        ) : (
          uploadButton
        )}
          </>

        )}
        
      </Upload>
    );
  }
}

ImageUploadModel.defaultProps = {
  accept: '',
  imageUrl: '',
  uploadUrl: '',
  headers: {},
  onUploaded: () => {},
  onFileReaded: () => {},
  options: {},
  isArtistRegisterUpload: false
} as Partial<IProps>;
