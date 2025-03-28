import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const PriceBreakdown = ({ 
  amount = 0,
  stripeFee = 0,
  formatNumber = (num) => num.toFixed(2)
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col w-full mb-4">
      <div className="w-full rounded-lg shadow">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`cursor-pointer w-full px-4 py-3 flex items-center justify-between bg-trax-zinc-900 ${
            isExpanded ? 'rounded-t-lg' : 'rounded-lg'
          } focus:outline-none focus:ring-2 focus:ring-trax-green-500`}
        >
          {!isExpanded ? (
            <span className="font-medium text-trax-gray-300 flex justify-between gap-4 w-full">
              <span className="flex justify-start">Total:</span>
              <span className="flex">${(amount + stripeFee).toFixed(2)}</span>
            </span>
          ) : (
            <span className="font-medium text-trax-gray-300 flex justify-between gap-4">
              Price breakdown
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-300" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-300" />
          )}
        </div>

        {isExpanded && (
          <div className="flex flex-col text-trax-gray-300 bg-trax-zinc-900 rounded-b-lg">
            <div className="px-4 py-2 flex justify-between gap-4">
              <span className="flex justify-start">
                {Number(formatNumber(amount)).toFixed(0)}{' '}
                {amount === 1 ? 'Credit:' : 'Credits:'}
              </span>
              <span className="flex text-trax-green-500">
                ${formatNumber(amount)}
              </span>
            </div>
            <div className="px-4 py-2 flex justify-between gap-4">
              <span className="flex justify-start">Fee:</span>
              <span className="flex text-trax-green-500">
                ${amount >= 1 ? stripeFee.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="px-4 py-2 flex justify-between gap-4">
              <span className="flex justify-start">Total:</span>
              <span className="flex text-trax-green-500">
                ${amount >= 1 ? formatNumber(amount + stripeFee) : formatNumber(amount)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceBreakdown;