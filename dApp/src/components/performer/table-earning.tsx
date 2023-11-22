/* eslint-disable default-case */
import { PureComponent } from 'react';
import { Table, Tag } from 'antd';
// import { formatDate } from '@lib/date';
import { IEarning } from 'src/interfaces';

interface IProps {
  dataSource: IEarning[];
  rowKey: string;
  pagination: {};
  onChange: Function;
  loading: boolean;
}

const paymentType = (type, item) => {
  switch (type) {
    case 'monthly_subscription':
      return <span>Monthly</span>;
    case 'yearly_subscription':
      return <span>Yearly</span>;
    case 'public_chat':
      return <span>Paid Streaming</span>;
    case 'feed':
      return <span>Post</span>;
    case 'tip':
      return (
        <span>
          {item.isCrypto ? 'Crypto' : ''}
          {' '}
          Tip received
          {' '}
        </span>
      );
    case 'gift':
      return <span>Gift</span>;
    case 'video':
      return <span>Payment received</span>;
    case 'message':
      return <span>Message</span>;
    case 'product':
      return <span>Product</span>;
    case 'gallery':
      return <span>Gallery</span>;
    case 'stream_tip':
      return <span>Streaming tip</span>;
  }
  return <span>{type}</span>;
};
const currencies = [
  { name: 'USD', imgSrc: '/static/usd-logo.png', symbol: 'USD' },
  { name: 'ICP', imgSrc: '/static/icp-logo.png', symbol: 'ICP' },
  { name: 'ckBTC', imgSrc: '/static/ckbtc_nobackground.svg', symbol: 'ckBTC' }
]

const formatDate = (inputDate: string) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const date = new Date(inputDate);
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${month} ${day} ${year}`;
}


export class TableListEarning extends PureComponent<IProps> {

  render() {
    const {
      dataSource, rowKey, pagination, onChange, loading
    } = this.props;

    const columns = [
      {
        title: 'Transaction',
        dataIndex: ['userInfo', 'res'],
        render(userInfo, res) {
          return (
            <span>
              <div className="tx-wrapper">
                <span className="tx-avatar-wrapper">
                  <img className="tx-avatar" src={res.userInfo?.avatar || '/static/no-avatar.png'} alt="avatar" />
                </span>
                <div className="tx-info-wrapper">
                  <span className="tx-type">
                    {paymentType(res.type, res)}
                  </span>
                  <span className="tx-price">
                    {'+'}
                    {res.isCrypto ? `` : '$'}
                    {res.netPrice.toFixed(2)}
                    {res.isCrypto && ` ${res.tokenSymbol}`}
                    {' '}
                    from
                    {' '}
                    {res.userInfo?.name || res.userInfo?.username || 'N/A'}
                  </span>
                </div>
              </div>
            </span>
          );
        }
      },
      {
        title: 'Date',
        dataIndex: 'createdAt',
        sorter: true,
        render(date: Date) {
          // @ts-ignore
          return <span style={{ whiteSpace: 'nowrap' }}>{formatDate(date)}</span>;
        }
      }
    ];
    return (
      <div className="table-responsive">
        <Table
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          pagination={pagination}
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}
