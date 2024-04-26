import { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { ITicket } from 'src/interfaces/ticket';
import { PurchasedTicketCard } from './purchased-ticket-card';

interface IProps {
  tickets: ITicket[];
}

export class UserListTicket extends PureComponent<IProps> {
  render() {
    const { tickets } = this.props;
    return (
      <Col style={{rowGap: '3rem'}}>
        {tickets.length > 0
          && tickets.map((ticket: ITicket) => (
            // <Col xs={12} sm={12} md={8} lg={6} key={ticket._id}>
              <PurchasedTicketCard
                //@ts-ignore
                ticket={ticket}
              />
            // </Col>
          ))}
      </Col>
    );
  }
}
