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
        title: '',
        dataIndex: 'image',
        render(data, record) {
          return (
            <Link
              href={`/store?id=${record.slug || record._id}`}
              as={`/store?id=${record.slug || record._id}`}
              
            >
              <ImageProduct style={{borderRadius: '6px', minWidth: '60px'}} product={record} />
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
                <Link className="text-trax-white font-light" href={`/store?id=${record.slug || record._id}`} as={`/store?id=${record.slug || record._id}`}>
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
            <span className="text-trax-white font-light" style={{ whiteSpace: 'nowrap' }}>
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
          return <span className="text-trax-white font-light">{(record.type === 'physical' && stock) || ''}</span>;
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        render(type: string) {
          switch (type) {
            case 'physical':
              return <span className="text-trax-white font-light" >Physical</span>;
            case 'digital':
              return <span className="text-trax-white font-light" >Digital</span>;
            default:
              break;
          }
          return <span className="text-trax-white font-light" color="orange">{type}</span>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status: string) {
          switch (status) {
            case 'active':
              return <span className="text-trax-white font-light" >Active</span>;
            case 'inactive':
              return <span className="text-trax-white font-light">Inactive</span>;
            default:
              break;
          }
          return <span className="text-trax-white font-light" >{status}</span>;
        }
      },
      {
        title: 'Updated On',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span className="text-trax-white font-light">{formatDate(date)}</span>;
        }
      },
      {
        title: '',
        dataIndex: '_id',
        render: (id: string) => (
          <div className='flex flex-row gap-1'>
            
              <Link
                className="rounded-lg w-8 h-8 bg-[#4a4a4a] border-none text-trax-white inline-flex p-1 items-center justify-center"
                href={{
                  pathname: '/artist/my-store/update',
                  query: { id }
                }}
                as={`/artist/my-store/update?id=${id}`}
              >

                <EditOutlined />

              </Link>
            
            <Button
              className="rounded-lg w-8 h-8 bg-[red] border-none text-trax-white inline-flex p-1 items-center justify-center"
              onClick={() => deleteProduct(id)}
            >
              <DeleteOutlined />
            </Button>
          </div>
        )
      }
    ];
    return (
      <div className="table-responsive bg-[#020202] rounded-lg p-4">
        
        <div className='flex flex-row justify-between'>
          <div className='flex flex-col  w-1/2 justify-start '>
          <h1 className="profile-page-heading mt-0">Products</h1>
          <span className='text-trax-gray-300 mb-6 flex'>Manage, edit or view your uploaded products. </span>
          </div>
          
          <div className='flex items-start w-1/2 justify-end '>
          <Button className="new-post-options-btn" style={{ width: '7rem' }}>
                  <Link href="/artist/my-store/create">
                    Add product
                  </Link>
                </Button>
          </div>
        </div>
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
