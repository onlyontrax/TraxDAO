import { authService } from '@services/auth.service';
import { getGlobalConfig } from '@services/config';
import { Children, Component } from 'react';
import { connect } from 'react-redux';
import SocketIO from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { debug, warning } from './utils';

interface ISocketProps {
  uri?: string;
  children: any;
  loggedIn: boolean;
}

class Socket extends Component<ISocketProps> {
  socket;

  static defaultProps: Partial<ISocketProps>;

  constructor(props) {
    super(props);
    this.connect();
  }

  shouldComponentUpdate(nextProps: any) {
    const { loggedIn } = this.props;
    if (nextProps.loggedIn !== loggedIn) {
      this.connect();
    }
    return true;
  }

  componentWillUnmount() {
    // @ts-ignore
    this.socket && this.socket.close();
  }

  login() {
    if (!this.socket) {
      return false;
    }

    const token = authService.getToken() || '';
    // @ts-ignore
    return this.socket.emit('auth/login', {
      token
    });
  }

  connect() {
    const token = authService.getToken() || '';
    if (!process.browser || !token) {
      return;
    }
    let { uri = process.env.NEXT_PUBLIC_SOCKET_ENDPOINT } = this.props;

    if (!uri) {
      uri = process.env.NEXT_PUBLIC_SOCKET_ENDPOINT;
    }

    const options = {
      transports: ['websocket', 'polling', 'long-polling'],
      query: token ? `token=${token}` : ''
    };
    this.socket = SocketIO(uri, this.mergeOptions(options));

    this.socket.status = 'initialized';
    // @ts-ignore
    this.socket.on('connect', () => {
      this.socket.status = 'connected';
      if (token) {
        this.login();
      }
      debug('connected');
    });
    // @ts-ignore
    this.socket.on('disconnect', () => {
      this.socket.status = 'disconnected';
      debug('disconnect');
    });
    // @ts-ignore
    this.socket.on('error', (err) => {
      this.socket.status = 'failed';
      warning('error', err);
    });
    // @ts-ignore
    this.socket.on('reconnect', (data) => {
      this.socket.status = 'connected';
      if (token) {
        this.login();
      }
      debug('reconnect', data);
    });
    // @ts-ignore
    this.socket.on('reconnect_attempt', () => {
      debug('reconnect_attempt');
    });
    // @ts-ignore
    this.socket.on('reconnecting', () => {
      this.socket.status = 'reconnecting';
      debug('reconnecting');
    });
    // @ts-ignore
    this.socket.on('reconnect_failed', (error) => {
      this.socket.status = 'failed';
      warning('reconnect_failed', error);
    });
  }

  mergeOptions(options = {}) {
    const defaultOptions = {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1 * 1000,
      reconnectionDelayMax: 10 * 1000,
      autoConnect: true,
      transports: ['websocket', 'polling', 'long-polling'],
      rejectUnauthorized: true
    };
    return { ...defaultOptions, ...options };
  }

  render() {
    const { children } = this.props;
    return (
      <SocketContext.Provider value={this.socket}>
        {Children.only(children)}
      </SocketContext.Provider>
    );
  }
}

Socket.defaultProps = {
  uri: ''
} as Partial<ISocketProps>;

const mapStates = (state: any) => ({
  loggedIn: state.auth.loggedIn
});

export default connect(mapStates, null)(Socket);
