import React from 'react';

const ActionButtons = ({ children, className = '' }) => {
  return (
    <div
      className={`flex flex-row justify-around items-center w-full my-2 ${className}`}
    >
      {children}
    </div>
  );
};

export default ActionButtons;
