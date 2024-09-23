import { DatePicker } from '@components/common/datePicker';
import {
  Col,
  Row,
  Select
} from 'antd';
import { PureComponent } from 'react';

const { RangePicker } = DatePicker;

const deliveryStatuses = [
  {
    key: 'processing',
    text: 'Processing'
  },
  {
    key: 'shipping',
    text: 'Shipped'
  },
  {
    key: 'delivered',
    text: 'Delivered'
  },
  {
    key: 'refunded',
    text: 'Refunded'
  }
];

interface IProps {
  onSubmit?: Function;
}

export class OrderSearchFilter extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    deliveryStatus: '',
    status: '',
    fromDate: '',
    toDate: ''
  };

  render() {
    const { onSubmit } = this.props;
    return (
      <Row className="search-filter">
        <Col lg={6} md={8} xs={12}>
          <Select
            onChange={(val) => this.setState({ deliveryStatus: val }, () => onSubmit(this.state))}
            style={{ width: '100%' }}
            placeholder="Select delivery status"
            defaultValue=""
          >
            <Select.Option key="all" value="">
              All delivery statuses
            </Select.Option>
            {deliveryStatuses.map((s) => (
              <Select.Option key={s.key} value={s.key}>
                {s.text || s.key}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col lg={8} md={10} xs={12}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={(dates: [any, any], dateStrings: [string, string]) => this.setState({
              fromDate: dateStrings[0],
              toDate: dateStrings[1]
            }, () => onSubmit(this.state))}
          />
        </Col>
      </Row>
    );
  }
}

OrderSearchFilter.defaultProps = {
  onSubmit: () => {}
} as Partial<IProps>;
