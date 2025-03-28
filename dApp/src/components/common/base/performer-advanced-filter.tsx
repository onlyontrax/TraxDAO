import { SearchOutlined } from '@ant-design/icons';
import { ICountry, IMusic, IUser } from '@interfaces/index';
import {
  Button, Input, Select, message, Avatar
} from 'antd';
import { omit } from 'lodash';
import { PureComponent, createRef } from 'react';
import { debounce } from 'lodash';
import Link from 'next/link'
import { performerService, videoService } from '@services/index';
const { Option } = Select;
import Router from 'next/router';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface IProps {
  onSubmit: Function;
  onSearch: Function;
  // onOpen: Function;
  user?: IUser;
  isMobile?: boolean;
}

const searchInputWrapper = (isMobile:boolean) => ({
  Transition: `0.5s all ease-in-out`,
  width: (isMobile) ? '85vw' : '300px',
  padding: '5px',
});

const searchInputStyling = () => ({
  Transition: `0.5s all ease-in-out`,
  borderRadius: '8px',
  backgroundColor: '#414141B2',
  // border: '1px solid #303030',
  padding: '0px',
  marginRight: '0.3rem',
  fontWeight: '300',
  fontSize: '1.65rem'
});

export class PerformerAdvancedFilter extends PureComponent<IProps> {
  private inputRef = createRef<any>();

  state = {
    showMore: false,
    searchValue: '',
    performers: [],
    expandedSearch: false,
    isNavDropDownOpen: false,
  };

  searchValueChange(val) {
    const { onSearch, onSubmit } = this.props;
    if (val === "") {
      onSearch(true)
    } else {
      onSearch(false)
      onSubmit(omit(this.state, ['showMore']), false)
    }
    this.setState({ searchValue: val });
  };

  getPerformers = debounce(async (q, performerIds) => {
    try {
      const resp = await (
        await performerService.search({
          q,
          performerIds: performerIds || '',
          limit: 500
        })
      ).data;
      const performers = resp.data || [];

      this.setState({ performers });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
    }
  }, 500);

  handleSubmit() {
    const { onSubmit } = this.props;
    onSubmit(omit(this.state, ['showMore']), false);
  }

  pushFeaturedArtists(username) {
    Router.replace(`/artist/profile/?id=${username}`);
  }

  searchIconOnClick = () => {
    // const { onOpen } = this.props;
    const { expandedSearch } = this.state;
    const newExpandedState = !expandedSearch;
    
    this.setState({
      isNavDropDownOpen: newExpandedState,
      expandedSearch: newExpandedState
    }, () => {

      if (newExpandedState && this.inputRef.current) {
        this.inputRef.current.focus();
      }
    });
  }

  render() {
    const { user, isMobile } = this.props;
    const { showMore, performers, expandedSearch, isNavDropDownOpen } = this.state;

    return (
      <div className="filter-block-wrapper">
        <div className="filter-block custom" >
          <div className="filter-item" style={searchInputWrapper(isMobile)}>
            <Input
              ref={this.inputRef}
              
              placeholder=" Search for artists"
              onChange={(evt) => {
                this.setState({ q: evt.target.value })
                this.searchValueChange(evt.target.value)
                this.getPerformers.bind(evt.target.value)
              }}
              className='navigation-input rounded-lg bg-[#414141b2] p-0 mr-[0.3rem] font-light '
              addonBefore={<MagnifyingGlassIcon className='flex w-5 h-5 text-trax-white cursor-pointer' onClick={this.searchIconOnClick} />}
              onPressEnter={this.handleSubmit.bind(this)}
            />
          </div>
          <div className={!showMore ? 'filter-block hide' : 'filter-block custom drop-down'}>
          </div>
        </div>
      </div>
    );
  }
}