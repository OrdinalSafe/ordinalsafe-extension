import React from 'react';
import { ArrowDownLeftIcon } from '@heroicons/react/24/outline';
import BaseButton from './BaseButton';

const ReceiveButton = ({ w, onClick, ...props }) => {
  return (
    <BaseButton
      text="Receive"
      icon={<ArrowDownLeftIcon className="w-4 mr-2" />}
      w={w}
      onClick={onClick}
      {...props}
    />
  );
};

export default ReceiveButton;
