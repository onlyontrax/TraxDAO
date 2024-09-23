import { formatDate, nowIsBefore } from '@lib/date';
import {
  Avatar,
  Button,
  Table, Tag
} from 'antd';
import Link from 'next/link';
import { ISubscription } from 'src/interfaces';

interface IProps {
  dataSource: ISubscription[];
  pagination: any;
  rowKey: string;
  onChange: any;
  loading: boolean;
  cancelSubscription: Function;
  activeSubscription: Function;
}

export function TableListSubscription({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading,
  cancelSubscription,
  activeSubscription
}: IProps) {
  const columns = [
    {
      title: 'Artist',
      dataIndex: 'performerInfo',
      render(data, records: ISubscription) {
        return (
          (
            <Link
              href={`/${records?.performerInfo?.username || records?.performerInfo?._id}`}
              as={`/${records?.performerInfo?.username || records?.performerInfo?._id}`}
            >

              <Avatar src={records?.performerInfo?.avatar || '/static/no-avatar.png'} />
              {' '}
              {records?.performerInfo?.name || records?.performerInfo?.username || 'N/A'}

            </Link>
          )
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
          default:
            return <Tag color="orange">{subscriptionType}</Tag>;
        }
      }
    },
    {
      title: 'Renewal Date',
      dataIndex: 'nextRecurringDate',
      sorter: true,
      render(date: Date, record: ISubscription) {
        return <span>{record.status === 'active' && record.subscriptionType !== 'free' && formatDate(date, 'll')}</span>;
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
            return <Tag color="success">Active</Tag>;
          case 'deactivated':
            return <Tag color="red">Inactive</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      }
    },
    {
      title: '',
      dataIndex: '_id',
      render(_id, record: ISubscription) {
        return record.status === 'active' && nowIsBefore(record.expiredAt) ? (
          <Button danger onClick={() => cancelSubscription(record)}>
            Deactivate
          </Button>
        ) : (
          <Button type="primary" onClick={() => activeSubscription(record)}>
            Activate
          </Button>
        );
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
