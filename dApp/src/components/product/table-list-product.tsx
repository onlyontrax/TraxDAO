import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ImageProduct } from '@components/product/image-product';
import { formatDate } from '@lib/date';
import {
  Button,
  Table,
  Tag, Tooltip
} from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteProduct?: Function;
}

export class TableListProduct extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      dataSource,
      rowKey,
      loading,
      pagination,
      onChange,
      deleteProduct
    } = this.props;
    const columns = [
      {
        title: 'Thumbnail',
        dataIndex: 'image',
        render(data, record) {
          return (
            <Link
              href={`/store?id=${record.slug || record._id}`}
              as={`/store?id=${record.slug || record._id}`}
            >
              <ImageProduct product={record} />
            </Link>
          );
        }
      },
      {
        title: 'Name',
        dataIndex: 'name',
        render(name: string, record: any) {
          return (
            <Tooltip title={name}>
              <div style={{
                maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}
              >
                <Link href={`/store?id=${record.slug || record._id}`} as={`/store?id=${record.slug || record._id}`}>
                  {name}
                </Link>
              </div>
            </Tooltip>
          );
        }
      },
      {
        title: 'Price',
        dataIndex: 'price',
        render(price: number) {
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              $
              {(price && price.toFixed(2)) || 0}
            </span>
          );
        }
      },
      {
        title: 'Stock',
        dataIndex: 'stock',
        render(stock: number, record) {
          return <span>{(record.type === 'physical' && stock) || ''}</span>;
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        render(type: string) {
          switch (type) {
            case 'physical':
              return <Tag color="#007bff" className="tag-style">Physical</Tag>;
            case 'digital':
              return <Tag color="#ff0066" className="tag-style">Digital</Tag>;
            default:
              break;
          }
          return <Tag color="orange" className="tag-style">{type}</Tag>;
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
              break;
          }
          return <Tag color="default" className="tag-style">{status}</Tag>;
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
                  pathname: '/artist/my-store/update',
                  query: { id }
                }}
                as={`/artist/my-store/update?id=${id}`}
              >

                <EditOutlined />

              </Link>
            </Button>
            <Button
              className="danger"
              onClick={() => deleteProduct(id)}
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
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}

TableListProduct.defaultProps = {
  deleteProduct: () => {}
} as Partial<IProps>;
