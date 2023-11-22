import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';
import { Tooltip } from 'antd';
import Link from 'next/link';
import styles from './product.module.scss';

interface IProps {
  product: IProduct;
}
interface IStates {
  isBookMarked: boolean;
  requesting: boolean;
}

export class ProductCard extends PureComponent<IProps, IStates> {
  render() {
    const { product } = this.props;
    const image = product?.image || '/static/no-image.jpg';
    const link = product?.downloadLink || `/store?id=${product.slug || product._id}`;
    const linkAs = product?.downloadLink || `/store?id=${product.slug || product._id}`;

    return (
      (
        <div className={styles.componentsproductModule}>
          <Link
            href={link}
            as={linkAs}
          >
            <div className="prd-card" style={{ backgroundImage: `url(${image})` }}>
              <div className="prd-card-overlay">
                <div className="label-wrapper">
                  {product.price > 0 && (
                  <span className="label-wrapper-price">
                    $
                    {product.price.toFixed(0)}
                  </span>
                  )}

                </div>
                <Tooltip title={product.name}>
                  <div className="prd-info">
                    <span>{product.name}</span>
                    {product.stock > 0 && (
                    <div className="label-wrapper-digital">
                      {product.stock}
                      {' '}
                      available
                    </div>
                    )}
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
