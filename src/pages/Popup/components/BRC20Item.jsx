import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BRC20Item = ({ item: { name, balance } }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-row h-brc shrink-0 bg-lightblue rounded-xl my-1 justify-stretch items-center p-2 cursor-pointer"
      onClick={() => navigate('/brc20', { state: { name, balance } })}
    >
      <div className="w-8 h-8 rounded-full mr-2 bg-secondary flex flex-col justify-center align-center">
        <p className="text-white text-xl font-bold text-center my-auto mx-auto my-0 py-0">
          {name[0].toUpperCase()}
        </p>
      </div>
      <div className="flex flex-row grow justify-between">
        <p className="text-white text-md font-semibold text-left">{name}</p>
        <p className="text-white text-md font-semibold text-left">
          {Number(balance).toFixed(4)}
        </p>
      </div>
    </div>
  );
};

export default BRC20Item;
