/* eslint-disable react/jsx-no-bind */
import { Select } from 'antd';
import { sortBy } from 'lodash';
import { PureComponent } from 'react';
import { IGallery } from 'src/interfaces';

const { Option } = Select;

interface IProps {
  placeholder?: string;
  style?: Record<string, string>;
  defaultValue?: any;
  onSelect: Function;
  disabled?: boolean;
  galleries?: IGallery[];
}

interface IState {
  data: any;
  value: any;
}

export class SelectGalleryDropdown extends PureComponent<IProps, IState> {
  static defaultProps: Partial<IProps>;

  _initalData = [];

  constructor(props) {
    super(props);
    this.state = {
      data: [] as any,
      value: undefined
    };
  }

  componentDidUpdate(prevProps: any) {
    const { galleries } = this.props;
    if (prevProps.galleries !== galleries) this.setData();
  }

  async setData() {
    const { galleries } = this.props;
    this._initalData = sortBy(galleries, (g) => g.performerId);
    this.setState({
      data: [...this._initalData]
    });
  }

  handleSearch = (value) => {
    const q = value.toLowerCase();
    const filtered = this._initalData.filter((g) => (g.name || '').toLowerCase().includes(q));
    this.setState({ data: filtered });
  };

  render() {
    const {
      disabled, placeholder, style, onSelect, defaultValue
    } = this.props;
    const { value, data } = this.state;
    return (
      <Select
        showSearch
        value={value}
        placeholder={placeholder}
        style={style}
        defaultActiveFirstOption={false}
        showArrow
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={onSelect.bind(this)}
        notFoundContent={null}
        defaultValue={defaultValue}
        disabled={disabled}
      >
        {data.map((g) => (
          <Option key={g._id} value={g._id}>
            <span>
              <span>{g.name}</span>
            </span>
          </Option>
        ))}
      </Select>
    );
  }
}

SelectGalleryDropdown.defaultProps = {
  placeholder: '',
  style: {},
  defaultValue: '',
  disabled: false,
  galleries: []
} as Partial<IProps>;
