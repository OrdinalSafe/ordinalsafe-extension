import { ChevronRightIcon } from '@heroicons/react/20/solid';
import React from 'react';

export const GasItem = ({ label, sat, btc, rate, set, minute }) => {
  return (
    <div
      className={`flex flex-row h-16 w-72 shrink-0 bg-lightblue rounded-xl my-2 justify-between items-center py-2 px-4 cursor-pointer ${
        sat === rate ? 'bg-primary' : ''
      } `}
      onClick={() => set(sat)}
    >
      <p className="text-white text-md font-semibold text-left">
        {label} <span className="text-xs text-gray-400">~{minute} min</span>
      </p>
      <p className="text-white text-md font-semibold text-left">{btc}</p>
    </div>
  );
};
