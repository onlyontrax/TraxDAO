import { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { INft } from 'src/interfaces';
import { NftCard } from './nft-card';

interface IProps {
  items: INft[];
}

export class PerformerListNft extends PureComponent<IProps> {
  render() {
    const { items } = this.props;
    return (
      <Row>
        {items.length > 0
          && items.map((nft: INft) => (
            <Col xs={12} sm={12} md={8} lg={6} key={nft.id}>
              <NftCard
                nft={nft}
              />
            </Col>
          ))}
      </Row>
    );
  }
}
