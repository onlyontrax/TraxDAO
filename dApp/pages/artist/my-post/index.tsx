import { connect } from 'react-redux';
import Link from 'next/link';
import Head from 'next/head';
import { PureComponent } from 'react';
import {
  message, Button, Row, Col, Layout
} from 'antd';
import { feedService } from '@services/index';
import { SearchFilter } from '@components/common/search-filter';
import { IUIConfig } from 'src/interfaces/index';
import FeedList from '@components/post/table-list';
import { PlusCircleOutlined } from '@ant-design/icons';

interface IProps {
  ui: IUIConfig;
}

class PostListing extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    items: [],
    loading: false,
    pagination: {
      pageSize: 10,
      current: 1,
      total: 0
    } as any,
    sort: 'desc',
    sortBy: 'createdAt',
    filter: {}
  };

  componentDidMount() {
    this.getData();
  }

  async handleTabChange(data) {
    const { pagination } = this.state;
    await this.setState({
      pagination: { ...pagination, current: data.current }
    });
    this.getData();
  }

  async handleFilter(values) {
    const { pagination, filter } = this.state;
    await this.setState({ filter: { ...filter, ...values }, pagination: { ...pagination, current: 1 } });
    this.getData();
  }

  async getData() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      await this.setState({ loading: true });
      const resp = await feedService.search({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      await this.setState({
        items: resp.data.data,
        pagination: { ...pagination, total: resp.data.total },
        loading: false
      });
    } catch (error) {
      const err = await error;
      message.error(err?.message || 'An error occured. Please try again.');
      this.setState({ loading: false });
    }
  }

  async deleteFeed(feed) {
    if (!window.confirm('All earnings related to this post will be refunded. Are you sure to remove it?')) {
      return;
    }
    try {
      await feedService.delete(feed._id);
      message.success('Post deleted successfully');
      this.getData();
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
  }

  render() {
    const { items, loading, pagination } = this.state;
    const { ui } = this.props;
    const type = [
      {
        key: '',
        text: 'All types'
      },
      {
        key: 'text',
        text: 'Text'
      },
      {
        key: 'video',
        text: 'Video'
      },
      {
        key: 'photo',
        text: 'Photo'
      }
    ];
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | My Posts`}</title>
        </Head>
        <div className="main-container">
          <div>
            <Row>
              <Col lg={16} xs={24}>
                <div>
                  <SearchFilter
                    onSubmit={this.handleFilter.bind(this)}
                    type={type}
                    searchWithKeyword
                    dateRange
                  />
                </div>

              </Col>
              <Col lg={8} xs={24} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Link href="/artist/my-post/create">

                  <Button className="new-post-options-btn" style={{ width: '8rem' }}>
                    {' '}
                    <PlusCircleOutlined />
                    {' '}
                    Create
                  </Button>
                </Link>
              </Col>
            </Row>
          </div>
          <div style={{ marginBottom: 15 }} />
          <FeedList
            feeds={items}
            total={pagination.total}
            pageSize={pagination.pageSize}
            searching={loading}
            onChange={this.handleTabChange.bind(this)}
            onDelete={this.deleteFeed.bind(this)}
          />
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(PostListing);
