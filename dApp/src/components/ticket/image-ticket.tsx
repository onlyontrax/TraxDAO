import { ITicket } from '@interfaces/ticket';
import Image from 'next/image';
import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';

interface IProps {
  ticket?: ITicket;
  style?: Record<string, string>;
}

export class ImageTicket extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { ticket, style } = this.props;
    const url = ticket?.image || '/static/no-image.jpg';
    return <img alt="" src={url} width={80} height={80} style={style}  />;
  }
}

ImageTicket.defaultProps = {
  ticket: {} as ITicket,
  style: {}
} as Partial<IProps>;
