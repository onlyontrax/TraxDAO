import Image from 'next/image';
import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';
import styles from './product.module.scss';

interface IProps {
  product?: IProduct;
  style?: Record<string, string>;
}

export class ImageProduct extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { product, style } = this.props;
    const url = product?.image || '/static/no-image.jpg';
    return (

      <img alt="" src={url} width={80} height={80} style={style} />
    );
  }
}

ImageProduct.defaultProps = {
  product: {} as IProduct,
  style: {}
} as Partial<IProps>;
