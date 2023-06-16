import React, { useEffect } from 'react';

const ImportMnemonic = ({ mnemonic, setMnemonic }) => {
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const mnemonicPasted = pastedText.split(' ');
    if (mnemonicPasted.length === 12) {
      setMnemonic(mnemonicPasted);
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen justify-around items-center py-8 px-4">
      <p className="text-2xl font-500 text-white mb-4">
        Verify your Seed Phrase
      </p>
      <p className="text-sm font-500 text-gray-500 mb-4">
        Your seed phrase is the key to your wallet. If you lose it, you lose
        access to your funds.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(12)].map((_, index) => {
          return (
            <div
              key={index}
              className="flex flex-row pl-2 justify-start items-center w-24 h-8 rounded-3xl bg-customDark text-white"
            >
              <input
                type="text"
                autoComplete="off"
                className="w-24 h-8 pl-2 rounded-3xl bg-customDark text-white text-xs font-500 placeholder-gray-600 outline-none"
                placeholder={index + 1 + '.'}
                value={mnemonic[index]}
                onChange={(e) => {
                  let newMnemonic = [...mnemonic];
                  newMnemonic[index] = e.target.value;
                  setMnemonic(newMnemonic);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImportMnemonic;
