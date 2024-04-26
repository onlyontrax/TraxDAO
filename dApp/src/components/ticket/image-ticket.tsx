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
    return <Image alt="" src={url} width={50} height={50} style={style || { width: 50, borderRadius: 3 }} />;
  }
}

ImageTicket.defaultProps = {
  ticket: {} as ITicket,
  style: {}
} as Partial<IProps>;
