"use client";
import { cn } from "../../utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Confetti from 'react-dom-confetti';



const CheckIconWhite = ({ className }: { className?: string, value: any, index: any }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={"#ffffff"}
      className={cn("w-6 h-6 ", className)}
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
};

const CheckIconBlue = ({ className }: { className?: string, value: any, index: any }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={"#62b2f8"}
      className={cn("w-6 h-6 ", className)}
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
};

const CheckFilled = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#c8ff00"
      className={cn("w-6 h-6 ", className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

type LoadingState = {
  text: string;
};

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
}) => {
  return (
    <div className="flex relative justify-start max-w-xl mx-auto flex-col mt-40">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.2, 0); // Minimum opacity is 0, keep it 0.2 if you're sane.

        return (
          <motion.div
            key={index}
            className={cn("text-left flex gap-2 mb-4")}
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity: opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div>
              {(index > value + 1) && (
                <CheckIconWhite className="text-trax-white" value={value} index={index} />
              )}
              {(value + 1 === index) && (
                <CheckIconBlue className="text-trax-white" value={value} index={index} />
              )}
              {(index <= value) && (
                <CheckFilled
                  className={cn(
                    "text--trax-lime-500",
                    value === index && "text--trax-lime-500 opacity-100"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-trax-white",
                (value === index || value > index) && "text-trax-lime-500 opacity-100",
                (value + 1 === index) && "text-[#62b2f8] opacity-100"
              )}
            >
              {loadingState.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};


const config = {
  angle: 90,
  spread: 50,
  startVelocity: 9,
  elementCount: 78,
  dragFriction: 0.01,
  duration: 10000,
  stagger: 20,
  width: "10px",
  height: "10px",
  // perspective: "1000px",
  colors: ["#3e9c35", "#168118", "#036704"]
};


export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 3000,
  confetti,
  stage,
  loop = true,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  stage?: number;
  confetti: boolean;
  loop?: boolean;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }

    setCurrentState(stage)

  }, [currentState, loading, stage, confetti]);
  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{  opacity: 0  }}
          animate={{  opacity: 1  }}
          exit={{ opacity: 0  }}
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl"
        >
          <div className="h-96  relative">
            <div className="m-auto absolute inset-0 flex justify-center w-full h-full">
              <Confetti active={ confetti } config={ config }/>
            </div>
            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </div>

          <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
