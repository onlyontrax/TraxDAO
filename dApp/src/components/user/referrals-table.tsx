/* eslint-disable react/destructuring-assignment */
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';

const paymentType = (type) => {
  switch (type) {
    case 'feed':
      return <Tag color="blue">Post</Tag>;
    case 'video':
      return <Tag color="pink">Video</Tag>;
    case 'product':
      return <Tag color="orange">Product</Tag>;
    case 'gallery':
      return <Tag color="violet">Gallery</Tag>;
    case 'message':
      return <Tag color="red">Message</Tag>;
    case 'tip':
      return <Tag color="red">Artist Tip</Tag>;
    case 'stream_tip':
      return <Tag color="red">Streaming Tip</Tag>;
    case 'public_chat':
      return <Tag color="pink">Paid Streaming</Tag>;
    default: return <Tag color="default">{type}</Tag>;
  }
};

const paymentStatus = (status) => {
  switch (status) {
    case 'pending':
      return <Tag color="blue">Pending</Tag>;
    case 'success':
      return <Tag color="green">Success</Tag>;
    case 'refunded':
      return <Tag color="red">Refunded</Tag>;
    default: return <Tag color="default">{status}</Tag>;
  }
};

export function ReferralsTableList({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange
}) {
  const columns = [
    {
      title: 'Earnings',
      dataIndex: ['userInfo', 'res'],
      render(userInfo, res) {
        return (
          <span>
            <div className="tx-wrapper">
              <div className="tx-info-wrapper">
                <span className="tx-type">
                  {paymentType(res.type)}
                  {paymentType(res.sourceType)}
                </span>
                <span className="tx-price">
                  {res.isCrypto ? `${res.tokenSymbol} ` : '$'}
                  {' '}
                  {res.netPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </span>
        );
      }
    },
    {
      title: 'Date',
      key: 'createdAt',
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
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
