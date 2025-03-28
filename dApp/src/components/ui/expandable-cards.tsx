import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "./use-outside-click";
import { shortenLargeNumber, formatDate } from '@lib/index';
import { LockOpenIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import TraxButton from "@components/common/TraxButton";

export function ExpandableCards(props) {
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event) {
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

  const subText = (card) => {
    if(card.isSale === "pay"){
      if(card.isBought) return;
      if(card.limitSupply){
        return card.supply > 0
          ? <span className="text-trax-lime-500">Limited release</span>
          : <span className="text-trax-red-500">Sold out</span>;
      }
      return `$${card.price.toString()}`;
    }
    if(card.isSale === "subscription") return "Members only";
  }

  const formatSeconds = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  const activeBtn = (card) => (
    <span
      className="flex flex-row gap-1.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered
        ? <LockOpenIcon className="mt-[3px]" width={14} height={14} />
        : <LockClosedIcon className="mt-[3px]" width={14} height={14} />
      }
      {(((card.limitSupply && card.supply > 0) || !card.limitSupply) && card.isSale === "pay" && !card.isBought) &&
        `Unlock for $${card.price}`}
      {(card.isSale === "subscription" && !card.isSubscribed) &&
        `Members only`}
      {(card.limitSupply && card.supply === 0 && (card.isSale === "pay" && !card.isBought)) &&
        "Sold out"}
    </span>
  )

  return (
    <div key={props._id} className="relative">
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-trax-black/20 z-10"
            style={{ height: '100vh' }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 flex items-center justify-center z-[100]" >
            <motion.button
              key={`button-${active.title}-${active._id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 }}}
              className="absolute top-4 right-4 z-20 lg:hidden flex items-center justify-center bg-trax-white rounded-full h-8 w-8"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full h-full md:h-auto max-w-[500px] flex flex-col bg-trax-neutral-900 sm:rounded-3xl overflow-hidden"
              style={{ overflowY: 'auto' }}
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <div className="h-64 sm:h-96">
                  <div
                    style={{backgroundImage: `url("${active?.thumbnail?.url}")`}}
                    className="bg-center bg-cover bg-no-repeat w-full h-full sm:rounded-t-3xl"
                  />
                </div>
              </motion.div>

              <div className="flex-1 overflow-y-auto">
                <div className="flex justify-between items-start p-4">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-3xl text-neutral-200 font-heading"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.div
                      layoutId={`stats-${active.description}-${id}`}
                      className="text-trax-neutral-500 flex flex-row gap-2 text-sm"
                    >
                      <span>{active.stats.views} views</span>
                      <span>{active.stats.likes} likes</span>
                      <span>{formatDate(active.updatedAt, 'll')}</span>
                    </motion.div>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-trax-neutral-400 mt-2"
                    >
                      {active.description}
                    </motion.p>
                    {(active.isSale === "pay" && !active.isBought ||
                      active.isSale === "subscription" && !active.isSubscribed) && (
                      <motion.a
                        layoutId={`sale-${active.description}-${id}`}
                        className="inline-block mt-4"
                        href={`/${active?.trackType === 'video' ? 'video' : 'track'}?id=${active.slug}`}
                      >
                        <div className="rounded-full bg-trax-black text-trax-white px-4 py-2">
                          {activeBtn(active)}
                        </div>
                      </motion.a>
                    )}
                  </div>
                  <div>
                    <TraxButton
                      htmlType="button"
                      styleType="primary"
                      buttonSize="small"
                      buttonText="Play"
                      onClick={() => {
                        window.location.href = `/${active?.trackType === 'video' ? 'video' : 'track'}?id=${active.slug}`;
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <ul className="mx-auto w-full gap-2 flex flex-col max-w-[1000px]">
        {props.cards.map((card, index) => (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}-${index}`}
            className="flex items-center gap-4 rounded-lg p-2 pr-4 cursor-pointer hover:bg-trax-zinc-900 transition-colors"
          >
            <div onClick={() => setActive(card)} className="flex gap-4 flex-row w-full">
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <div className="h-14 w-14 rounded-lg overflow-hidden">
                  <div
                    style={card?.thumbnail?.url ? { backgroundImage: `url("${card.thumbnail.url}")` } : {}}
                    className="bg-center w-full bg-cover bg-no-repeat h-full"
                  />
                </div>
              </motion.div>
              <div className="flex-1">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-semibold font-heading text-xl mb-0 sm:text-3xl text-white"
                >
                  {card.title}
                </motion.h3>
                <div className="text-sm text-[#b7b7b7] font-[300]">
                  <span>{card?.performer?.name}</span>
                </div>
              </div>
            </div>
            <motion.a
              layoutId={`button-${card.title}-${id}`}
              href={`/${card?.trackType === 'video' ? 'video' : 'track'}?id=${card.slug}`}
              className="text-sm text-trax-gray-400"
            >
              {formatSeconds(card?.video.duration)}
            </motion.a>
          </motion.div>
        ))}
      </ul>
    </div>
  );
}

export const CloseIcon = () => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 }}}
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