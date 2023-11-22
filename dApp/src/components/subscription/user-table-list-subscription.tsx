import { Table, Tag, Avatar } from 'antd';
import { ISubscription } from 'src/interfaces';
import { formatDate, nowIsBefore } from '@lib/date';

interface IProps {
  dataSource: ISubscription[];
  pagination: any;
  rowKey: string;
  onChange: any;
  loading: boolean;
}

export function TableListSubscription({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading
}: IProps) {
  const columns = [
    {
      title: 'User',
      dataIndex: 'userInfo',
      render(data, records) {
        return (
          <span>
            <Avatar src={records?.userInfo?.avatar || '/static/no-avatar.png'} />
            {' '}
            {records?.userInfo?.name || records?.userInfo?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="blue">Monthly</Tag>;
          case 'yearly':
            return <Tag color="red">Yearly</Tag>;
          case 'free':
            return <Tag color="orange">Free</Tag>;
          case 'system':
            return <Tag color="green">System</Tag>;
          default:
            return <Tag color="#FFCF00">{subscriptionType}</Tag>;
        }
      }
    },
    {
      title: 'Start Date',
      dataIndex: 'createdAt',
      render(date: Date) {
        return <span>{formatDate(date, 'll')}</span>;
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiredAt',
      render(date: Date) {
        return <span>{formatDate(date, 'll')}</span>;
      }
    },
    {
      title: 'Renewal Date',
      dataIndex: 'nextRecurringDate',
      render(date: Date, record: ISubscription) {
        return <span>{record.status === 'active' && record.subscriptionType !== 'free' && formatDate(date, 'll')}</span>;
      }
    },
    {
      title: 'PM Gateway',
      dataIndex: 'paymentGateway',
      render(paymentGateway: string) {
        switch (paymentGateway) {
          case 'stripe':
            return <Tag color="blue">Stripe</Tag>;
          case 'paypal':
            return <Tag color="violet">Paypal</Tag>;
          case '-ccbill':
            return <Tag color="orange">CCbill</Tag>;
          default:
            return <Tag color="default">{paymentGateway}</Tag>;
        }
      }
    },
    {
      title: 'Updated on',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string, record: ISubscription) {
        if (!nowIsBefore(record.expiredAt)) {
          return <Tag color="red">Suspended</Tag>;
        }
        switch (status) {
          case 'active':
            return <Tag color="#00c12c">Active</Tag>;
          case 'deactivated':
            return <Tag color="#FFCF00">Inactive</Tag>;
          default:
            return <Tag color="pink">{status}</Tag>;
        }
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        pagination={pagination}
        onChange={onChange}
        loading={loading}
      />
    </div>
  );
}
