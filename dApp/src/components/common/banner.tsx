import { Carousel, Image } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  banners?: any;
}

export class Banner extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { banners } = this.props;
    return (
      <div className='home-banner-div'>
        {banners && banners.length > 0 && (
          <Carousel style={{marginTop: '10px'}} effect="fade" adaptiveHeight autoplay swipeToSlide arrows autoplaySpeed={6000} dots={false}>
            {banners.map((item) => (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label
              <a key={item._id} href={(item.link || null)} target="_.blank"><Image style={{ borderRadius: '12px'}} preview={false} src={item?.photo?.url} alt="banner" key={item._id} /></a>
            ))}
          </Carousel>
        )}
      </div>
    );
  }
}

Banner.defaultProps = {
  banners: []
} as Partial<IProps>;
