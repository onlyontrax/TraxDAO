import { Col, Row } from 'antd';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces/video';
import { VideoCard } from './video-card';
import styles from './video.module.scss';
import TrackListItem from '@components/common/layout/music-track'
import CountHeading from '@components/common/count-heading';
import TrackListItemFeatured from '@components/common/layout/music-track-featured';
interface IProps {
  videos: any;
  title: string;
  isHomePage?: boolean;
  total?: number;
}

export class RelatedListMusic extends PureComponent<IProps> {
  render() {
    const { videos, title, isHomePage, total,  } = this.props;
    return (
      <div className={styles.componentVideoModule}>
          <div className="flex flex-col gap-4">
            <div className='-ml-[1.5rem]'>
            <CountHeading title={title} count={total} isLarge={true}/>
            </div>
          
            {/* <span className={`flex text-custom-green uppercase text-3xl font-heading font-bold ${isHomePage ? 'text-5xl' : 'text-3xl'}`}>{title}</span> */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 overflow-x-hidden gap-2 pr-3`}>
              {/* <div 
                className={`flex absolute right-0 to-black z-[1] ${isHomePage ?  'h-[300px] w-28' : 'h-[260px] w-32'} `}
                style={{background: "linear-gradient(90deg, rgba(14, 14, 14, 0) 0px, rgba(14, 14, 14, 0.01) 8.1%, rgba(14, 14, 14, 0.047) 15.5%, rgba(14, 14, 14, 0.106) 22.5%, rgba(14, 14, 14, 0.176) 29%, rgba(14, 14, 14, 0.26) 35.3%, rgba(14, 14, 14, 0.353) 41.2%, rgba(14, 14, 14, 0.45) 47.1%, rgba(14, 14, 14, 0.55) 52.9%, rgba(14, 14, 14, 0.647) 58.8%, rgba(14, 14, 14, 0.74) 64.7%, rgba(14, 14, 14, 0.824) 71%, rgba(14, 14, 14, 0.894) 77.5%, rgba(14, 14, 14, 0.953) 84.5%, rgba(14, 14, 14, 0.99) 91.9%, rgb(14, 14, 14))"}}/> */}
                

                {videos.map((track, index) => (
                    // <div className={` ${isHomePage ?  'min-w-[350px] min-h-[210px] md:min-w-[310px] md:min-h-[200px]' : 'min-w-[240px] min-h-[150px] md:min-w-[310px] md:min-h-[200px]'} `}>
                      
                      <TrackListItemFeatured track={track} index={index} />
                    // </div>
                  ))}

            </div>
          </div>
      </div>
    );
  }
}


// bg-gradient-to-r from-transparent to-black