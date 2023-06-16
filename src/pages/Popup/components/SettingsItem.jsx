import { ChevronRightIcon } from '@heroicons/react/20/solid';
import React from 'react';

export const SettingsItem = ({ label, onClick }) => {
  return (
    <div
      className="flex flex-row h-12 w-full shrink-0 bg-lightblue rounded-xl my-1 justify-between items-center py-2 px-4 cursor-pointer"
      onClick={onClick}
    >
      <p className="text-white text-md font-semibold text-left">{label}</p>
      <ChevronRightIcon className="w-6 h-6 text-white" />
    </div>
  );
};
