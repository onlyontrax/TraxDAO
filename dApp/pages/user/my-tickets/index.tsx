import { SearchFilter } from '@components/common/search-filter';
import { PaymentTableList } from '@components/user/payment-token-history-table';
import { getResponseError } from '@lib/utils';
import { Layout, message, Tooltip, Col, Row } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ITicket, IUIConfig } from 'src/interfaces';
import { ticketService, tokenTransctionService } from 'src/services';
import Link from 'next/link'

interface IProps {
  ui: IUIConfig;
}
interface IStates {
  loading: boolean;
  ticketList: ITicket[];
  pagination: {
    total: number;
    pageSize: number;
    current: number;
  };
  sortBy: string;
  sort: string;
  filter: {};
}

class MyTickets extends PureComponent<IProps, IStates> {
  static authenticate = true;

  state = {
    loading: true,
    ticketList: [],
    pagination: {
      total: 0,
      pageSize: 10,
      current: 1
    },
    sortBy: 'createdAt',
    sort: 'desc',
    filter: {}
  };

  componentDidMount() {
    this.getAllTickets();
  }

//   handleTableChange = async (pagination, filters, sorter) => {
//     const { pagination: paginationVal } = this.state;
//     await this.setState({
//       pagination: { ...paginationVal, current: pagination.current },
//       sortBy: sorter.field || 'createdAt',
//       // eslint-disable-next-line no-nested-ternary
//       sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
//     });
//     this.userSearchTransactions();
//   };

//   handleFilter(values) {
//     const { filter } = this.state;
//     this.setState({ filter: { ...filter, ...values } }, () => this.userSearchTransactions());
//   };

//     async userSearchTransactions() {
//     try {
//       const {
//         filter, sort, sortBy, pagination
//       } = this.state;
//       await this.setState({ loading: true });
//       const resp = await tokenTransctionService.userSearch({
//         ...filter,
//         sort,
//         sortBy,
//         limit: pagination.pageSize,
//         offset: (pagination.current - 1) * pagination.pageSize
//       });
//       console.log(resp.data.data)
//       this.setState({
//         loading: false,
//         paymentList: resp.data.data,
//         pagination: {
//           ...pagination,
//           total: resp.data.total
//         }
//       });
//     } catch (error) {
//       message.error(getResponseError(await error));
//       this.setState({ loading: false });
//     }
//   }


  async getAllTickets(){
    try {
        const {
          filter, sort, sortBy, pagination
        } = this.state;
        await this.setState({ loading: true });
        // const resp = await ticketService.getPurchased({
        //   ...filter,
        //   sort,
        //   sortBy,
        //   limit: pagination.pageSize,
        //   offset: (pagination.current - 1) * pagination.pageSize
        // });
        const resp = await ticketService.getPurchased({
            limit: pagination.pageSize,
            offset: (pagination.current - 1) * pagination.pageSize
        })
        // const _resp = await tokenTransctionService.userSearch({
        //   ...filter,
        //   sort,
        //   sortBy,
        //   limit: pagination.pageSize,
        //   offset: (pagination.current - 1) * pagination.pageSize
        // });

        let res = resp.data.data;

        let ticketList = [];

        // for(let i = 0; i < res.length; i ++){
        //   if(res[i].target === 'ticket'){
        //     let t = await (await ticketService.findById(res[i].targetId)).data;
        //     ticketList.push(t);
        //   }
        // }
        this.setState({
          loading: false,
          ticketList: resp.data.data,
          pagination: {
            ...pagination,
            total: resp.data.total
          }
        });
      } catch (error) {
        console.log(error);
        message.error(getResponseError(await error));
        this.setState({ loading: false });
      }
  }

  render() {
    const { loading, ticketList, pagination } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | My Tickets`}</title>
        </Head>
        <div >
          <div className='my-tickets-container'>
          <Row style={{rowGap: '3rem'}}>
            {ticketList.map((ticket)=>(
                <Col xs={12} sm={12} md={8} lg={6} key={ticket._id}>
                <Link
                href={`/event-store?id=${ticket._doc.slug || ticket._doc._id}`}
                as={`/event-store?id=${ticket._doc.slug || ticket._doc._id}`}
              >
                <div className="prd-card" style={{ backgroundImage: `url(${ticket?.image || '/static/no-image.jpg'})`, width: '100%' }}>
                  <div className="prd-card-overlay">
                    <div className="label-wrapper">
                      {/* {ticket.price > 0 && (
                      <span className="label-wrapper-price">
                        $
                        {ticket.price.toFixed(0)}
                      </span>
                      )} */}
                    </div>
                      <div className="prd-info">
                        <span>{ticket._doc.name}</span>
                        {/* {ticket.stock > 0 && (
                        <div className="label-wrapper-digital">
                          {ticket.stock}
                          {' '}
                          available
                        </div>
                        )} */}
                      </div>
                  </div>
                </div>
              </Link>
              </Col>
            ))}
</Row>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(MyTickets);
