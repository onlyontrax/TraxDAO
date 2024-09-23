import { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { ITicket } from 'src/interfaces/ticket';
import { TicketCard } from './ticket-card';

interface IProps {
  tickets: ITicket[];
}

export class PerformerListTicket extends PureComponent<IProps> {
  render() {
    const { tickets } = this.props;
    return (
      <Row  className='flex justify-center sm:justify-start gap-y-8 gap-x-4	sm:gap-x-0'>
        {tickets.length > 0
          && tickets.map((ticket: ITicket) => (
            <Col xs={11.5} sm={11} md={8} lg={8} key={ticket._id} className='flex justify-center'>
              <TicketCard
                ticket={ticket}
              />
            </Col>
          ))}
      </Row>
    );
  }
}
