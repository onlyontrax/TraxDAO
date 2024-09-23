import { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { IProduct } from 'src/interfaces/product';
import { ProductCard } from './product-card';

interface IProps {
  products: IProduct[];
}

export class PerformerListProduct extends PureComponent<IProps> {
  render() {
    const { products } = this.props;
    return (
      <Row style={{rowGap: '2rem'}} className='flex justify-center sm:justify-start '>
        {products.length > 0
          && products.map((product: IProduct) => (
            <Col xs={11.5} sm={11} md={8} lg={8}  key={product._id} className='flex justify-center'>
              <ProductCard
                product={product}
              />
            </Col>
          ))}
      </Row>
    );
  }
}
