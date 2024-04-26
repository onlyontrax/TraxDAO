import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ImageTicket } from '@components/ticket/image-ticket';
import { formatDate } from '@lib/date';
import { earningService, performerService, ticketService, userService } from 'src/services';
import { message } from 'antd';
import { getResponseError } from '@lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardList } from '@fortawesome/free-solid-svg-icons'
import {
  Button,
  Table,
  Tag, Tooltip, Modal, Avatar
} from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteProduct?: Function;
}

export class TableListTicket extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    currentTier: '',
    isOpenGuestList: false,
    attendees: [],
    sortBy: 'createdAt',
  sort: 'desc',
  type: 'ticket',
  dateRange: null,
  pagination: { total: 0, current: 1, pageSize: 10000000 },
  data: []
  }

  componentDidMount(): void {
    const {dataSource} = this.props;
      
    let i = dataSource.map((data: any )=>{
        if(Number(data.tiers.supply) !== 0){
            return data.tiers.name;
        }
    })
    this.setState({tiers: i});
  }


  async getGuestList(id: string) {
    const {
      pagination, sort, sortBy, type, dateRange
    } = this.state;
    try {
      const { current, pageSize } = pagination;
      // const earning = await ticketService.getPurchasedArtists({
      //   limit: pageSize,
      //   offset: (current - 1) * pageSize,
      //   sort,
      //   sortBy,
      //   type,
      //   productId: id,
      //   ...dateRange
      // });
      const payload = { productId: id };
      const earning = await ticketService.getPurchasedArtists({
        id,
        limit: pageSize,
        offset: (current - 1) * pageSize,
      });
      
      this.setState({
        earning: earning.data.data,
        pagination: { ...pagination, total: earning.data.total },
        loading: false
      });

      let data = [];

      earning.data.data.map(async (x)=>{
        
        if(x._doc._id === id){
        
          data.push(x);
        }
      })

      this.setState({data: data, isOpenGuestList: true})

    } catch (error) {
      message.error(getResponseError(await error));
      this.setState({ loading: false });
    }
  }

  async getUsersName(id: string){
    let user = await userService.findById(id)
    //@ts-ignore
    return user.firstName
  }


  exportCSV(){
    let res = []
    this.state.data.map((d)=>{
      let field = [d.firstName, d.lastName, d.purchasedTier]
      res.push(field)
    })

    let csvContent = "data:text/csv;charset=utf-8," 
    + res.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }


  render() {
    const {
      dataSource,
      rowKey,
      loading,
      pagination,
      onChange,
      deleteProduct
    } = this.props;

    const {currentTier, isOpenGuestList, attendees, data} = this.state;
    const columns = [
      {
        title: 'Cover image',
        dataIndex: 'image',
        render(data, record) {
          return (
            <Link
              href={`/event-store?id=${record.slug || record._id}`}
              as={`/event-store?id=${record.slug || record._id}`}
            >
              <ImageTicket ticket={record} />
            </Link>
          );
        }
      },
      {
        title: 'Name',
        dataIndex: 'name',
        render(name: string, record: any) {
          return (
            <Tooltip title={name}>
              <div style={{
                maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}
              >
                <Link href={`/event-store?id=${record.slug || record._id}`} as={`/event-store?id=${record.slug || record._id}`}>
                  {name}
                </Link>
              </div>
            </Tooltip>
          );
        }
      },
      {
        title: 'Tier',
        dataIndex: 'tiers',
        render(tiers: any) {
          return (
            <span style={{ whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column' }}>
                {tiers.map((t)=>{
                    return <span>{t.name}</span>
                })}
                {/* {tiers[0].name} */}
            </span>
          );
        }
      },
      {
        title: 'Price',
        dataIndex: 'tiers',
        render(tiers: any) {
          return (
            <span style={{ whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column' }}>
                {tiers.map((t)=>{
                    return <span>${t.price}</span>
                })}
              {/* ${tiers[0].price} */}
            </span>
          );
        }
      },
      {
        title: 'Supply',
        dataIndex: 'tiers',
        render(tiers: any) {
          return (
            <span style={{ whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column' }}>
                {tiers.map((t)=>{
                    return <span>{t.supply}</span>
                })}
              {/* ${tiers[0].price} */}
            </span>
          )
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        render(type: string) {
          switch (type) {
            case 'physical':
              return <Tag color="#007bff" className="tag-style">Physical</Tag>;
            case 'digital':
              return <Tag color="#ff0066" className="tag-style">Digital</Tag>;
            default:
              break;
          }
          return <Tag color="orange" className="tag-style">{type}</Tag>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status: string) {
          switch (status) {
            case 'active':
              return <Tag color="success" className="tag-style">Active</Tag>;
            case 'inactive':
              return <Tag color="orange" className="tag-style">Inactive</Tag>;
            default:
              break;
          }
          return <Tag color="default" className="tag-style">{status}</Tag>;
        }
      },
      {
        title: 'Updated On',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: 'Action',
        dataIndex: '_id',
        render: (id: string) => (
          <div style={{ whiteSpace: 'nowrap' }}>
            <Button className="info">
              <Link
                href={{
                  pathname: '/artist/my-store/update',
                  query: { id }
                }}
                as={`/artist/my-store/update?id=${id}`}
              >

                <EditOutlined />

              </Link>
            </Button>
            <Button
              className="danger"
              onClick={() => deleteProduct(id)}
            >
              <DeleteOutlined />
            </Button>
            <Button
              className="view-attendees-btn"
              onClick={() => this.getGuestList(id)}
            >
              <FontAwesomeIcon icon={faClipboardList} />
            </Button>
          </div>
        )
      },
      
    ];
    return (
      <>
        <div className="table-responsive">
          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey={rowKey}
            loading={loading}
            pagination={pagination}
            onChange={onChange.bind(this)}
          />
        </div>

        <Modal
            width={500}
            footer={null}
            onOk={() => this.setState({ isOpenGuestList: false })}
            onCancel={() => this.setState({ isOpenGuestList: false })}
            open={isOpenGuestList}
            destroyOnClose
          >
            <div>
              <div className='guest-list-header'>
                <span>Guest list</span>
              </div>
              <ul className='guest-list-item-container'>
                {data.length >0 ? (
                  <>
                  {data.map((d)=>(
                    <li className='guest-list-item-wrapper'>
                      <div className='guest-list-avatar-name-wrapper'>
                        <Avatar style={{marginLeft: '2px', marginTop: '-2px', minWidth: '25px', minHeight: '25px', height: '25px', width: '25px'}} src={d?.avatar || '/static/no-avatar.png'} />
                        <div className='guest-name'>{d.firstName}{' '}{d?.lastName && d?.lastName}</div>
                      </div>
                      <div className='guest-tier'>{d.purchasedTier}</div>
                    </li>
                  ))}
                  </>
                ):(
                  <div className='no-guest-list-wrapper'>
                    <span>Currently no-one has purchased a ticket to your event yet. Share this event on your social media platforms and include the link to the ticket site. </span>
                  </div>
                )}
                
              </ul>
              <div className='export-btn-wrapper' onClick={()=> this.exportCSV()}>
                <div className='export-btn' >
                  <span>Export list to CSV</span>
                </div>
              </div>
            </div>
          </Modal>
      </>
    );
  }
}

TableListTicket.defaultProps = {
  deleteProduct: () => {}
} as Partial<IProps>;
