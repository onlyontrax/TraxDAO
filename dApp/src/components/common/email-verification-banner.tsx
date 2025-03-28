import { Mail, X } from 'lucide-react';
import React from 'react';

export const EmailVerificationBanner: React.FC<{ onVerify: () => void }> = ({ onVerify }) => {
  return (
    <div className="relative bg-[#0e0e0e]  py-3">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* <div className="flex h-12 w-12 rounded-full items-center justify-center">
          <Mail className="h-8 w-8 text-custom-green" />
        </div> */}
        <div className="flex flex-col">
          <span className="text-2xl font-heading uppercase font-bold text-trax-white">
            Ready to explore TRAX?
          </span>
          <span className="text-sm text-trax-gray-300">
            Just one step left. Verify your email to unlock all features.
          </span>
        </div>
        <button 
          className="flex bg-custom-green text-base hover:opacity-7 text-trax-black font-bold font-heading uppercase w-fit px-6 py-0.5 rounded-lg shadow-sm"
          onClick={onVerify}
        >
          Verify Now
        </button>
      </div>
    </div>
  );
};

