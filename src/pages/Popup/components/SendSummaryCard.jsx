import React from 'react';

const SendSummaryCard = ({ children }) => {
  return (
    <div className="flex flex-col w-72 my-4 py-2 px-4 justify-stretch items-stretch bg-lightblue rounded-xl">
      {children}
    </div>
  );
};

export default SendSummaryCard;
