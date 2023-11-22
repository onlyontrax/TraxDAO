import { DatePicker } from '@components/common/datePicker';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import {
  Col,
  Input, Row,
  Select
} from 'antd';
import { PureComponent } from 'react';

const { RangePicker } = DatePicker;
interface IProps {
  onSubmit?: Function;
  statuses?: {
    key: string;
    text?: string;
  }[];
  type?: {
    key: string;
    text?: string;
  }[];
  subscriptionTypes?: {
    key: string;
    text?: string;
  }[];
  searchWithPerformer?: boolean;
  searchWithKeyword?: boolean;
  dateRange?: boolean;
  isFree?: boolean;
}

export class SearchFilter extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      statuses = [],
      type = [],
      searchWithPerformer,
      searchWithKeyword,
      dateRange,
      isFree,
      onSubmit,
      subscriptionTypes
    } = this.props;
    return (
      <Row className="search-filter">
        {searchWithKeyword && (
          <Col lg={8} md={8} xs={12}>
            <Input
              placeholder="Enter keyword"
              onChange={(evt) => this.setState({ q: evt.target.value })}
              onPressEnter={() => onSubmit(this.state)}
            />
          </Col>
        )}
        {statuses && statuses.length ? (
          <Col lg={8} md={8} xs={12}>
            <Select
              onChange={(val) => this.setState({ status: val }, () => onSubmit(this.state))}
              style={{ width: '100%' }}
              placeholder="Select status"
              defaultValue=""
            >
              {statuses.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {type && type.length ? (
          <Col lg={8} md={8} xs={12}>
            <Select
              onChange={(val) => this.setState({ type: val }, () => onSubmit(this.state))}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              {type.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {subscriptionTypes && subscriptionTypes.length ? (
          <Col lg={8} md={8} xs={12}>
            <Select
              onChange={(val) => this.setState({ subscriptionType: val }, () => onSubmit(this.state))}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              {subscriptionTypes.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {searchWithPerformer && (
          <Col lg={8} md={8} xs={12}>
            <SelectPerformerDropdown
              placeholder="Search artist here"
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ performerId: val || '' }, () => onSubmit(this.state))}
            />
          </Col>
        )}
        {dateRange && (
          <Col lg={8} md={8} xs={12}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates: [any, any], dateStrings: [string, string]) => this.setState({
                fromDate: dateStrings[0],
                toDate: dateStrings[1]
              }, () => onSubmit(this.state))}
            />
          </Col>
        )}
        {isFree && (
          <Col lg={8} md={8} xs={12}>
            <Select
              onChange={(val) => this.setState({ isFree: val }, () => onSubmit(this.state))}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              <Select.Option key="" value="">
                All Type
              </Select.Option>
              <Select.Option key="free" value="true">
                Free
              </Select.Option>
              <Select.Option key="paid" value="false">
                Paid
              </Select.Option>
            </Select>
          </Col>
        )}
      </Row>
    );
  }
}

SearchFilter.defaultProps = {
  onSubmit: () => {},
  statuses: [],
  type: [],
  subscriptionTypes: [],
  searchWithPerformer: false,
  searchWithKeyword: false,
  dateRange: false,
  isFree: false
} as Partial<IProps>;
