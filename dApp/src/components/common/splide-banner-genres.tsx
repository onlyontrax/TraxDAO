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
  content?: any;
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



export class SplideBannerGenres extends PureComponent<IProps> {
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
    const { content } = this.props;
    const { isMobile, isTablet } = this.state;
    const sortedContent = content
    ? [...content].sort((a, b) => (a.index || 0) - (b.index || 0))
    : [];

    return (
      <div className={isMobile ? 'explore-banner-div-desktop hero-banner ' :  'explore-banner-div-desktop hero-banner -mt-[80px]'}>

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
            height: isMobile ? "90vh" : isTablet ? "70vw" : "51.25vw",
            rewind: true,
            // updateOnMove: true,
            lazyLoad: false,
            gap: 5
        }}>
            {sortedContent && sortedContent.map((item, index) => (
              <SplideSlide key={`image-${index}`} style={{width: "100%", height: isMobile ? "90vh" : isTablet ? "70vw" : "51.25vw", position: 'relative'}}>
                <motion.div initial="initial" animate="animate" exit="exit" variants={first} key={index} style={{
                  width: "100%",
                  height: isMobile ? "90vh" : isTablet ? "70vw" : "51.25vw",
                  position: 'relative',
                  zIndex: '5',
                //   backgroundImage: isMobile ? `url(${item?.video?.url})` : `url(${item?.photo?.url})`,
                  backgroundImage: `url(${item.thumbnail?.url })`,
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
                  <div className="flex absolute left-1/2 transform -translate-x-1/2 w-full sm:transform-none z-10 pl-3 sm:pl-12 bottom-10 sm:bottom-6 sm:left-0">
                    <div className="w-full flex flex-col md:flex-row gap-4 sm:gap-12">
                      <div className="flex flex-col gap-2 sm:gap-3 w-full">
                        <div className="flex flex-col gap-2 sm:gap-1 items-start">
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
                            className="flex uppercase tracking-tighter text-8xl lg:text-[100px] text-[#F2F2F2] font-black"
                          >
                            {item.title}
                          </motion.span>

                          <motion.div><Image height={10} width={10} src={item.performer.avatar}/></motion.div>  
                          <motion.span
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={second}
                            style={{textShadow: 'black 1.5px 0.5px 3px'}}
                            className="flex text-xl text-[#F2F2F2] font-heading uppercase tracking-looser sm:text-2xl lg:text-3xl font-light -mt-2 mb-2 sm:-mb-6 pl-1"
                          >
                            {item?.performer?.name}
                          </motion.span>
                        </div>
                      </div>

                      {/* Buttons container fixed at bottom */}
                      <div className="flex flex-row gap-8 md:w-auto w-full justify-end items-end">
                        {/* <motion.a initial={initial2} animate={animate3}>
                          <Link href={item?.btnLinkTwo || '/'}>
                            <TraxButton
                              htmlType="button"
                              styleType="secondary"
                              buttonSize="medium"
                              buttonText={item.btnTextTwo}
                              icon={<InfoCircleOutlined className="h-7 w-7 pr-2 flex text-center"/>}
                            />
                          </Link>
                        </motion.a> */}
                        <motion.a initial={initial2} animate={animate3}>
                          <Link href={`/${item?.trackType === 'video' ? 'video' : 'track'}?id=${item.slug}`}>
                            <TraxButton
                              htmlType="button"
                              styleType="side"
                              buttonSize="large"
                              buttonText={"Play"}
                              icon={<PlayIcon className="h-7 w-7 pr-2"/>}
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

SplideBannerGenres.defaultProps = {
  banners: []
} as Partial<IProps>;
