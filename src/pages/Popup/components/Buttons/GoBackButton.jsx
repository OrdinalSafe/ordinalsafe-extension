import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import BaseButton from './BaseButton';

const GoBackButton = ({ w, onClick, ...props }) => {
  return (
    <BaseButton
      text="Go Back"
      icon={<ArrowLeftIcon className="w-4 mr-2" />}
      w={w}
      onClick={onClick}
      color="gray-600"
      {...props}
    />
  );
};

export default GoBackButton;
