import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { CoverGallery } from '@components/gallery/cover-gallery';
import { formatDate } from '@lib/date';
import { Button, Table, Tag } from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteGallery?: Function;
}

export class TableListGallery extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      dataSource,
      rowKey,
      loading,
      pagination,
      onChange,
      deleteGallery
    } = this.props;
    const columns = [
      {
        title: 'Thumbnail',
        render(data, record) {
          return (
            <Link
              href={`/gallery?id=${record?.slug || record?._id}`}
              as={`/gallery?id=${record?.slug || record?._id}`}
            >
              <CoverGallery gallery={record} />
            </Link>
          );
        }
      },
      {
        title: 'Title',
        dataIndex: 'title',
        render(title, record) {
          return (
            <div style={{
              maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
            }}
            >
              <Link
                href={`/gallery?id=${record?.slug || record?._id}`}
                as={`/gallery?id=${record?.slug || record?._id}`}
              >
                {title}
              </Link>
            </div>
          );
        }
      },
      {
        title: 'PPV',
        dataIndex: 'isSale',
        render(isSale: string) {
          return <span>{isSale}</span>;
        }

      },
      {
        title: 'Total photos',
        dataIndex: 'numOfItems'
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status: string) {
          switch (status) {
            case 'active':
              return <Tag color="green" className="tag-style">Active</Tag>;
            case 'inactive':
              return <Tag color="orange" className="tag-style">Inactive</Tag>;
            default: return <Tag color="#FFCF00" className="tag-style">{status}</Tag>;
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
        render: (data, record) => (
          <div style={{ whiteSpace: 'nowrap' }}>
            <Button className="info">
              <Link
                href={{
                  pathname: '/artist/my-gallery/update',
                  query: { id: record._id }
                }}
              >

                <EditOutlined />

              </Link>
            </Button>
            <Button
              onClick={() => deleteGallery && deleteGallery(record._id)}
              className="danger"
            >
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
          // eslint-disable-next-line react/jsx-no-bind
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}

TableListGallery.defaultProps = {
  deleteGallery: () => {}
} as Partial<IProps>;
