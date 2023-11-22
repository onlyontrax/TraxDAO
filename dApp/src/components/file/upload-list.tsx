/* eslint-disable no-nested-ternary */
import {
  DeleteOutlined,
  FileDoneOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { Image, Progress } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  remove: Function;
  setCover: Function;
  files: any[];
}
export class PhotoUploadList extends PureComponent<IProps> {
  render() {
    const { files, remove, setCover } = this.props;
    return (
      <div className="ant-upload-list ant-upload-list-picture">
        {files.length > 0 && files.map((file) => (
          <div
            className="ant-upload-list-item ant-upload-list-item-uploading ant-upload-list-item-list-type-picture"
            key={file._id || file.uid}
            style={{ height: 'auto' }}
          >
            <div className="photo-upload-list">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="photo-thumb">
                  {file._id && file?.photo?.thumbnails && file?.photo?.thumbnails[0] ? <Image src={file?.photo?.thumbnails[0]} alt="thumb" /> : file.uid ? <Image alt="thumb" src={file.thumbUrl} /> : <PictureOutlined />}
                </div>
                <div>
                  <p>
                    {`${file?.name || file?.title} | ${((file?.size || file?.photo?.size || 0) / (1024 * 1024)).toFixed(2)} MB`}
                    {' '}
                    {file._id && <FileDoneOutlined style={{ color: 'green' }} />}
                  </p>
                  <div>
                    {file.isGalleryCover && (
                      <a aria-hidden>
                        Cover IMG
                      </a>
                    )}
                    {!file.isGalleryCover && file._id && (
                      <a aria-hidden onClick={setCover.bind(this, file)}>
                        Set as Cover IMG
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {file.percent !== 100 && (
                <a aria-hidden className="remove-photo" onClick={remove.bind(this, file)}>
                  <DeleteOutlined />
                </a>
              )}
              {file.percent ? (
                <Progress percent={Math.round(file.percent)} />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
