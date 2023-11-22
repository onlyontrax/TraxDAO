/* eslint-disable react/require-default-props */
import { InboxOutlined } from '@ant-design/icons';
import { PhotoUploadList } from '@components/file/upload-list';
import {
  Button,
  Divider,
  Form, Input,
  InputNumber,
  Radio,
  Select, Upload
} from 'antd';
import Router from 'next/router';
import { useState } from 'react';
import { IGallery } from 'src/interfaces';
import styles from './gallery.module.scss';

interface IProps {
  gallery?: IGallery;
  onFinish: Function;
  submiting: boolean;
  filesList?: any[];
  handleBeforeUpload?: Function;
  removePhoto?: Function;
  setCover?: Function;
}

const { Dragger } = Upload;

function FormGallery({
  onFinish,
  submiting,
  filesList,
  handleBeforeUpload,
  removePhoto,
  setCover,
  gallery = null
}: IProps) {
  const [form] = Form.useForm();
  const [isSale, setSale] = useState(gallery?.isSale || 'subscription');

  return (
    <div className={styles.componentsGalleryGalleryCardsModule}>
      <Form
        form={form}
        name="galleryForm"
        onFinish={onFinish.bind(this)}
        initialValues={
        gallery || {
          title: '', status: 'active', description: '', price: 4.99, isSale: 'subscription'
        }
      }
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        className="account-form"
        scrollToFirstError
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: 'Please input gallery title!' }]}
          label="Title"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="isSale"
          label="For sale?"
        >
          <Radio.Group value={isSale} onChange={(e) => setSale(e.target.value)}>
            <Radio key="subscription" value="subscription">Only for Subscribers</Radio>
            <Radio key="pay" value="pay">Pay per View</Radio>
            <Radio key="free" value="free">Free for Everyone</Radio>
          </Radio.Group>
        </Form.Item>
        {isSale === 'pay' && (
        <Form.Item
          name="price"
          rules={[{ required: true, message: 'Please input the price' }]}
          label="Price"
        >
          <InputNumber min={1} />
        </Form.Item>
        )}
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
        >
          <Select>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
          </Select>
        </Form.Item>
        {gallery && <Divider>Upload Photos</Divider>}
        {gallery && (

        <Dragger
          accept="image/*"
          multiple
          showUploadList={false}
          listType="picture"
          disabled={submiting}
          beforeUpload={handleBeforeUpload && handleBeforeUpload.bind(this)}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Drag and drop your photos to this area, or browse your computer to upload
          </p>
        </Dragger>
        )}
        {filesList && filesList.length > 0 && (
        <PhotoUploadList
          files={filesList}
          setCover={setCover && setCover.bind(this)}
          remove={removePhoto && removePhoto.bind(this)}
        />
        )}
        {filesList && filesList.length > 0 && (
        <PhotoUploadList
          files={filesList}
          setCover={setCover && setCover.bind(this)}
          remove={removePhoto && removePhoto.bind(this)}
        />
        )}
        <Form.Item>
          <div className="submit-content-wrapper">

            <Button
              className="primary submit-content"
              htmlType="submit"
              loading={submiting}
              disabled={submiting}
            >
              Submit
            </Button>
            <Button
              className="secondary submit-content-green"
              onClick={() => Router.push('/artist/my-gallery')}
            >
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export default FormGallery;
