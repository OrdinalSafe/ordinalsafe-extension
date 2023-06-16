import React from 'react';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import BaseButton from './BaseButton';

const SendButton = ({ w, onClick, className, ...props }) => {
  return (
    <BaseButton
      text="Send"
      icon={<ArrowUpRightIcon className="w-4 mr-2" />}
      w={w}
      onClick={onClick}
      className={className}
      {...props}
    />
  );
};

export default SendButton;
