import React, { Component } from "react";
import { Carousel, Image } from 'antd';
import { PureComponent } from 'react';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import Link from 'next/link';
// import "@splidejs/splide/dist/css/splide.min.css";
import '@splidejs/react-splide/css';
import { PlayIcon } from "@heroicons/react/20/solid";
import { InfoCircleOutlined } from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";
interface IProps {
  banners?: any;
}

const initial = { opacity: 0, y: 20 };
const animate1 = {opacity: 1, y: 0,
  transition: {
    duration: 0.5,
    delay: 0.2,
    ease: "easeOut",
    once: true,
  },
}
const animate2 = {opacity: 1, y: 0,
  transition: {
    duration: 0.5,
    delay: 0.4,
    ease: "easeOut",
    once: true,
  },
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

export class SplideBanner extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    isMobile: false,
    isTablet: false
  }

  async componentDidMount() {
    this.checkScreenSize();
  }

  checkScreenSize(){
    this.setState({ isMobile: window.innerWidth < 500 });
    this.setState({ isTablet: window.innerWidth < 800 && window.innerWidth > 500 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 500 });
    this.setState({ isTablet: window.innerWidth < 800 && window.innerWidth > 500 });
  };



  render() {
    const { banners } = this.props;
    const { isMobile, isTablet } = this.state;
    console.log("banners", banners);
    return (
      <div className={isMobile ? 'explore-banner-div hero-banner' :  'explore-banner-div-desktop hero-banner'}>

        <Splide options={{
            autoWidth: true,
            type  : 'fade',
            // drag: "free",
            // perPage: 3,
            start: 1,
            autoplay: true,
            interval: 10000,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            speed: 1500,
            perPage: 1,
            preloadPages: 1,
            focus: 'center',
            trimSpace: false,
            pauseOnHover: true,
            height: isMobile ? "135vw" : isTablet ? "70vw" : "51.25vw",
            rewind: true,
            // updateOnMove: true,
            lazyLoad: false,
            gap: 5
        }}>
            {banners.map((item, index) => (
              <SplideSlide key={`image-${index}`} style={{width: "100%", height: isMobile ? "135vw" : isTablet ? "70vw" : "51.25vw", position: 'relative'}}>
                <div key={index} style={{
                  width: "100%",
                  height: isMobile ? "135vw" : isTablet ? "70vw" : "51.25vw",
                  position: 'relative',
                  zIndex: '5',
                  backgroundImage: isMobile ? `url(${item?.additionalImage1?.url})` : `url(${item?.photo?.url})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}>
                </div>
                {!isMobile && (
                  <div
                  // href={item?.btnLinkOne || '/'}
                    className="w-full absolute h-full top-0 z-5"
                    style={{backgroundImage: "linear-gradient(180deg, #47474700 70%, #0e0e0e 100%)", zIndex: '5'}}
                  />
                )}
                <div className="flex absolute left-1/2 transform -translate-x-1/2 w-11/12 items-center sm:transform-none sm:items-start z-10 px-3 sm:left-0 sm:pl-12 sm:top-[60%] top-[67.5%] flex-col gap-2 sm:gap-12">
                    <div className="flex flex-col gap-3 text-trax-white mb-0 text-center sm:text-start">
                      {item?.additionalImage2?.url ? (
                        <img
                          className="w-full relative h-full -top-[10px] mx-auto z-5"
                          src={item.additionalImage2.url}
                        />
                      ):(

                        <motion.span
                          initial={initial}
                          animate={animate1}
                          style={{textShadow: 'black 1.5px 0.5px 20px', lineHeight: '100%', fontFamily: 'HeadingPro'}}
                          className=" text-[60px] uppercase tracking-tighter sm:text-[140px] text-[#F2F2F2] font-black "
                        >
                          {item.title}
                        </motion.span>

                      )}

                      <motion.span initial={initial} animate={animate1} style={{textShadow: 'black 1.5px 0.5px 3px'}} className="text-xl text-[#F2F2F2] font-heading uppercase tracking-looser sm:text-3xl font-light -mt-2 mb-2 sm:-mb-6">{item.description}</motion.span>
                    </div>
                    <div className="flex flex-row gap-4 sm:w-full">
                      <motion.a initial={initial} animate={animate2} href={item?.btnLinkOne || '/'} style={{whiteSpace:'nowrap'}}  className=" cursor-pointer max-w-44 min-w-40  flex text-center  rounded-md bg-[#A8FF00] font-semibold py-2.5 px-4 sm:py-2 flex ">
                        <span className="text-md font-heading sm:text-xl bg-[#A8FF00] uppercase text-trax-black flex justify-center w-full"><PlayIcon className="h-7 w-7 pr-2 flex"/><span className="mt-[3px] sm:mt-0 ">{item.btnTextOne}</span></span>
                      </motion.a>
                      <motion.a initial={initial} animate={animate2} href={item.btnLinkTwo || '/'} style={{whiteSpace:'nowrap'}}  className=" cursor-pointer max-w-44 min-w-40 flex text-center rounded-md bg-trax-black/50 py-2.5 px-4 sm:py-2 flex ">
                        <span className="text-md font-heading sm:text-xl text-trax-white uppercase flex justify-center w-full"><InfoCircleOutlined className="h-7 w-7 pr-2 flex"/><span className="mt-[3px] sm:mt-0">{item.btnTextTwo}</span></span>
                      </motion.a>
                    </div>
                  </div>
              </SplideSlide>
            ))}
    </Splide>
      </div>

    );
  }
}

SplideBanner.defaultProps = {
  banners: []
} as Partial<IProps>;
