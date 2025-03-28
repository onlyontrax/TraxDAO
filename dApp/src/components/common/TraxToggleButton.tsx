import React, { useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";

export interface TraxToggleProps {
  buttonSize?: "small" | "medium" | "large" | "full";
  leftText?: string;
  rightText?: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  defaultValue?: boolean;
}

export default function TraxToggle({
  buttonSize = "full",
  leftText,
  rightText,
  disabled = false,
  onChange,
  defaultValue = false
}: TraxToggleProps) {
  const [isRight, setIsRight] = useState(defaultValue);

  const buttonSizes = {
    small: "b-size-sm",
    medium: "b-size-base",
    large: "b-size-xl",
    full: "b-size-full"
  };

  const handleClick = () => {
    if (!disabled) {
      setIsRight(!isRight);
      onChange?.(!isRight);
    }
  };

  const className = `trax-button toggle ${buttonSizes[buttonSize]} ${isRight ? 'active' : ''}`;


  return (
    
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      <div className={`toggle-option ${!isRight ? 'active' : ''}`}>
        {leftText && <span>{leftText}</span>}
      </div>
      <div className={`toggle-option ${isRight ? 'active' : ''}`}>
        {rightText && <span>{rightText}</span>}
      </div>
    </button>
  );
}



//  <div className="relative bg-[#414141] rounded-full w-52">
//       <div className="grid grid-cols-2 gap-1">
//         <motion.div
//           className="absolute bg-custom-green h-[3.4rem] w-[calc(50%-1px)] rounded-full"
//           animate={{
//             x: !isRight ? '2px' : 'calc(100% + 2px)',
//           }}
//           transition={{
//             type: "spring",
//             stiffness: 200, 
//             damping: 15, 
//             mass: 1,  
//             bounce: 0.3 
//           }}
//         />
//         <button
//           onClick={() => handleClick()}
//           className={`relative z-10 uppercase text-xl font-bold font-heading px-4 py-3.5 rounded-full transition-colors duration-200 ${
//             !isRight ? 'text-trax-black' : 'text-trax-white'
//           }`}
//         >
//           {leftText}
//         </button>
//         <button
//            onClick={() => handleClick()}
//           className={`relative z-10 uppercase text-xl font-bold font-heading px-4 py-3.5 rounded-full transition-colors duration-200 ${
//             isRight ? 'text-trax-black' : 'text-trax-white'
//           }`}
//         >
//           {rightText}
//         </button>
//       </div>
//     </div>