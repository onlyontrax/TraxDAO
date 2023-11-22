import Image from 'next/image';
import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';

interface IProps {
  product?: IProduct;
  style?: Record<string, string>;
}

export class ImageProduct extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { product, style } = this.props;
    const url = product?.image || '/static/no-image.jpg';
    return <Image alt="" src={url} width={50} height={50} style={style || { width: 50, borderRadius: 3 }} />;
  }
}

ImageProduct.defaultProps = {
  product: {} as IProduct,
  style: {}
} as Partial<IProps>;
