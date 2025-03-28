import { connect } from 'react-redux';
import { UploadOutlined } from '@ant-design/icons';
import { SearchFilter } from '@components/common/search-filter';
import { TableListVideo } from '@components/video/table-list';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { videoService } from '@services/video.service';
import { cryptoService } from '@services/crypto.service';
import {
  Col, Layout, Row, message
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IUIConfig, IVideo, ISettings } from 'src/interfaces';
import { idlFactory as idlFactoryPPV } from '../../../src/smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV } from '../../../src/smart-contracts/declarations/ppv/ppv2.did';
import {
  removeContent
} from "../../../src/crypto/transactions/plug-ppv";
import TraxButton from '@components/common/TraxButton';
import { Button } from '@components/common/catalyst/button'
import { Input, InputGroup } from '@components/common/catalyst/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'

interface IProps {
  ui: IUIConfig;
  settings: ISettings;
}

class Videos extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'desc',
    searchQuery: ''
  };

  componentDidMount() {
    this.search();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    const pager = { ...paginationVal };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || '',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''
    });
    this.search(pager.current);
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    this.setState({ searchQuery }, () => {
      this.handleFilter({ q: searchQuery });
    });
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async handleRemovePPVContent(id: string, ppvActor: any) {
    await ppvActor
      .removeContent(id)
      .then(async () => {
        const { pagination } = this.state;
        await videoService.delete(id);
        await this.search(pagination.current);

        message.success('Your video has been removed.');
      })
      .catch((error) => {
        message.error(error.message || 'error occured, please try again later');
        return error;
      });
  }

  async search(page = 1) {
    try {
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      await this.setState({ searching: true });

      const resp = await videoService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });

      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  async deleteVideo(id: string) {
    const { settings } = this.props;
    const res = await videoService.findById(id);

    const data: IVideo = res.data;
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return false;
    }
    try {
      if (data.isCrypto) {
        await removeContent(data._id, settings);
      } else {
        const { pagination } = this.state;
        await videoService.delete(id);
        await this.search(pagination.current);
        message.success('Your video has been removed.');
      }
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
  }

  render() {
    const { list, searching, pagination, searchQuery } = this.state;
    const { ui } = this.props;
    const statuses = [
      {
        key: '',
        text: 'Status'
      },
      {
        key: 'active',
        text: 'Active'
      },
      {
        key: 'inactive',
        text: 'Inactive'
      }
    ];

    return (
      <Layout className='dark:bg-trax-zinc-900'>
        <Head>
          <title>{`${ui?.siteName} | Tracks`}</title>
        </Head>
        <div className="">
          {/* <PageHeading title="Tracks" /> */}
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex-1 max-w-xl">
              <InputGroup>
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={this.handleSearch}
                  className="w-full"
                />
              </InputGroup>
            </div>
            <Link href="/artist/my-video/upload">
              <Button className='cursor-pointer'>Upload content</Button>
            </Link>
          </div>
          <div>
            <TableListVideo
              contentType="video"
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={pagination}
              onChange={this.handleTableChange.bind(this)}
              onDelete={this.deleteVideo.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: state.ui,
  settings: { ...state.settings }
});
export default connect(mapStates)(Videos);
