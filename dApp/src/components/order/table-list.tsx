/* eslint-disable react/destructuring-assignment */
import { EyeOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import { Table, Tag, Tooltip } from 'antd';
import Link from 'next/link';
import { IOrder, IUser } from 'src/interfaces';

interface IProps {
  dataSource: IOrder[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
  user: IUser;
}

export function OrderTableList({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange,
  user
}: IProps) {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render(orderNumber, record) {
        return (
          (
            <Link href={{ pathname: user.isPerformer ? '/artist/my-order/detail' : '/user/orders/detail', query: { id: record._id } }}>

              {orderNumber || 'N/A'}

            </Link>
          )
        );
      }
    },
    {
      title: 'Product',
      dataIndex: 'productInfo',
      key: 'productInfo',
      render(product) {
        return (
          <Tooltip title={product?.name}>
            <div style={{
              maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
            >
              <Link href={`/store?id=${product?.slug || product?._id}`} as={`/store?id=${product?.slug || product?._id}`}>
                {product?.name}
              </Link>
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Price',
      dataIndex: 'totalPrice',
      render(totalPrice) {
        return (
          <span>
            $
            {(totalPrice || 0).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Delivery status',
      dataIndex: 'deliveryStatus',
      render(status: string) {
        switch (status) {
          case 'created':
            return <Tag color="gray">Created</Tag>;
          case 'processing':
            return <Tag color="#FFCF00">Processing</Tag>;
          case 'shipping':
            return <Tag color="#00dcff">Shipping</Tag>;
          case 'delivered':
            return <Tag color="#00c12c">Delivered</Tag>;
          case 'refunded':
            return <Tag color="red">Refunded</Tag>;
          default: return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    {
      title: 'Updated On',
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Action',
      dataIndex: '_id',
      render(id: string) {
        return (
          (
            <Link href={{ pathname: user.isPerformer ? '/artist/my-order/detail' : '/user/orders/detail', query: { id } }}>

              <EyeOutlined />
              {' '}
              view
            </Link>
          )
        );
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        rowKey={rowKey}
        loading={loading}
        onChange={onChange.bind(this)}
      />
    </div>
  );
}

export default OrderTableList;
