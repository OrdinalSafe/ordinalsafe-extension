import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const GoBackChevron = ({ route, state }) => {
  const navigate = useNavigate();
  return (
    <ChevronLeftIcon
      className="w-6 text-white absolute left-5 top-4 pt-0.5 cursor-pointer"
      onClick={() => navigate(route, { state })}
    />
  );
};
