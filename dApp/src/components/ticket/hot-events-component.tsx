import { videoService } from '@services/video.service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {FaPlay} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTicket } from '@fortawesome/free-solid-svg-icons'

export default function MappedElement (event) {
  const [hover, setHover] = useState(false)
  return (
    <div key={event.event.id} className="new-track-wrapper">
      <Link href={`/event-store?id=${event.event.slug}`} 
          className="new-track-link" 
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}>

        <div className="new-track-thumb">
          <div className="new-track-bg" style={{ backgroundImage: `url(${event.event?.image?.url})` }}>
            {hover && (
              <div className='gig-btn-wrapper'>
            
                <FontAwesomeIcon className='gig-btn-nr' icon={faTicket} />
              </div>
            )}
          </div>
        </div>
        <div className="track-info-wrapper">
          <p className="track-title">{ event.event.name }</p>
          <Link 
              href={`/artist/profile?id=${event.event?.performer?.username || event.event?.performer?._id}`}
              as={`/artist/profile?id=${event.event?.performer?.username || event.event?.performer?._id}`} 
              className="track-artist"
          >
            { event.event.performer.name }
          </Link>
        </div>
      </Link>
    </div>
  )}
