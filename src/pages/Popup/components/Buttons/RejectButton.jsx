import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import BaseButton from './BaseButton';

const RejectButton = ({ w, onClick, ...props }) => {
  return (
    <BaseButton
      text="Reject"
      w={w}
      onClick={onClick}
      color="gray-600"
      className={`hover:bg-gray-700 ${props.className}`}
      {...props}
    />
  );
};

export default RejectButton;
