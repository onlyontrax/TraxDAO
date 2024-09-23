import { connect } from 'react-redux';
import { UploadOutlined } from '@ant-design/icons';
import { SearchFilter } from '@components/common/search-filter';
import { TableListVideo } from '@components/video/table-list';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { videoService } from '@services/video.service';
import { cryptoService } from '@services/crypto.service';
import {
  Button, Col, Layout, Row, message
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IUIConfig, IVideo, ISettings } from 'src/interfaces';
import { idlFactory as idlFactoryPPV } from '../../../src/smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV } from '../../../src/smart-contracts/declarations/ppv/ppv2.did';

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
    sort: 'desc'
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

      let values = {searchValue: "video", q: "video"}


      let f = { ...filter, ...values };

      const resp = await videoService.search({
        ...f,
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

    const vidData: IVideo = res.data;
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return false;
    }
    try {
      if (vidData.isCrypto) {
        let identity;
        let ppvActor;
        let agent;
        const host = settings.icHost;
        const authClient = await AuthClient.create();

        if (settings.icNetwork !== true) {
          await authClient.login({
            identityProvider: cryptoService.getIdentityProviderLink(),
            onSuccess: async () => {
              if (await authClient.isAuthenticated()) {
                identity = authClient.getIdentity();

                agent = new HttpAgent({
                  identity,
                  host
                });

                agent.fetchRootKey();
                ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
                  agent,
                  canisterId: settings.icPPV
                });
              }

              await this.handleRemovePPVContent(id, ppvActor);
            }
          });
        } else {
          await authClient.login({
            onSuccess: async () => {
              identity = authClient.getIdentity();
              agent = new HttpAgent({ identity, host });
              ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
                agent,
                canisterId: settings.icPPV
              });

              await this.handleRemovePPVContent(id, ppvActor);
            }
          });
        }
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
    const { list, searching, pagination } = this.state;
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
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Tracks`}</title>
        </Head>
        <div className="main-container">
          {/* <PageHeading title="Tracks" /> */}
          <div>
            <Row className='w-full justify-end'>
              {/* <Col lg={16} xs={24}>
                <SearchFilter searchWithKeyword statuses={statuses} onSubmit={this.handleFilter.bind(this)} />
              </Col> */}

            </Row>
          </div>
          <div className="table-responsive">
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
