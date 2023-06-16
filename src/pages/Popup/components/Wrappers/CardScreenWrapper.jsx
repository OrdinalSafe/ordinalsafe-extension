import React from 'react';

const CardScreenWrapper = ({ children }) => {
  return (
    <div className="bg-screen min-h-cardScreen mt-0 rounded-lg flex flex-col justify-start items-center px-2 py-4 relative">
      {children}
    </div>
  );
};

export default CardScreenWrapper;
