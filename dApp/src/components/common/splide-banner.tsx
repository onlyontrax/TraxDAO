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
import TraxButton from "./TraxButton";

interface IProps {
  banners?: any;

}


const initial2 = { opacity: 0, y: 20 };


const first = {
    initial: {
      opacity: 0,
      y: 0
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.3,
        delay: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
}

const second = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

const animate3 = {opacity: 1, y: 0,
  transition: {
    duration: 0.5,
    delay: 1,
    ease: "easeOut",
    once: true,
  },
}



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
    const { isMobile, isTablet } = this.state;

    const sortedBanners = banners
        ? [...banners].sort((a, b) => (a.index || 0) - (b.index || 0))
        : [];
    return (
      <div className={isMobile ? 'explore-banner-div-desktop hero-banner' :  'explore-banner-div-desktop hero-banner -mt-[80px]'}>

        <Splide options={{
            autoWidth: true,
            type  : 'fade',
            // drag: "free",
            // perPage: 3,
            start: 1,
            autoplay: true,
            // interval: 8000,
            interval: 8000,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            speed: 1500,
            perPage: 1,
            preloadPages: 1,
            focus: 'center',
            trimSpace: false,
            pauseOnHover: true,
            height: isMobile ? "80vh" : isTablet ? "50vh" : "45vw",
            rewind: true,
            // updateOnMove: true,
            lazyLoad: false,
            gap: 5
        }}>
            {sortedBanners && sortedBanners?.map((item, index) => (
              <SplideSlide key={`image-${index}`} style={{width: "100%", height: isMobile ? "80vh" : isTablet ? "50vh" : "45vw", position: 'relative'}}>
                <motion.div initial="initial" animate="animate" exit="exit" variants={first} key={index} style={{
                  width: "100%",
                  height: isMobile ? "80vh" : isTablet ? "50vh" : "45vw",
                  position: 'relative',
                  zIndex: '5',
                  backgroundImage: isMobile ? `url(${item?.additionalImage1?.url})` : `url(${item?.photo?.url})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}>
                </motion.div>
                {/* {!isMobile && ( */}
                  <div
                    className="w-full absolute h-full top-0 z-5"
                    style={{backgroundImage: "linear-gradient(180deg, #47474700 70%, #0e0e0e 100%)", zIndex: '5'}}
                  />
                {/* )} */}
                <div className="relative w-full">
                  <div className="flex absolute left-1/2 transform -translate-x-1/2 w-full sm:transform-none z-10 sm:pl-10 bottom-10 sm:bottom-6 sm:left-0">
                    <div className="w-full flex flex-col md:flex-col gap-4 sm:gap-4">
                      <div className="flex flex-col gap-2 sm:gap-3 w-full">
                        <div className="flex flex-col items-center sm:items-start">
                          <motion.span
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={second}
                            style={{
                              textShadow: 'black 1.5px 0.5px 20px',
                              lineHeight: '100%',
                              fontFamily: 'HeadingPro'
                            }}
                            className="flex uppercase tracking-tighter text-6xl sm:text-7xl lg:text-8xl text-trax-white font-black"
                          >
                            {item.title}
                          </motion.span>
                         {/*  <motion.div><Image height={10} width={10} src={item.performer.avatar}/></motion.div>   */}
                          <motion.span
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={second}
                            style={{textShadow: 'black 1.5px 0.5px 3px'}}
                            className="flex text-2xl text-trax-white font-body sm:text-2xl lg:text-2xl font-light pl-1"
                          >
                            {item.description}
                          </motion.span>
                        </div>
                      </div>

                      {/* Buttons container fixed at bottom */}
                      <div className="flex flex-col gap-2 md:w-full w-full justify-between md:justify-start items-center sm:items-start">

                        {/* <motion.a initial={initial2} animate={animate3}>
                          <Link href={item?.btnLinkOne || '/'}>
                            <TraxButton
                              htmlType="button"
                              styleType="play"
                              buttonText={item.buttonText}
                              icon={<PlayIcon className="h-8 w-8 mx-auto"/>}
                            />
                          </Link>
                        </motion.a> */}
                        <motion.a initial={initial2} animate={animate3}>
                          <Link href={this.transformMobileLinks(item?.btnLinkTwo || '/')}>
                            <TraxButton
                              htmlType="button"
                              styleType="white"
                              buttonSize="full"
                              buttonText={item.btnTextOne}
                              icon={<PlayIcon className="h-8 w-8 pr-2 mt-[-2px] flex text-center"/>}
                            />
                          </Link>
                        </motion.a>
                      </div>
                    </div>
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
