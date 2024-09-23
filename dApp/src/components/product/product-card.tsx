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
            <div className="prd-card" >
              <div className="prd-card-overlay" style={{ backgroundImage: `url(${image})` }}>
                <div className='prd-overlay'/>
                <div className="label-wrapper">
                {product.stock > 0 ? (
                    <div className="label-wrapper-digital">
                      In stock
                    </div>
                    ):(
                      <div className="label-wrapper-digital">
                      Sold out
                    </div>
                    )}

                </div>
              </div>
                
            
                
              <div>
                <div className="prd-info">
                  <span style={{fontWeight: '300'}}>{product?.name}</span>
                  <br />
                  <span className='font-light	text-[#bababa] text-[14px]'>${product?.price}</span>
                </div>
              </div>
            </div>

            {/* <div className="prd-card" style={{ backgroundImage: `url(${image})` }}>
              <div className="prd-card-overlay">
                
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
            </div> */}
          </Link>
        </div>
      )
    );
  }
}
