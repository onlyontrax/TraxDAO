import React from 'react';

const CountHeading = ({ count, title, isLarge, className = '' }) => (
  <span className={`text-3xl text-trax-white ml-0 font-bold font-heading uppercase ${className}`}>
    <span className={` ${isLarge ? 'text-base align-super pl-6 sm:pl-10' : 'text-base align-top'} font-body font-light mr-2`}>
      ({count})
    </span>
    {title}
  </span>
);

export default CountHeading;