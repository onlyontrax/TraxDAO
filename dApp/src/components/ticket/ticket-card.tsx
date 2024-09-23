import { PureComponent } from 'react';
import { ITicket } from 'src/interfaces';
import { Tooltip } from 'antd';
import Link from 'next/link';
import styles from './ticket.module.scss';

interface IProps {
  ticket: ITicket;
}
interface IStates {
  ticketsAvalable: boolean;
  eventEnded: boolean;
}

export class TicketCard extends PureComponent<IProps, IStates> {

  state = {
    ticketsAvalable: false,
    eventEnded: false
  }

  componentDidMount(): void {
    const { ticket } = this.props;

    let timestamp;

    if (ticket.start < ticket.end) {
      timestamp = Date.parse(ticket.date + ticket.end) + (86400000);
    } else {
      timestamp = Date.parse(ticket.date + ticket.end);
    }
    this.setState({ eventEnded: timestamp < Math.floor(Date.now()) });

    ticket?.tiers.map((t) => {
      if (Number(t.supply) > 0) {
        this.setState({ ticketsAvalable: true});
        return true;
      }
      return false;
    });
  }

  
  render() {
    const { ticket } = this.props;
    const { ticketsAvalable } = this.state;
    const image = ticket?.image || '/static/no-image.jpg';
    const link = ticket?.downloadLink || `/event-store?id=${ticket.slug || ticket._id}`;
    const linkAs = ticket?.downloadLink || `/event-store?id=${ticket.slug || ticket._id}`;

    return (
      (
        <div className={styles.componentsticketModule}>
          <Link
            href={link}
            as={linkAs}
          >
            <div className="prd-card" >
              <div className="prd-card-overlay" style={{ backgroundImage: `url(${image})` }}>
                <div className='prd-overlay'/>
                <div className="label-wrapper">
                
                {ticketsAvalable ? (
                    <div className="label-wrapper-digital">
                      Available
                    </div>
                    ):(
                      <div className="label-wrapper-digital">
                      Sold out
                    </div>
                    )}

                </div>
              </div>
                
            
                
              <div>
              <div className="prd-info">
               
               <span style={{fontWeight: '300'}}>{ticket?.name}</span>
               <br />
               <span className='font-light	text-[#bababa] text-[14px]'>{ticket?.date}</span>
           
             </div>
              </div>
            </div>
          </Link>
        </div>
      )
    );
  }
}
