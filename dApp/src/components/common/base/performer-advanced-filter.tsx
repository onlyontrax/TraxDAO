/* eslint-disable no-nested-ternary */
import { DownOutlined, FilterOutlined, RightOutlined } from '@ant-design/icons';
import { ICountry, IMusic } from '@interfaces/index';
import {
  Button, Input, Select
} from 'antd';
import { omit } from 'lodash';
import { PureComponent } from 'react';

interface IProps {
  onSubmit: Function;
  countries: ICountry[];
  musicInfo: IMusic;
  onSearch: Function;
}

export class PerformerAdvancedFilter extends PureComponent<IProps> {
  state = {
    showMore: false,
    searchValue: ''
  };

  searchValueChange(val){
    const { onSearch } = this.props;
    if(val === ""){
      onSearch(true)
    }else{
      onSearch(false)
    }
    this.setState({searchValue: val});

  };

  handleSubmit() {
    const { onSubmit } = this.props;
    onSubmit(omit(this.state, ['showMore']));
  }

  render() {
    const { musicInfo } = this.props;
    const { showMore } = this.state;
    const { genreOne = [] } = musicInfo;

    return (
      <div className="filter-block-wrapper">
        <div className="filter-block custom">
          <div className="filter-item custom">
            <Input
              style={{ borderRadius: '10px' }}
              placeholder="Search..."
              onChange={(evt) => {
                this.setState({ q: evt.target.value }) 
                this.searchValueChange(evt.target.value)
              }}
              onPressEnter={this.handleSubmit.bind(this)}
            />
            <Button className="sort-btn" onClick={() => this.setState({ showMore: !showMore })}>
              Sort
              {showMore ? <DownOutlined /> : <RightOutlined />}
            </Button>
          </div>

          <div className={!showMore ? 'filter-block hide' : 'filter-block custom drop-down'}>
            {/* <div> */}

            <div className="filter-item">
              <Select
                // eslint-disable-next-line no-nested-ternary
                className="drop-down-select"
                onChange={(val: any) => {
                  this.setState(
                    {
                      isFreeSubscription: val === 'false' ? false : val === 'true' ? true : ''
                    },
                    () => this.handleSubmit()
                  );
                }}
                style={{ width: '100%' }}
                defaultValue=""
              >
                <Select.Option key="all" value="">
                  All subscriptions
                </Select.Option>
                <Select.Option key="false" value="false">
                  Non-free subscription
                </Select.Option>
                <Select.Option key="true" value="true">
                  Free subscription
                </Select.Option>
              </Select>
            </div>
            <div className="filter-item">
              <Select
                className="drop-down-select"
                style={{ width: '100%' }}
                defaultValue="live"
                onChange={(val) => this.setState({ sortBy: val }, () => this.handleSubmit())}
              >
                <Select.Option value="" disabled>
                  <FilterOutlined />
                  {' '}
                  Sort By
                </Select.Option>
                <Select.Option value="popular">Trending</Select.Option>
                <Select.Option label="" value="latest">
                  Latest
                </Select.Option>
                <Select.Option value="oldest">Oldest</Select.Option>
                <Select.Option value="online">Online</Select.Option>
                <Select.Option value="live">Live</Select.Option>
              </Select>
            </div>
            <div className="filter-item">
              <Select
                onChange={(val) => this.setState({ genreOne: val }, () => this.handleSubmit())}
                style={{ width: '100%' }}
                defaultValue=""
                showSearch
              >
                <Select.Option key="all" value="" disabled>
                  All genres
                </Select.Option>
                {genreOne.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
