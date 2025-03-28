import { PureComponent } from 'react';
import { Table, Button, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { ThumbnailVideo } from './thumbnail-video';
import { AnimatePresence, motion } from "framer-motion";
import { Divider } from '@components/common/catalyst/divider';
import { Badge } from '@components/common/catalyst/badge';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@components/common/catalyst/dropdown';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid'
import { debounce } from 'lodash';
import { performerService } from '@services/performer.service';

interface ITrack {
  _id: string;
  participantIds?: string[];
  title: string;
  slug?: string;
  trackType?: 'video' | 'track';
  thumbnail?: {
    thumbnails?: string[];
  };
  teaser?: {
    thumbnails?: string[];
  };
  video?: {
    thumbnails?: string[];
  };
  isSale: 'pay' | 'subscription' | 'free';
  price?: number;
}

interface IProps {
  dataSource: ITrack[];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  onDelete: Function;
  contentType: string;
}

const initial_1 = { opacity: 0, y: 0 };
const animate_1 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 1,
    delay: 0.7,
    ease: "easeOut",
    once: true,
  },
}

// Animation for table cells
const cellVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.7 + (custom * 0.05),// Stagger delay for each cell
      ease: "easeOut",
    },
  }),
};

// Wrapper component for animated table cell
const AnimatedCell = ({ children, index }: { children: React.ReactNode; index: number }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    custom={index}
    variants={cellVariants}
  >
    {children}
  </motion.div>
);

export class TableListVideo extends PureComponent<IProps> {
  state = {
    performersMap: {}
  };

  componentDidMount() {
    this.fetchPerformersForTracks();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.dataSource !== this.props.dataSource) {
      this.fetchPerformersForTracks();
    }
  }

  fetchPerformersForTracks = async () => {
    const { dataSource } = this.props;
    
    // Get unique participant IDs from all tracks
    const allParticipantIds = new Set();
    dataSource.forEach(track => {
      if (track.participantIds && Array.isArray(track.participantIds)) {
        track.participantIds.forEach(id => allParticipantIds.add(id));
      }
    });

    // Convert Set to array
    const uniqueParticipantIds = Array.from(allParticipantIds);

    if (uniqueParticipantIds.length > 0) {
      try {
        const resp = await performerService.search({
          performerIds: uniqueParticipantIds,
          limit: uniqueParticipantIds.length
        });

        const performers = resp.data?.data || [];
        
        // Create a map of performerId to performer data
        const performerLookup = {};
        performers.forEach(performer => {
          performerLookup[performer._id] = performer;
        });

        // Create performersMap for each track
        const newPerformersMap = {};
        dataSource.forEach(track => {
          if (track.participantIds && Array.isArray(track.participantIds)) {
            newPerformersMap[track._id] = track.participantIds
              .map(id => performerLookup[id])
              .filter(Boolean); // Remove any undefined values
          }
        });

        this.setState({ performersMap: newPerformersMap });
      } catch (e) {
        console.error('Error fetching performers:', e);
        message.error(e?.message || 'Error occurred');
      }
    }
  };

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

    const { performersMap } = this.state;

    return (
      <>
        <ul className="mt-5">
          {dataSource.map((track, index) => {

            const url = (track.thumbnail?.thumbnails && track.thumbnail?.thumbnails[0]) || 
                      (track.teaser?.thumbnails && track.teaser?.thumbnails[0]) || 
                      (track.video?.thumbnails && track.video?.thumbnails[0]) || 
                      '/static/no-image.jpg';

            const trackPerformers = performersMap[track._id] || [];
          
          return (
              <li key={track._id}>
                <Divider soft={index > 0} />
                <div className="flex items-center justify-between">
                  <div key={track._id} className="flex gap-6 py-6">
                    <div className="w-32 shrink-0">
                      <Link 
                      href={`/${track?.trackType === 'video' ? 'video' : 'track'}?id=${track.slug || track._id}`}
                      as={`/${track?.trackType === 'video' ? 'video' : 'track'}?id=${track.slug || track._id}`}
                      aria-hidden="true">
                        <img className="aspect-[3/2] rounded-lg shadow" src={url} alt="" />
                      </Link>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-base/6 font-semibold">
                        <Link href={`/${track?.trackType === 'video' ? 'video' : 'track'}?id=${track.slug || track._id}`} className='text-trax-white'>{track.title}</Link>
                      </div>
                      <div className="text-xs/6 text-trax-zinc-500">
                      {track?.trackType === 'video' ? 'Video' : 'Single'} - 
                        {trackPerformers.length > 0 && (
                          <span className="ml-1">
                            {trackPerformers.map(p => p.name).join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs/6 text-trax-zinc-600">
                        {track.isSale === 'pay' && (
                          <>${track.price?.toFixed(2)}</>
                        )}
                        {track.isSale === 'subscription' && (
                          <>Subscription</>
                        )}
                        {track.isSale === 'free' && (
                          <>Free</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Dropdown>
                      <DropdownButton plain aria-label="More options" 
                        className='hover:bg-trax-white/10 hover:border hover:-transparent hover:rounded-lg cursor-pointer'>
                        <EllipsisVerticalIcon />
                      </DropdownButton>
                      <DropdownMenu anchor="bottom end" className='ring-trax-white/10 bg-trax-zinc-800'>
                        <DropdownItem >
                          <Link
                            href={{
                              pathname: '/artist/my-video/update',
                              query: { id: track._id } 
                            }}
                            as={`/artist/my-video/update?id=${track._id}`}
                            className='text-trax-white'
                          >
                            Edit
                          </Link>
                        </DropdownItem>
                        <DropdownItem onClick={() => onDelete(track._id)}>
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </>
    );
  }
}