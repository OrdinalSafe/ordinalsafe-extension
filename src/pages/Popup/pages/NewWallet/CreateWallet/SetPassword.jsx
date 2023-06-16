import React from 'react';
import PasswordInput from '../../../components/PasswordInput';

const SetPassword = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
}) => {
  return (
    <div className="flex flex-col h-screen justify-around items-center py-8 px-4">
      <p className="text-2xl font-500 text-white mb-4">Create a password</p>
      <p className="text-sm font-500 text-gray-500 mb-4">
        This password will unlock your wallet.
      </p>
      <PasswordInput
        password={password}
        setPassword={setPassword}
        error={error}
      />
      <PasswordInput
        password={confirmPassword}
        setPassword={setConfirmPassword}
        confirm={true}
        error={error}
      />
      <p className="text-xs text-gray-500 my-8">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default SetPassword;
