import { connect } from 'react-redux';
import { SearchFilter } from '@components/common/search-filter';
import { TableListProduct } from '@components/product/table-list-product';
import { IPerformer, IUIConfig } from '@interfaces/index';
import { productService } from '@services/product.service';
import {
  Button,
  Col, Layout,
  Row,
  message
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  user: IPerformer;
  ui: IUIConfig;
}

class Tickets extends PureComponent<IProps> {
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

  async componentDidMount() {
    this.search();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    const pager = { ...paginationVal };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    try {
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      await this.setState({ searching: true });
      const resp = await productService.search({
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

  async deleteProduct(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return false;
    }
    try {
      const { pagination } = this.state;
      await productService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return true;
  }

  render() {
    const { list, searching, pagination } = this.state;
    const { ui } = this.props;
    const statuses = [
      {
        key: '',
        text: 'All'
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
          <title>{`${ui?.siteName} | My Products`}</title>
        </Head>
        <div className="main-container">
          <div>
            <Row>
              <Col lg={20} xs={24}>
                <SearchFilter
                  statuses={statuses}
                  onSubmit={this.handleFilter.bind(this)}
                  searchWithKeyword
                />
              </Col>
              <Col lg={4} xs={24} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button className="new-post-options-btn" style={{ width: '10rem' }}>
                  <Link href="/artist/my-store/create">
                    New Product
                  </Link>
                </Button>
              </Col>
            </Row>
          </div>
          <div className="table-responsive">
            <TableListProduct
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={pagination}
              onChange={this.handleTableChange.bind(this)}
              deleteProduct={this.deleteProduct.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(Tickets);