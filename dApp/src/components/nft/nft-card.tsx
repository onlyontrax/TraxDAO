import { PureComponent } from 'react';
import { INft } from 'src/interfaces';
import { Tooltip } from 'antd';
import Link from 'next/link';

interface IProps {
  nft: INft;
}
interface IStates {
  isBookMarked: boolean;
  requesting: boolean;
  image: string;
}

export class NftCard extends PureComponent<IProps, IStates> {
  
  componentWillMount() {  
    this.setState({
      image: URL.createObjectURL(new Blob([this.props.nft?.logo], {type: 'image/png'}))
    });
  }

  componentWillUnmount() {
    URL.revokeObjectURL(this.state.image);
  }
  render() {
    const { nft } = this.props;
    const { image } = this.state;
    return (
      (
        <div>
          <Link
            href={{ pathname: '/nft', query: { id: nft.id } }}
            as={`/nft/${nft.id}`}
          >
            <div className="prd-card" style={{ backgroundImage: `url(${image})` }}>
              <div className="prd-card-overlay">
                <div className="label-wrapper">
                  {nft.price > 0 && (
                  <span className="label-wrapper-price">
                    {`${nft.price}`} ICP
                  </span>
                  )}

                </div>
                <Tooltip title={nft.name}>
                  <div className="prd-info">
                    {nft.name}
                    {nft.type === 'song' && (
                    <span className="label-wrapper-digital" style={{marginLeft: '10px', backgroundColor: '#c8ff00', color: 'black', paddingLeft: '10px', paddingRight: '10px'}}>Song</span>
                    )}
                    {nft.type === 'ticket' && (
                    <span className="label-wrapper-digital" style={{marginLeft: '10px', backgroundColor: '#c8ff00', color: 'black', paddingLeft: '10px', paddingRight: '10px'}}>Ticket</span>
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
