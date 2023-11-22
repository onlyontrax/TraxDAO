import { CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import { Image as AntImage, Upload, message } from 'antd';
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
    message.error(`Avatar must be less than ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB`);
  }
  return isLt2M;
}

interface IState {
  loading: boolean;
  imageUrl: string;
}

interface IProps {
  image?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
}

export class AvatarUpload extends PureComponent<IProps, IState> {
  static defaultProps: Partial<IProps>;

  state = {
    loading: false,
    imageUrl: '/static/no-avatar.png'
  };

  componentDidMount() {
    const { image } = this.props;
    if (image) {
      this.setState({ imageUrl: image });
    }
  }

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
          imageUrl,
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
    const { imageUrl } = this.state;
    const { headers, uploadUrl } = this.props;
    const imgCropProps: any = {
      rotationSlider: true,
      cropShape: 'round',
      quality: 1,
      modalTitle: 'Edit Avatar',
      modalWidth: 767
    };
    return (
      <div>
        <ImgCrop {...imgCropProps}>
          <Upload
            accept="image/*"
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action={uploadUrl}
            beforeUpload={beforeUpload}
            onChange={this.handleChange}
            onPreview={this.onPreview}
            headers={headers}
          >
            <div className="edit-avatar-wrapper">
              <AntImage src={imageUrl} alt="avatar" className="edit-profile-avatar" />
              <div className="edit-avatar-btn">
                {' '}
                Edit avatar
              </div>
            </div>
          </Upload>
        </ImgCrop>
      </div>
    );
  }
}

AvatarUpload.defaultProps = {
  image: '',
  uploadUrl: '',
  headers: {},
  onUploaded: () => {}
} as Partial<IProps>;
