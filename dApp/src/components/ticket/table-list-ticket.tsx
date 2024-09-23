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
        title: '',
        dataIndex: 'image',
        render(data, record) {
          return (
            <Link
              href={`/event-store?id=${record.slug || record._id}`}
              as={`/event-store?id=${record.slug || record._id}`}
              
            >
              <ImageTicket style={{borderRadius: '6px', minWidth: '60px'}} ticket={record} />
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
                <Link className="text-trax-white font-light" href={`/event-store?id=${record.slug || record._id}`} as={`/event-store?id=${record.slug || record._id}`}>
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
                    return <span className="text-trax-white font-light">{t.name}</span>
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
                    return <span className="text-trax-white font-light">${t.price}</span>
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
                    return <span className="text-trax-white font-light">{t.supply}</span>
                })}
              {/* ${tiers[0].price} */}
            </span>
          )
        }
      },
      // {
      //   title: 'Type',
      //   dataIndex: 'type',
      //   render(type: string) {
      //     switch (type) {
      //       case 'physical':
      //         return <span className="text-trax-white font-light" >Physical</span>;
      //       case 'digital':
      //         return <span className="text-trax-white font-light" >Digital</span>;
      //       default:
      //         break;
      //     }
      //     return <span className="text-trax-white font-light">{type}</span>;
      //   }
      // },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status: string) {
          switch (status) {
            case 'active':
              return <span className="text-trax-white font-light" >Active</span>;
            case 'inactive':
              return <span className="text-trax-white font-light">Inactive</span>;
            default:
              break;
          }
          return <span className="text-trax-white font-light" >{status}</span>;
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
        title: '',
        dataIndex: '_id',
        render: (id: string) => (
          <div className='flex flex-row gap-1'>
            
              <Link
              className="rounded-lg w-8 h-8 bg-[#4a4a4a] border-none text-trax-white inline-flex p-1 items-center justify-center"
                href={{
                  pathname: '/artist/my-events/update',
                  query: { id }
                }}
                as={`/artist/my-events/update?id=${id}`}
              >
                <EditOutlined />
              </Link>
              <Button
              className="rounded-lg w-8 h-8 bg-[#e8e8e8] text-trax-black border-none  inline-flex p-1 items-center justify-center"
              onClick={() => this.getGuestList(id)}
            >
              <FontAwesomeIcon icon={faClipboardList} />
            </Button>
            <Button
              className="rounded-lg w-8 h-8 bg-[red] border-none text-trax-white inline-flex p-1 items-center justify-center"
              onClick={() => deleteProduct(id)}
            >
              <DeleteOutlined />
            </Button>
            
          </div>
        )
      },
      
    ];
    return (
      <>
        <div className="table-responsive bg-[#020202] rounded-lg p-4">
          <div className='flex flex-row justify-between'>
            <div className='flex flex-col  w-1/2 justify-start '>
            <h1 className="profile-page-heading mt-0">Events</h1>
            <span className='text-trax-gray-300 mb-6 flex'>Manage, edit or view your uploaded events. </span>
            </div>

            <div className='flex items-start w-1/2 justify-end '>
            <Button className="new-post-options-btn" style={{ width: '6rem' }}>
                    <Link href="/artist/my-events/create">
                      Add event
                    </Link>
                  </Button>
            </div>
          </div>

        
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
