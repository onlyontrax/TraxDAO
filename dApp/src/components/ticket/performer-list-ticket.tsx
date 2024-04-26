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
      <Row style={{rowGap: '3rem'}}>
        {tickets.length > 0
          && tickets.map((ticket: ITicket) => (
            <Col xs={12} sm={12} md={8} lg={6} key={ticket._id}>
              <TicketCard
                ticket={ticket}
              />
            </Col>
          ))}
      </Row>
    );
  }
}
