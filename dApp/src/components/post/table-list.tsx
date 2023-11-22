/* eslint-disable react/destructuring-assignment */
import {
  Table, Tag, Tooltip, Button
} from 'antd';
import {
  AudioOutlined, FileImageOutlined, VideoCameraOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { IFeed } from 'src/interfaces';
import { formatDate } from 'src/lib';

interface IProps {
  feeds: IFeed[];
  searching: boolean;
  total: number;
  pageSize: number;
  onChange: Function;
  onDelete: Function;
}

function FeedList({
  feeds,
  searching,
  total,
  pageSize,
  onChange,
  onDelete
}: IProps) {
  const columns = [
    {
      title: 'Post Type',
      key: 'id',
      render: (record) => {
        const images = record.files && record.files.filter((f) => f.type === 'feed-photo');
        return (
          (
            <Link
              href={`/post?id=${record?.slug || record?._id}`}
              as={`/post?id=${record?.slug || record?._id}`}
              style={{ fontSize: 16 }}
            >

              {record.type === 'photo' && (
              <span>
                {images.length || 1}
                {' '}
                <FileImageOutlined />
                {' '}
              </span>
              )}
              {record.type === 'video' && (
              <span>
                <VideoCameraOutlined />
              </span>
              )}
              {record.type === 'audio' && (
              <span>
                <AudioOutlined />
              </span>
              )}
              {record.type === 'text' && (
              <span>
                Aa
              </span>
              )}

            </Link>
          )
        );
      }
    },
    {
      title: 'Description',
      dataIndex: 'text',
      key: 'text',
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={{
            width: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
          }}
          >
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        switch (status) {
          case 'active':
            return <Tag color="green" className="tag-style">Active</Tag>;
          case 'inactive':
            return <Tag color="orange" className="tag-style">Inactive</Tag>;
          default: return <Tag color="blue" className="tag-style">{status}</Tag>;
        }
      }
    },
    {
      title: 'Updated On',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      render: (updatedAt: Date) => <span>{formatDate(updatedAt)}</span>,
      sorter: true
    },
    {
      title: 'Action',
      key: 'details',
      render: (record) => [
        <Button className="info" key="edit">
          <Link
            key="edit"
            href={{ pathname: '/artist/my-post/edit', query: { id: record._id } }}
          >

            <EditOutlined />

          </Link>
        </Button>,
        <Button
          key="status"
          className="danger"
          onClick={() => onDelete(record)}
        >
          <DeleteOutlined />
        </Button>
      ]
    }
  ];
  const dataSource = feeds.map((p) => ({ ...p, key: p._id }));

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      className="table"
      pagination={{
        total,
        pageSize
      }}
      rowKey="_id"
      showSorterTooltip={false}
      loading={searching}
      onChange={onChange.bind(this)}
    />
  );
}
FeedList.defaultProps = {};
export default FeedList;
