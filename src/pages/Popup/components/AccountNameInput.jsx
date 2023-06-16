import React from 'react';

const AccountNameInput = ({ name, setName, error }) => {
  return (
    <div className="flex flex-col justify-start items-start my-8">
      <label htmlFor="name" className="mb-1 text-gray-500 font-500">
        Name
      </label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
        className={`text-white w-72 h-10 ml-1 rounded-2xl bg-lightblue px-3 py-2 text-xs placeholder-gray-400 hover:bg-lightblue focus:bg-lightblue focus:outline-0 ${
          error ? 'border border-error' : ''
        }`}
        placeholder=""
      />
    </div>
  );
};

export default AccountNameInput;
