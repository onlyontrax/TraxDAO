"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "./use-outside-click";
import { shortenLargeNumber, formatDate } from '@lib/index';
import { LockOpenIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import Link from 'next/link'
import HoverVideoPlayer from 'react-hover-video-player';


export function ExpandableCardLarge(props) {
  const [active, setActive] = useState<(typeof props.cards)[number] | boolean | null>(
    null
  );
  const [hoverActive, setHoverActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));


  const formatSeconds = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  }

  const isUnlocked = (card) => {
    return (card.isSale === 'subscription' && card.isSubscribed || card.isSale === 'pay' && card.isBought || card.isSale === 'free');
  }

  const thumbnailOverlay = (message: String) => (
    <div className='w-full flex relative justify-center items-center h-full inset-0'>
      <div className='absolute m-auto justify-center items-center bg-[#0e0e0e] rounded-full flex flex-row py-2 px-3 gap-1'>
        <LockClosedIcon className='text-trax-white mt-[-2px]' width={14} height={14} />
        <span className='text-trax-white text-xs'>{message}</span>
      </div>
    </div>
  );

  const thumbnailVideo = (card) => {
    return (
      <div className=" rounded-lg relative flex items-start justify-start w-full pt-[56.25%] overflow-hidden transition-transform duration-200 ease-in-out">
        <div className="" style={{backgroundImage: `url("${(card?.thumbnail?.url ? card?.thumbnail?.url : card?.video.thumbnails[0])}")`}}>
          <Link href={`/video?id=${card.slug}`} passHref>
            <HoverVideoPlayer
              videoSrc={card.url}
              restartOnPaused
              playbackRangeEnd={5}
              loop={false}
              muted={false}
              // unloadVideoOnPaused
              playbackStartDelay={300}
            />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              className="flex absolute top-4 right-4 z-20 lg:hidden items-center justify-center bg-trax-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-trax-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
              <div
                // onMouseEnter={() => setHoverActive(true)}
                // onMouseLeave={() => setHoverActive(false)}
                className="h-96 lg:h-96 rounded-lg cursor-pointer"
              >

                {/* {(hoverActive == false || isUnlocked(active)) ?
                ( */}
                    <div
                     style={{backgroundImage: `url("${(active?.thumbnail?.url)}")`}}
                     className="bg-center bg-cover bg-no-repeat top-0 left-0 relative w-full h-full sm:rounded-tr-lg sm:rounded-tl-lg object-top"
                   >
                       {active.duration && (
                         <div className="text-[11px] absolute bottom-0 bg-[#00000099] px-[5px] right-0 m-3 text-trax-white rounded-md">
                           {formatSeconds(active.duration)}
                         </div>
                       )}
                       {active.limitSupply && (
                         <div style={{textShadow: '#c8ff00 1.5px 0.5px 12px'}} className="absolute border border-[#A8FF00] top-12 sm:top-0 left-0  m-3 rounded-md text-[13px] bg-[#A8FF00] px-[5px] text-[#c8ff00] ">
                           Limited release
                         </div>
                       )}
                       {(active.isSale === 'subscription' && !active.isSubscribed) && thumbnailOverlay('Members only')}
                       {(active.isSale === 'pay' && !active.isBought && !active.isSchedule) && thumbnailOverlay(`Unlock for $${active.price}`)}
                   </div>
                {/* ) : (
                    <div className="sm:rounded-tr-lg sm:rounded-tl-lg relative flex items-start justify-start w-full pt-[76.25%] overflow-hidden transition-transform duration-200 ease-in-out">
                        <div
                        className="sm:rounded-tr-lg sm:rounded-tl-lg absolute top-0 left-0 w-full h-full bg-no-repeat bg-center bg-cover"
                        style={{transition: 'all 0.2s ease-in', backgroundImage: `url("${(active?.thumbnail?.url ? active?.thumbnail?.url : active?.video.thumbnails[0])}")`}}
                        >
                          <Link href={`/video?id=${active.slug}`} passHref>
                            <HoverVideoPlayer
                              videoSrc={active.url}
                              restartOnPaused
                              playbackRangeEnd={5}
                              loop={false}
                              muted={false}
                              // unloadVideoOnPaused
                              playbackStartDelay={300}
                            />
                          </Link>
                          </div>
                    </div>
                )} */}

              </div>
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.div
                      layoutId={`stats-${active.description}-${id}`}
                      className="text-trax-neutral-500 flex flex-row gap-2"
                    >
                      <span>{active.stats.views} views</span>
                      <span>{active.stats.likes} likes</span>
                      <span>
                        {formatDate(active.updatedAt, 'll')}
                      </span>

                    </motion.div>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-trax-neutral-400"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    href={`/video?id=${active.slug}`}
                    className="px-4 py-3 text-sm rounded-full font-bold bg-trax-lime-500 text-trax-black"
                  >
                    Play
                  </motion.a>
                </div>
                {/* <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div> */}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className=" mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-start gap-4">
        {props.cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={card.title}
            onClick={() => setActive(card)}
            className="flex flex-col  hover:bg-trax-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="p-2 flex gap-2 flex-col  w-full">
            <motion.div layoutId={`image-${card.title}-${id}`}>
                <div className="h-60 rounded-lg ">
                    <div
                        style={{ backgroundImage: `url("${(card?.thumbnail?.url !== "" ? card?.thumbnail?.url : card?.thumbnail?.thumbnails[0])}")`}}
                        className="bg-center w-full bg-cover bg-no-repeat h-full top-0 left-0 relative rounded-lg"
                    >
                        {/* {hover == false || (membersOnly || unpaid) ? thumbnailImage() : thumbnailVideo()} */}
                    {card.duration && (
                      <div className="text-[11px] absolute bottom-0 bg-[#00000099] px-[5px] right-0 m-3 text-trax-white rounded-md">
                        {formatSeconds(card.duration)}
                      </div>
                    )}
                    {card.limitSupply && (
                      <div className="absolute uppercase font-heading top-0 left-0  m-3 rounded-sm text-[16px] bg-[#7E2CDD] px-[5px] text-[#FFF] ">
                        Limited Edition
                      </div>
                    )}
                    {(card.isSale === 'subscription' && !card.isSubscribed) && thumbnailOverlay('Members only')}

                    {(card.isSale === 'pay' && !card.isBought && !card.isSchedule) && thumbnailOverlay(`Unlock for $${card.price}`)}
                    </div>
                </div>
              </motion.div>
              <div className="">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-semibold text-2xl font-heading mb-0 text-[#FFFFFF] text-left"
                >
                  {card.title}
                </motion.h3>
                {(card.isSale === "pay" && !card.isBought || card.isSale === "subscribe" && !card.isSubscribed) && (
                  <motion.div
                    layoutId={`sale-${card.description}-${id}`}
                    className="text-xl text-[#A8FF00] text-left"
                  >
                    <span>
                      {(card.isSale === "pay" && !card.isBought) && `$${card.price}`}
                      {(card.isSale === "subscribe" && !card.isSubscribed) && `Subscribe`}
                    </span>
                </motion.div>
                )}

              </div>
            </div>

          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
