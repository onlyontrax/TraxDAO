/* eslint-disable react/destructuring-assignment */
import { Table, Tag } from 'antd';
import Link from 'next/link';
import { PayoutRequestInterface } from 'src/interfaces';
import { formatDate } from 'src/lib';

interface IProps {
  payouts: PayoutRequestInterface[];
  searching: boolean;
  total: number;
  pageSize: number;
  onChange: Function;
}

function PayoutRequestList({
  payouts,
  searching,
  total,
  pageSize,
  onChange
}: IProps) {
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: 'id',
      render: (id: string, record) => (
        (
          <Link
            href={{
              pathname: '/artist/payout-requests/update',
              query: {
                data: JSON.stringify(record),
                id: record._id
              }
            }}
            as={`/artist/payout-request/update?id=${record._id}`}
          >

            {id.slice(16, 24).toUpperCase()}

          </Link>
        )
      )
    },
    {
      title: 'Amount',
      dataIndex: 'requestTokens',
      key: 'requestTokens',
      render: (requestTokens: number) => (
        <span>
          $
          {(requestTokens || 0).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Payout Gateway',
      dataIndex: 'paymentAccountType',
      key: 'paymentAccountType',
      render: (paymentAccountType: string) => {
        switch (paymentAccountType) {
          case 'banking':
            return <Tag color="gold">Banking</Tag>;
          case 'stripe':
            return <Tag color="#656fde">Stripe</Tag>;
          case 'paypal':
            return <Tag color="#25397c">Paypal</Tag>;
          default:
            break;
        }
        return <Tag color="gold">{paymentAccountType}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        switch (status) {
          case 'done':
            return <Tag color="green" style={{ textTransform: 'capitalize' }}>Done</Tag>;
          case 'pending':
            return <Tag color="orange" style={{ textTransform: 'capitalize' }}>Pending</Tag>;
          case 'rejected':
            return <Tag color="red" style={{ textTransform: 'capitalize' }}>Rejected</Tag>;
          default: break;
        }
        return <Tag color="blue" style={{ textTransform: 'capitalize' }}>{status}</Tag>;
      }
    },
    {
      title: 'Requested On',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (createdAt: Date) => <span>{formatDate(createdAt)}</span>,
      sorter: true
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
      render: (request: PayoutRequestInterface) => (
        <Link
          href={{
            pathname: '/artist/payout-requests/update',
            query: {
              data: JSON.stringify(request),
              id: request._id
            }
          }}
          as={`/artist/payout-request/update?id=${request._id}`}
        >
          {request.status === 'pending' ? 'Edit' : 'View details'}
        </Link>
      )
    }
  ];
  const dataSource = payouts.map((p) => ({ ...p, key: p._id }));

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      className="table"
      pagination={{
        total,
        pageSize
      }}
      scroll={{ x: true }}
      showSorterTooltip={false}
      loading={searching}
      onChange={onChange.bind(this)}
    />
  );
}
PayoutRequestList.defaultProps = {};
export default PayoutRequestList;
