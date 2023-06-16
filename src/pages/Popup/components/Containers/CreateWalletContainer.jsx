import React from 'react';

const CreateWalletContainer = ({ children }) => {
  return (
    <div className="flex flex-col h-full justify-start items-stretch">
      {children}
    </div>
  );
};

export default CreateWalletContainer;
