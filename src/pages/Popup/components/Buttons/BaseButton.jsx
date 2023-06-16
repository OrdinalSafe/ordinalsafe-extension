import React from 'react';
import Spinner from '../Spinner';

const BaseButton = ({
  text,
  icon,
  onClick,
  w,
  color,
  className,
  disabled,
  loading,
}) => {
  return (
    <button
      onClick={(!loading || !disabled) && onClick ? onClick : () => {}}
      className={`${
        disabled || loading ? ' opacity-30 pointer-events-none' : ''
      } ${w ? 'w-' + w : 'w-40'} h-10 rounded-3xl ${
        color ? 'bg-' + color : 'bg-primary'
      } text-white px-3 py-2 text-sm font-white hover:bg-blue-700 transition-colors duration-200 ease-in-out flex items-center justify-center ${className}`}
    >
      {!disabled && loading ? <Spinner /> : null}
      {icon ? icon : null}
      {text}
    </button>
  );
};

export default BaseButton;
