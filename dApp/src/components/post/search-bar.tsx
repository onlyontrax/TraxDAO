import { AppstoreOutlined, MenuOutlined } from '@ant-design/icons';
import { DatePicker } from '@components/common/datePicker';
import { Input } from 'antd';
import { debounce } from 'lodash';
import { PureComponent } from 'react';
import styles from './index.module.scss';

const { RangePicker } = DatePicker;

const { Search } = Input;
interface IProps {
  searching: boolean;
  handleSearch: Function;
  handleViewGrid?: Function;
  tab: string;
}

export default class SearchFeedBar extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    q: '',
    isGrid: true,
    showSearch: false,
    showCalendar: false
  }

  componentDidUpdate(prevProps) {
    const { tab: prevTab } = prevProps;
    const { tab } = this.props;
    if (prevTab !== tab) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ q: '' });
    }
  }

  onSearch = debounce(async (e) => {
    const { handleSearch } = this.props;
    const value = (e.target && e.target.value) || '';
    handleSearch({
      q: value
    });
  }, 500)

  handleViewGrid(isGrid: boolean) {
    const { handleViewGrid: viewGrid } = this.props;
    this.setState({ isGrid });
    viewGrid(isGrid);
  }

  searchDateRange(dates: [any, any], dateStrings: [string, string]) {
    if (!dateStrings.length) return;
    const { handleSearch } = this.props;
    handleSearch({
      fromDate: dateStrings[0],
      toDate: dateStrings[1]
    });
  }

  render() {
    const {
      q, isGrid, showSearch, showCalendar
    } = this.state;
    const { searching, tab } = this.props;
    return (
      <div className={styles.componentspostSearchBarModule}>
        <div className="search-post-bar">
          {showCalendar && <RangePicker onChange={this.searchDateRange.bind(this)} />}
          {showSearch && (
          <Search
            placeholder="Enter keyword here..."
            onChange={(e) => {
              this.setState({ q: e?.target?.value || '' });
              this.onSearch(e);
            }}
            value={q}
            loading={searching}
            allowClear
            enterButton
          />
          )}
          <div className="grid-btns">
            {tab === 'post' && <a aria-hidden className={isGrid ? 'active' : ''} onClick={this.handleViewGrid.bind(this, true)}><AppstoreOutlined /></a>}
            {tab === 'post' && <a aria-hidden className={!isGrid ? 'active' : ''} onClick={this.handleViewGrid.bind(this, false)}><MenuOutlined /></a>}
          </div>
        </div>
      </div>
    );
  }
}

SearchFeedBar.defaultProps = {
  handleViewGrid: () => {}
} as Partial<IProps>;
