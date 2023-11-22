import { PureComponent } from 'react';
import {
  Table, Button, Tag, Tooltip
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { ThumbnailVideo } from './thumbnail-video';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  onDelete: Function;
}

export class TableListVideo extends PureComponent<IProps> {
  render() {
    const {
      dataSource,
      rowKey,
      loading,
      pagination,
      onChange,
      onDelete
    } = this.props;
    const columns = [
      {
        title: 'Thumbnail',
        render(record: any) {
          return <Link href={`/video?id=${record.slug || record._id}`} as={`/video?id=${record.slug || record._id}`}><ThumbnailVideo style={{height: 50}} video={record} /></Link>;
        }
      },
      {
        title: 'Title',
        dataIndex: 'title',
        render(title: string, record: any) {
          return (
            <Tooltip title={title}>
              <div style={{
                maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}
              >
                <Link href={`/video?id=${record.slug || record._id}`} as={`/video?id=${record.slug || record._id}`}>
                  {title}
                </Link>
              </div>
            </Tooltip>
          );
        }
      },
      {
        title: 'Sale?',
        dataIndex: 'isSale',
        render(isSale: string) {
          return (
            <span>
              {isSale}
            </span>
          );
        }
      },
      {
        title: 'Schedule?',
        dataIndex: 'isSchedule',
        render(isSchedule: boolean) {
          switch (isSchedule) {
            case true:
              return <Tag color="green" className="tag-style">Y</Tag>;
            case false:
              return <Tag color="red" className="tag-style">N</Tag>;
            default: return <Tag color="orange" className="tag-style">{isSchedule}</Tag>;
          }
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status: string) {
          switch (status) {
            case 'active':
              return <Tag color="success" className="tag-style">Active</Tag>;
            case 'inactive':
              return <Tag color="orange" className="tag-style">Inactive</Tag>;
            default:
              return <Tag color="red" className="tag-style">{status}</Tag>;
          }
        }
      },
      {
        title: 'Updated On',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: 'Action',
        dataIndex: '_id',
        render: (id: string) => (
          <div style={{ whiteSpace: 'nowrap' }}>
            <Button className="info">
              <Link
                href={{
                  pathname: '/artist/my-video/update',
                  query: { id }
                }}
                as={`/artist/my-video/update?id=${id}`}
              >

                <EditOutlined />

              </Link>
            </Button>
            <Button onClick={onDelete.bind(this, id)} className="danger">
              <DeleteOutlined />
            </Button>
          </div>
        )
      }
    ];

    return (
      <div className="table-responsive">
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          pagination={pagination}
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}
