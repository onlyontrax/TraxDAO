"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "../../utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { useOutsideClick } from "./use-outside-click";
import Link from 'next/link';
import CountHeading from "@components/common/count-heading";

interface CarouselItem {
  index: number;
  element: JSX.Element;
}

interface CarouselProps {
  items: CarouselItem[];
  initialScroll?: number;
}

const initial = { opacity: 0, y: 20 };
const initial2 = { opacity: 0, x: -20, y: -10 };

const animate = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 1.2,
    delay: 1,
    ease: "easeOut",
    once: true,
  },
}

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sortedItems = items
        ? [...items].sort((a, b) => (a.index || 0) - (b.index || 0))
        : [];

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384;
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return window && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="mx-0 relative w-full">
        <motion.div
            initial={initial}
            animate={animate}
            className="w-full flex flex-row gap-2 justify-start mx-0 my-4">
          <CountHeading isLarge={true} title={"Featured artists"} count={sortedItems.length} />
        </motion.div>
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth [scrollbar-width:none] snap-x snap-mandatory"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l"
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-6 sm:pl-10 py-2",
              "max-w-7xl"
            )}
          >
            {sortedItems.map((item, index) => (
              <motion.div
                initial={initial}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    delay: 1 + (index * 0.2),
                    ease: "easeOut",
                    once: true,
                  },
                }}
                key={"card" + index}
                className="last:pr-[1.5%] md:last:pr-[0] rounded-lg snap-center"
              >
                <Card card={item} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

// Rest of the component remains the same...

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: any;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  const transformMobileLinks = (rawLink: string) => {
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

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 h-screen z-50 overflow-auto rounded-lg">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-trax-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-5xl mx-auto bg-trax-neutral-900 h-fit  z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative"
            >
              <button
                className="sticky top-4 h-8 w-8 right-0 ml-auto bg-trax-white rounded-full flex items-center justify-center"
                onClick={handleClose}
              >
                <IconX className="h-6 w-6 text-trax-neutral-900" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-trax-white"
              >
                {card.description}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="text-2xl md:text-5xl font-semibold  mt-4 text-trax-white"
              >
                {card.title}
              </motion.p>
              {/* <div className="py-10">{card.content}</div> */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.div
      layoutId={layout ? `card-${card.title}` : undefined}
      className="hover:scale-1025 transition-all duration-500 rounded-lg bg-trax-neutral-900 h-[24rem] w-[18rem] md:h-[27rem] md:w-[20rem] overflow-hidden flex flex-col items-start justify-end relative z-10"
      whileHover="hover"
    >
      <Link href={transformMobileLinks(card.link)}>
        <div
          className="absolute h-full top-0 inset-x-0 z-30 pointer-events-none"
          style={{background: "linear-gradient(0deg, black, transparent)"}}
        />
        <motion.p
          layoutId={layout ? `category-${card.description}` : undefined}
          className="backdrop-blur rounded bg-slaps-gray px-[11px] z-[40] py-[7px] text-trax-white uppercase text-sm md:text-[1rem] leading-[1rem] font-semibold font-heading text-left absolute top-3 left-3"
        >
          {card.description}
        </motion.p>
        <motion.div
          className="relative z-40 p-4 sm:p-8"
          variants={{
            hover: { y: -20 }
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="text-trax-white uppercase text-[3.8rem] md:text-[4rem] leading-[3.5rem] md:leading-[3.5rem] font-[700] font-heading break-words hyphens-auto overflow-wrap-anywhere max-w-xs text-left [text-wrap:balance] mt-2"
            style={{
              WebkitHyphens: 'auto',
              msHyphens: 'auto',
              hyphens: 'auto',
              overflowWrap: 'break-word',
              wordBreak: 'break-word'
            }}
          >
            {card.title}
          </motion.p>
        </motion.div>
        <div
          style={{ backgroundImage: `url("${card?.photo.url}")` }}
          className="bg-center w-full z-10 bg-cover bg-no-repeat h-full inset-0 absolute rounded-lg"
        />
      </Link>
    </motion.div>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  );
};
