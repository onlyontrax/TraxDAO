"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "./use-outside-click";
import { shortenLargeNumber, formatDate } from '@lib/index';
import { LockOpenIcon, LockClosedIcon, PlayIcon } from '@heroicons/react/24/solid';




export function ExpandableCards(props) {
  const [active, setActive] = useState<(typeof props.cards)[number] | boolean | null>(
    null
  );
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

//   const backgroundImageStyle = {
//     backgroundImage: `url("${(props.cards?.thumbnail?.url ? props.cards?.thumbnail?.url : props.cards?.video.thumbnails[0])}")`
//   };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    // if (active && typeof active === "object") {
    //   document.body.style.overflow = "hidden";
    // } else {
      document.body.style.overflow = "auto";
    // }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));


  const subText= (card) => {
    if(card.isSale === "pay"){
      if(card.isBought){
        return;
      }else{
        if(card.limitSupply){
          if(card.supply > 0){
            return <span className="text-trax-lime-500">Limited release</span>
          }else{
            return <span className="text-trax-red-500">Sold out</span>
          }
        }else{
          return `$${card.price}`
        }
      }
    }
    if(card.isSale === "subscribe"){
      return "Subscribe"
    }
  }

  const activeBtn = (card) => {
    return (
      <span
        className="flex flex-row  gap-1.5"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? (
          <LockOpenIcon className='mt-[3px]' width={14} height={14} />
        ) : (
          <LockClosedIcon className='mt-[3px]' width={14} height={14} />
        )}
        {(((card.limitSupply && card.supply > 0) || !card.limitSupply) && card.isSale === "pay" && !card.isBought) && `Unlock for $${card.price}`}
        {(card.isSale === "subscribe" && !card.isSubscribed) && `Subscribe to unlock`}
        {(card.limitSupply && card.supply > 0 && (card.isSale === "pay" && !card.isBought)) && "Limited release"}
        {(card.limitSupply && card.supply === 0 && (card.isSale === "pay" && !card.isBought)) && "Sold out"}
      </span>
    )
  }

  return (
    <div key={props._id}>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-trax-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
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
              className="flex absolute top-2 right-2 z-20 lg:hidden items-center justify-center bg-trax-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-trax-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
              <div className="h-96 lg:h-96 rounded-lg ">
                <div
                  style={{backgroundImage: `url("${(active?.thumbnail?.url)}")`}}
                  className="bg-center bg-cover bg-no-repeat top-0 left-0 relative w-full h-full sm:rounded-tr-lg sm:rounded-tl-lg object-top"
                />
              </div>
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
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
                    {(active.isSale === "pay" && !active.isBought || active.isSale === "subscribe" && !active.isSubscribed) && (
                    <motion.a
                      layoutId={`sale-${active.description}-${id}`}
                      className=" flex mt-4 w-full"
                      href={`/video?id=${active.slug}`}
                    >
                      <div className="flex rounded-full bg-trax-black text-trax-white px-4 py-2">
                        {activeBtn(active)}
                      </div>
                    </motion.a>
                    )}
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={`/video?id=${active.slug}`}
                    className="px-4 py-3 text-sm rounded-full font-bold bg-trax-lime-500 text-trax-black"
                  >
                    Play
                  </motion.a>
                </div>

              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-[48rem] mx-auto w-full gap-4" >
        {props.cards.map((card, index) => (

          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="p-3 sm:p-4 flex flex-row justify-between items-center hover:bg-trax-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-row">
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <div className="h-16 w-16 rounded-lg ">
                <div
                  style={{ backgroundImage: `url("${(card?.thumbnail?.url)}")`}}
                  className="bg-center w-full bg-cover bg-no-repeat h-full top-0 left-0 relative rounded-lg"
                />
                </div>
              </motion.div>
              <div className="mt-1">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-semibold font-heading text-xl sm:text-2xl text-[#FFF] text-left"
                  style={{marginTop: (card.isSale === "pay" && card.isBought || card.isSale === "subscribe" && card.isSubscribed || card.isSale === "free") && "15px"}}
                >
                  {card.title}
                </motion.h3>
                {(card.isSale === "pay" && !card.isBought || card.isSale === "subscribe" && !card.isSubscribed) && (
                  <motion.div
                    layoutId={`sale-${card.description}-${id}`}
                    className="font-medium text-trax-neutral-200 -mt-2 text-left"
                  >
                    <span>
                      {subText(card)}
                    </span>
                </motion.div>
                )}

              </div>
            </div>
            <motion.a
              layoutId={`button-${card.title}-${id}`}
              href={`/video?id=${card.slug}`}
              className="px-4 py-2 text-sm rounded-full font-bold bg-trax-gray-100 hover:bg-trax-lime-500 hover:text-white text-trax-black mt-0"
            >
              <PlayIcon className="h-6 w-6 text-neutral-900"/>
            </motion.a>
          </motion.div>
        ))}
      </ul>
    </div>
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

const cards = [
  {
    description: "Lana Del Rey",
    title: "Summertime Sadness",
    src: "https://assets.aceternity.com/demos/lana-del-rey.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Lana Del Rey, an iconic American singer-songwriter, is celebrated for
          her melancholic and cinematic music style. Born Elizabeth Woolridge
          Grant in New York City, she has captivated audiences worldwide with
          her haunting voice and introspective lyrics. <br /> <br /> Her songs
          often explore themes of tragic romance, glamour, and melancholia,
          drawing inspiration from both contemporary and vintage pop culture.
          With a career that has seen numerous critically acclaimed albums, Lana
          Del Rey has established herself as a unique and influential figure in
          the music industry, earning a dedicated fan base and numerous
          accolades.
        </p>
      );
    },
  },
  {
    description: "Babbu Maan",
    title: "Mitran Di Chhatri",
    src: "https://assets.aceternity.com/demos/babbu-maan.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Babu Maan, a legendary Punjabi singer, is renowned for his soulful
          voice and profound lyrics that resonate deeply with his audience. Born
          in the village of Khant Maanpur in Punjab, India, he has become a
          cultural icon in the Punjabi music industry. <br /> <br /> His songs
          often reflect the struggles and triumphs of everyday life, capturing
          the essence of Punjabi culture and traditions. With a career spanning
          over two decades, Babu Maan has released numerous hit albums and
          singles that have garnered him a massive fan following both in India
          and abroad.
        </p>
      );
    },
  },

  {
    description: "Metallica",
    title: "For Whom The Bell Tolls",
    src: "https://assets.aceternity.com/demos/metallica.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Metallica, an iconic American heavy metal band, is renowned for their
          powerful sound and intense performances that resonate deeply with
          their audience. Formed in Los Angeles, California, they have become a
          cultural icon in the heavy metal music industry. <br /> <br /> Their
          songs often reflect themes of aggression, social issues, and personal
          struggles, capturing the essence of the heavy metal genre. With a
          career spanning over four decades, Metallica has released numerous hit
          albums and singles that have garnered them a massive fan following
          both in the United States and abroad.
        </p>
      );
    },
  },
  {
    description: "Led Zeppelin",
    title: "Stairway To Heaven",
    src: "https://assets.aceternity.com/demos/led-zeppelin.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Led Zeppelin, a legendary British rock band, is renowned for their
          innovative sound and profound impact on the music industry. Formed in
          London in 1968, they have become a cultural icon in the rock music
          world. <br /> <br /> Their songs often reflect a blend of blues, hard
          rock, and folk music, capturing the essence of the 1970s rock era.
          With a career spanning over a decade, Led Zeppelin has released
          numerous hit albums and singles that have garnered them a massive fan
          following both in the United Kingdom and abroad.
        </p>
      );
    },
  },
  {
    description: "Mustafa Zahid",
    title: "Toh Phir Aao",
    src: "https://assets.aceternity.com/demos/toh-phir-aao.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          &quot;Aawarapan&quot;, a Bollywood movie starring Emraan Hashmi, is
          renowned for its intense storyline and powerful performances. Directed
          by Mohit Suri, the film has become a significant work in the Indian
          film industry. <br /> <br /> The movie explores themes of love,
          redemption, and sacrifice, capturing the essence of human emotions and
          relationships. With a gripping narrative and memorable music,
          &quot;Aawarapan&quot; has garnered a massive fan following both in
          India and abroad, solidifying Emraan Hashmi&apos;s status as a
          versatile actor.
        </p>
      );
    },
  },
];
