import React, { Component } from "react";
import { Carousel, Image } from 'antd';
import { PureComponent } from 'react';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import Link from 'next/link';
// import "@splidejs/splide/dist/css/splide.min.css";
import '@splidejs/react-splide/css';
interface IProps {
  banners?: any;
}

// const options = {
//     autoWidth: true,
//     type: "loop",
//     perPage: 1,
//     focus: "center",
//     height: 300,
//     gap: 10,
//     lazyLoad: "nearby"
//   };

export class BannerNew extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    isMobile: false,
}

  async componentDidMount() {
    this.checkScreenSize();
  }

  checkScreenSize(){
    this.setState({ isMobile: window.innerWidth < 640 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 640 });
  };

  transformMobileLinks(rawLink: string){
    const baseUrls = [
      "https://trax.so",
      "https://stagingapp.trax.so"
    ];

    if (rawLink) {
      for (const baseUrl of baseUrls) {
        if (rawLink.startsWith(baseUrl)) {
          return rawLink.replace(baseUrl, '');
        }
      }
    }

    return rawLink;
  }


  render() {
    const { banners } = this.props;
    const { isMobile } = this.state;
    const sortedBanners = banners
        ? [...banners].sort((a, b) => (a.index || 0) - (b.index || 0))
        : [];
    return (
      <div className={isMobile ? 'explore-banner-div' :  'explore-banner-div-desktop'}>

        <Splide options={{
            autoWidth: true,
            type: "loop",
            // drag: "free",
            // perPage: 3,
            start: 1,
            autoplay: true,
            interval: 5000,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            speed: 1500,
            perPage: 3,
            preloadPages: 1,
            focus: 'center',
            trimSpace: false,
            pauseOnHover: true,
            // rewind: true,
            height: !isMobile ? 250 : 160,
            // updateOnMove: true,
            lazyLoad: false,
            gap: 5
        }}>
            {sortedBanners.map((item, index) => (
              <SplideSlide key={`image-${index}`} style={{width: !isMobile ? 650 : 417, height: "100%", position: 'relative'}}>
                <Link key={index} href={this.transformMobileLinks(item.btnLinkOne)} style={{
                        width: "100%",
                        height: "100%",
                        position: 'relative'
                      }}>
                    <img
                    data-splide-lazy="path-to-the-image"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      src={item?.photo?.url}
                      alt={"istanbul"}
                    />
                </Link>
                {/* <a key={item._id} href={(item.link || null)} target="_.blank"><Image style={{ borderRadius: '12px'}} preview={false} src={item?.photo?.url} alt="banner" key={item._id} /></a> */}
              </SplideSlide>
            ))}
    </Splide>
      </div>

    );
  }
}

BannerNew.defaultProps = {
  banners: []
} as Partial<IProps>;
