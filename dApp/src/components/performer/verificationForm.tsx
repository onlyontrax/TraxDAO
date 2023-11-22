import { ImageUpload } from '@components/file';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { authService, performerService } from '@services/index';
import {
  Col,
  Form,
  Image,
  Row,
  message
} from 'antd';
import NextImage from 'next/image';
import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';
import styles from './performer.module.scss';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  user: IPerformer;
}

export class PerformerVerificationForm extends PureComponent<IProps> {
  state = {
    idImage: '',
    idVerificationFileId: '',
    documentVerificationFileId: '',
    documentImage: ''
  }

  componentDidMount() {
    const { user } = this.props;
    if (user.documentVerification) {
      this.setState((state) => ({
        ...state,
        documentVerificationFileId: user?.documentVerification?._id,
        documentImage: user?.documentVerification?.url
      }));
    }
    if (user.idVerification) {
      this.setState((state) => ({
        ...state,
        idVerificationFileId: user?.documentVerification?._id,
        idImage: user?.documentVerification?.url
      }));
    }
  }

  onFileUploaded(type, file) {
    if (file && type === 'idFile') {
      this.setState((state) => ({
        ...state,
        idVerificationFileId: file?.response.data?._id,
        idImage: file?.response.data?.url
      }));
    }
    if (file && type === 'documentFile') {
      this.setState((state) => ({
        ...state,
        documentVerificationFileId: file?.response.data?._id,
        documentImage: file?.response.data?.url
      }));
    }
    message.success('Photo has been uploaded!');
  }

  render() {
    const {
      idImage, documentImage
    } = this.state;
    const documentUploadUrl = performerService.getDocumentUploadUrl();
    const headers = {
      authorization: authService.getToken() || ''
    };
    return (
      <div className={styles.componentsPerformerVerificationFormModule} style={{ display: 'flex', flexDirection: 'column' }}>
        <Form
          {...layout}
          name="nest-messages"
          labelAlign="left"
          className="account-form"
        >
          <div style={{ width: '100%' }}>
            <h1 className="profile-page-heading">Document identification</h1>
          </div>
            <Col xs={24} sm={24} md={24}>
              <p className="account-form-item-tag">Upload photo</p>
              <Form.Item
                labelCol={{ span: 24 }}
                className="artist-photo-verification"
              >
                <div className="document-upload">
                  <ImageUpload accept="image/*" headers={headers} uploadUrl={`${documentUploadUrl}/idVerificationId`} onUploaded={this.onFileUploaded.bind(this, 'idFile')} />
                  {idImage ? (
                    <Image alt="id-img" src={idImage} style={{ height: '150px' }} />
                  ) : <NextImage src="/static/front-id.png" style={{ height: '250px', width:'250px' }} width="250" height="250" alt="id-img" objectFit="cover" />}
                </div>
                <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                  <ul className="list-issued-id">
                    <div>
                      <InformationCircleIcon style={{ height: '1.5rem', marginRight: '1rem' }} />
                    </div>
                    <p style={{ fontSize: '1rem', marginTop: '-0.25rem', color: '' }}>
                      Please upload a valid form of identification.
                      <br />
                      {' '}
                      Accepted formats include driving licenses, passports and government-issued identification.
                    </p>
                  </ul>
                </div>
              </Form.Item>
            </Col>
        </Form>
        <Form
          {...layout}
          name="nest-messages"
          labelAlign="left"
          className="account-form"
        >
          <div style={{ width: '100%' }}>
            <h1 className="profile-page-heading">Photo verification</h1>
          </div>
            <Col xs={24} sm={24} md={24}>
              <p className="account-form-item-tag">Upload photo</p>
              <Form.Item
                labelCol={{ span: 24 }}
                className="artist-photo-verification"
              >
                <div className="document-upload">
                  <ImageUpload accept="image/*" headers={headers} uploadUrl={`${documentUploadUrl}/documentVerificationId`} onUploaded={this.onFileUploaded.bind(this, 'documentFile')} />
                  {documentImage ? (
                    <Image alt="id-img" src={documentImage} style={{ height: '150px' }} />
                  ) : <NextImage src="/static/holding-id.jpg" style={{ height: '150px' }} width="150" height="150" alt="holding-id" />}
                </div>
                <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                  <ul className="list-issued-id">
                    <div>
                      <InformationCircleIcon style={{ height: '1.5rem', marginRight: '1rem' }} />
                    </div>
                    <p style={{ fontSize: '1rem', marginTop: '-0.25rem' }}>Take a selfie of you holding your ID. Both your face and your ID must be clearly visible without copying or editing</p>
                  </ul>
                </div>
              </Form.Item>
            </Col>
        </Form>
      </div>
    );
  }
}
