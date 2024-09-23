import { PureComponent } from 'react';
import {
  Table, Button, Tag, Tooltip
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { ThumbnailVideo } from './thumbnail-video';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  onDelete: Function;
  contentType: string;
}

export class TableListVideo extends PureComponent<IProps> {
  render() {
    const {
      dataSource,
      rowKey,
      loading,
      pagination,
      onChange,
      onDelete,
      contentType
    } = this.props;
    const columns = [
      {
        title: 'Artwork',
        render(record: any) {
          return (
          <Link href={`/video?id=${record.slug || record._id}`} as={`/video?id=${record.slug || record._id}`}>
            <ThumbnailVideo style={{borderRadius: '6px', minWidth: '60px'}} video={record} />
          </Link>)
        }
      },
      {
        title: 'Title',
        dataIndex: 'title',
        render(title: string, record: any) {
          return (
            <Tooltip title={title}>
              <div style={{
                maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}
              >
                <Link className="text-trax-white font-light" href={`/video?id=${record.slug || record._id}`} as={`/video?id=${record.slug || record._id}`}>
                  {title}
                </Link>
              </div>
            </Tooltip>
          );
        }
      },
      {
        title: 'Access',
        dataIndex: 'isSale',
        render(isSale: string) {
          return (
            <span className="text-trax-white font-light">
              {isSale}
            </span>
          );
        }
      },
      {
        title: 'Schedule',
        dataIndex: 'isSchedule',
        render(isSchedule: boolean) {
          switch (isSchedule) {
            case true:
              return <span className="text-trax-white font-light" >Yes</span>;
            case false:
              return <span className="text-trax-white font-light"  >No</span>;
            default: return <span className="text-trax-white font-light">{isSchedule}</span>;
          }
        }
      },
      {
        title: 'Supply',
        dataIndex: 'limitSupply',
        render(limitSupply: boolean, record: any) {
          switch (limitSupply) {
            case true:
              return (
                <div className=''>
                  {(limitSupply && record.supply === 0) &&(
                    <span>Sold out</span>
                  )}
                  {(limitSupply && record.supply !== 0) &&(
                    <span>{record.supply}</span>
                  )}
                  
                  
                </div>
              )
            case false:
              return (
                <div>
                  { !limitSupply && (
                    <span>Unlimited</span>
                  )}
                </div>
              )
            default: return (
              <div>
                  { !limitSupply && (
                    <span>Unlimited</span>
                  )}
                </div>
            )
          }
        }
      },
      // {
      //   title: 'Status',
      //   dataIndex: 'status',
      //   render(status: string) {
      //     switch (status) {
      //       case 'active':
      //         return <span className="text-trax-white font-light" >Active</span>;
      //       case 'inactive':
      //         return <span className="text-trax-white font-light" >Inactive</span>;
      //       default:
      //         return <span className="text-trax-white font-light" >{status}</span>;
      //     }
      //   }
      // },
      {
        title: 'Updated On',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span className="text-trax-white font-light">{formatDate(date)}</span>;
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
                  pathname: '/artist/my-video/update',
                  query: { id }
                }}
                as={`/artist/my-video/update?id=${id}`}
              >

                <EditOutlined />

              </Link>
           
            <Button onClick={onDelete.bind(this, id)} className="rounded-lg w-8 h-8 bg-[red] border-none text-trax-white inline-flex p-1 items-center justify-center">
              <DeleteOutlined />
            </Button>
          </div>
        )
      }
    ];

    return (
      <div className="table-responsive bg-[#020202] rounded-lg p-4">
        <div className='flex flex-row justify-between'>
          <div className='flex flex-col  w-1/2 justify-start '>
          <h1 className="profile-page-heading mt-0 capitalize">{contentType}</h1>
          <span className='text-trax-gray-300 mb-6 flex'>Manage, edit or view your content. </span>
          </div>
          
          <div className='flex items-start w-1/2 justify-end '>
            <Button className="new-post-options-btn" style={{ width: '6rem' }}>
              <Link href="/artist/my-video/upload">
                Add {contentType}
              </Link>
            </Button> 
          </div>
        </div>
        <Table
        style={{fontFamily: "Space Grotesk !important"}}
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          pagination={pagination}
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}
