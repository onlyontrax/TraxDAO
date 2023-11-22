import { DeleteOutlined, FileDoneOutlined } from '@ant-design/icons';
import { Progress } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  remove: Function;
  files: any[];
}

export class VideoUploadList extends PureComponent<IProps> {
  render() {
    const { files, remove } = this.props;
    return (
      <div className="ant-upload-list ant-upload-list-picture" style={{ marginBottom: 10 }}>
        {files && files.map((file) => (
          <div className="ant-upload-list-item ant-upload-list-item-uploading ant-upload-list-item-list-type-picture" key={file.uid}>
            <div className="ant-upload-list-item-info">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="ant-upload-list-item-thumbnail ant-upload-list-item-file">
                  <FileDoneOutlined style={{ color: 'green', fontSize: 35 }} />
                </span>
                <span className="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1">
                  <span><b>{file.name}</b></span>
                  {' '}
                  |
                  <span>
                    {(file.size / (1024 * 1024)).toFixed(2)}
                    {' '}
                    MB
                  </span>
                </span>
                {file.percent !== 100
                && (
                  <span className="">
                    <a aria-hidden onClick={() => remove(file)}>
                      <DeleteOutlined />
                    </a>
                  </span>
                )}
              </div>

              {file.percent && <Progress percent={Math.round(file.percent)} />}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
