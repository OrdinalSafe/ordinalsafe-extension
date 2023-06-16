import { ChevronRightIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';
import { satoshisToBTC, showToast } from '../utils';

export const GasCustomItem = ({ set, max, calculateSize }) => {
  const [prevSat, setPrevSat] = useState();
  const [sat, setSat] = useState();
  const [cost, setCost] = useState();

  const handleChange = (e) => {
    if (isNaN(e.target.value)) return;
    if (e.target.value > max) {
      showToast('error', 'Max fee rate is 5x the fast rate');
      return;
    }
    setSat(e.target.value);
    set(e.target.value);
  };

  useEffect(() => {
    if (prevSat !== sat && sat && calculateSize) {
      setCost(satoshisToBTC(calculateSize(sat) * sat));
      setPrevSat(sat);
    }
  }, [sat, calculateSize]);

  return (
    <div className="flex flex-row h-24 w-72 shrink-0 bg-lightblue rounded-xl my-2 justify-between items-start py-4 px-4 cursor-pointer">
      <p className="text-white text-md font-semibold text-left">Custom</p>
      <input
        autoComplete="off"
        className="text-white w-20 text-right h-6 ml-1 rounded-lg bg-lightblue px-3 py-2 text-xs placeholder-gray-400 hover:bg-lightblue focus:bg-lightblue focus:outline-0 mr-16 border border-white"
        type="text"
        value={sat}
        onChange={handleChange}
      />
      <p className="text-white text-md font-semibold text-left absolute right-12">
        sat/byte
      </p>
      <p className="text-gray-400 text-xs text-center mx-auto absolute bottom-16 right-0 left-12">
        Max: {max} sat/byte
      </p>
      <p className="text-white text-md font-semibold absolute bottom-8 right-12">
        {cost ? `${cost} BTC` : ''}
      </p>
    </div>
  );
};
