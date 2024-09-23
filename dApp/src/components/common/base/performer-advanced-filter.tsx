/* eslint-disable no-nested-ternary */
import { SearchOutlined } from '@ant-design/icons';
import { ICountry, IMusic, IUser } from '@interfaces/index';
import {
  Button, Input, Select, message, Avatar
} from 'antd';
import { omit } from 'lodash';
import { PureComponent } from 'react';
import { debounce } from 'lodash';
import  Link  from 'next/link'
import { performerService, videoService } from '@services/index';
const { Option } = Select;
import Router from 'next/router';
interface IProps {
  onSubmit: Function;
  countries: ICountry[];
  musicInfo: IMusic;
  onSearch: Function;
  user?: IUser;
  isMobile?: boolean;
}



const searchInputWrapper = (expanded: boolean, isMobile: boolean) => ({
  Transition: `0.5s all ease-in-out`,
  width: (expanded) ? (isMobile) ? '240px' : '260px' : '51px',
  padding: (expanded) ? (isMobile) ? '0px' : '5px' : '0px',
  // opacity: (expanded && isMobile) ? '1' : '0',
  // top: (expanded)  ? isMobile ? '3.5rem' : '' : '',
  // top: (expanded && isMobile) && '3.5rem',
  // margin: (expanded && isMobile) && 'auto',
  // left: (expanded && isMobile) && '0',
  // right: (expanded && isMobile) && '0',
  // background: (expanded && isMobile) && '#000',
  // borderRadius: (expanded && isMobile) && '40px',
    
});

const searchInputStyling = (expanded: boolean) => ({
  Transition: `0.5s all ease-in-out`,
  borderRadius: '40px',
  backgroundColor: (expanded) ? 'rgb(27 27 27 / 37%)' :  '#00000000',
  border: (expanded) ? '1px solid #303030' : '1px solid #00000000',
  padding: '0px',
  marginRight: '0.3rem'

  // background-color: rgb(27 27 27 / 37%) !important;

});

export class PerformerAdvancedFilter extends PureComponent<IProps> {
  state = {
    showMore: false,
    searchValue: '',
    performers: [],
    expandedSearch: false
  };

  searchValueChange(val){
    const { onSearch, onSubmit } = this.props;
    if(val === ""){
      onSearch(true)
    }else{
      onSearch(false)
      onSubmit(omit(this.state, ['showMore']), false)
    }
    this.setState({searchValue: val});
  };


  getPerformers = debounce(async (q, performerIds) => {
    console.log(q, performerIds)
    try {
      const resp = await (
        await performerService.search({
          q,
          performerIds: performerIds || '',
          limit: 500
        })
      ).data;
      const performers = resp.data || [];

      console.log
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

  pushFeaturedArtists(username){
    console.log(username);
    Router.replace(`/${username}`);
  } 

  render() {
    const { musicInfo, user, isMobile } = this.props;
    const { showMore, performers, expandedSearch } = this.state;

    // console.log(performers)
    // const { genreOne = [] } = musicInfo;

    return (
      <div className="filter-block-wrapper">
        <div className="filter-block custom" style={{marginRight: user?._id ? '3.5rem' : '6rem' }}>
          <div className="filter-item" style={searchInputWrapper(expandedSearch, isMobile)}>
            <Input
              style={searchInputStyling(expandedSearch)}
              placeholder=" Search artists"
              onChange={(evt) => {
                this.setState({ q: evt.target.value }) 
                this.searchValueChange(evt.target.value)
                this.getPerformers.bind(evt.target.value)
              }}
              addonBefore={<SearchOutlined onClick={()=> this.setState({expandedSearch: !expandedSearch})}/>}
              // onSearch={this.getPerformers.bind(this)}
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
