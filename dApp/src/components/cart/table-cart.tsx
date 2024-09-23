/* eslint-disable react/no-unused-prop-types */
import { DeleteOutlined } from '@ant-design/icons';
import { ImageProduct } from '@components/product/image-product';
import {
  Button,
  InputNumber,
  Table,
  Tag,
  message
} from 'antd';
import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';

interface IProps {
  dataSource: IProduct[];
  rowKey: string;
  loading?: boolean;
  pagination?: {};
  onChange?: Function;
  deleteItem?: Function;
  onChangeQuantity?: Function;
  onRemoveItemCart?: Function;
}

export class TableCart extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  timeout = 0;

  render() {
    const {
      dataSource,
      rowKey,
      loading,
      onRemoveItemCart,
      onChangeQuantity
    } = this.props;
    const changeQuantity = async (item, quantity: any) => {
      if (!quantity) return;
      try {
        if (this.timeout) clearTimeout(this.timeout);
        let remainQuantity = quantity;
        this.timeout = window.setTimeout(async () => {
          if (quantity > item.stock) {
            remainQuantity = item.stock;
            message.error('Quantity must not be larger than quantity in stock');
          }
          onChangeQuantity(item, remainQuantity);
        }, 300);
      } catch (error) {
        message.error('An error occurred, please try again!');
      }
    };
    const columns = [
      {
        title: '',
        dataIndex: 'image',
        render(data, record) {
          return <ImageProduct product={record} />;
        }
      },
      {
        title: 'Name',
        dataIndex: 'name'
      },
      {
        title: 'Price',
        dataIndex: 'price',
        render(price: number) {
          return (
            <span>
              $
              {price.toFixed(2)}
            </span>
          );
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        render(type: string) {
          switch (type) {
            case 'physical':
              return <Tag color="#7b5cbd">Physical</Tag>;
            case 'digital':
              return <Tag color="#00dcff">Digital</Tag>;
            default:
              break;
          }
          return <Tag color="#00dcff">{type}</Tag>;
        }
      },
      {
        title: 'Stock',
        dataIndex: 'stock',
        render(stock: number, record) {
          return <span>{record.type === 'physical' && (stock || 'Out of stock')}</span>;
        }
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        render(quantity, record) {
          return (
            <InputNumber
              value={quantity || 1}
              onChange={(event) => changeQuantity(record, event)}
              type="number"
              min={1}
              disabled={record.type !== 'physical'}
            />
          );
        }
      },
      {
        title: 'Provisionally charged',
        dataIndex: 'quantity',
        render(data, record) {
          return (
            <span>
              $
              {((record.quantity || 1) * record.price).toFixed(2)}
            </span>
          );
        }
      },
      {
        title: 'Action',
        dataIndex: '',
        render(data, record) {
          return (
            <Button className="danger" onClick={() => onRemoveItemCart(record)}>
              <DeleteOutlined />
            </Button>
          );
        }
      }
    ];
    return (
      <div className="table-responsive table-cart">
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          pagination={false}
        />
      </div>
    );
  }
}

TableCart.defaultProps = {
  loading: false,
  pagination: {},
  onChange: () => {},
  deleteItem: () => {},
  onChangeQuantity: () => {},
  onRemoveItemCart: () => {}
} as Partial<IProps>;
