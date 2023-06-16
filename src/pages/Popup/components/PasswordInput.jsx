import React from 'react';

const PasswordInput = ({
  password,
  setPassword,
  loading,
  error,
  confirm = false,
}) => {
  return (
    <div className="flex flex-col justify-start items-start my-4">
      <label htmlFor="password" className="mb-1 text-gray-500 font-500">
        Password {confirm ? '(Repeat)' : ''}
      </label>
      <input
        type="password"
        id="password"
        className={`w-72 h-10 ml-1 rounded-2xl bg-customDark px-3 py-2 text-lg text-white placeholder-gray-400 hover:bg-customDark focus:bg-customDark focus:outline-0 ${
          error ? 'border border-error' : ''
        }`}
        placeholder=""
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
};

export default PasswordInput;
