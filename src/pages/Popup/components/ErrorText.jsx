import React from 'react';

const ErrorText = ({ error, className }) => {
  return (
    <div
      className={`flex flex-col justify-center items-center my-2 ${className}`}
    >
      <p className="text-error text-xs font-500">{error}</p>
    </div>
  );
};

export default ErrorText;
