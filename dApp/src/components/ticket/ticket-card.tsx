import { PureComponent } from 'react';
import { ITicket } from 'src/interfaces';
import { Tooltip } from 'antd';
import Link from 'next/link';
import styles from './ticket.module.scss';

interface IProps {
  ticket: ITicket;
}
interface IStates {
  isBookMarked: boolean;
  requesting: boolean;
}

export class TicketCard extends PureComponent<IProps, IStates> {
  render() {
    const { ticket } = this.props;
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
            <div className="prd-card" style={{ backgroundImage: `url(${image})` }}>
              <div className="prd-card-overlay">
                <div className="label-wrapper">
                  {/* {ticket.price > 0 && (
                  <span className="label-wrapper-price">
                    $
                    {ticket.price.toFixed(0)}
                  </span>
                  )} */}
                </div>
                {/* @ts-ignore */}
                <Tooltip title={ticket?.name}>
                  <div className="prd-info">
                    {/* @ts-ignore */}
                    <span style={{fontWeight: '300'}}>{ticket?.name}</span>
                    {/* {ticket.stock > 0 && (
                    <div className="label-wrapper-digital">
                      {ticket.stock}
                      {' '}
                      available
                    </div>
                    )} */}
                  </div>
                </Tooltip>
              </div>
            </div>
          </Link>
        </div>
      )
    );
  }
}
