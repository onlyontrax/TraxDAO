import { ticketService } from '@services/ticket.service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {FaPlay} from 'react-icons/fa'
import MappedElement from './hot-events-component'



export default function HotEvents() {
  const [events, setEvents] = useState([]);
  // const [isHovered, setIsHovered] = useState(false);
  const loadRecentTracks = async () => {
    const response = (await ticketService.hotEvents());
    setEvents(response.data);
  };

  useEffect(() => {
    loadRecentTracks();
  }, []);

  return (
    <>
      {events.length > 0 && (
        <div className="new-releases-container">
          <p className="new-releases-header">Upcoming events</p>
          <div className="new-releases-wrapper">
            {/* {events.length > 0 ? (
              <> */}
                {events.map((event) => (<MappedElement key={event._id} event={event} />))}
              {/* </>
            ) : (
              <div className="no-events-wrapper">
                <div className="no-events">
                  <span>No upcoming events. Stay tuned.</span>
                </div>
              </div>
            )} */}

          </div>
        </div>
      )}
    </>
  );
}