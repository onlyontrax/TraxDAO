import { PureComponent } from 'react';
import { SocketContext } from './SocketContext';
import { warning } from './utils';

interface IEventProps {
  event: string;
  handler: Function;
}

class Event extends PureComponent<IEventProps> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { event, handler } = this.props;
    const socket = this.context;

    if (!socket) {
      warning('Socket IO connection has not been established.');
      return;
    }
    // @ts-ignore
    socket.on(event, handler);
  }

  componentWillUnmount() {
    const { event } = this.props;
    const socket = this.context;

    if (!socket) {
      warning('Socket IO connection has not been established.');
      return;
    }
    // @ts-ignore
    socket.off(event);
  }

  render() {
    return false;
  }
}

Event.contextType = SocketContext;

export default Event;
