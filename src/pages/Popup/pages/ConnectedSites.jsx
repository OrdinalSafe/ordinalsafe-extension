import React, { useEffect, useState } from 'react';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';
import { store } from '../store';
import { showToast, truncateAddress, truncateName } from '../utils';

const ConnectedSites = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState();

  useEffect(() => {
    const getSessions = async () => {
      try {
        const sessions = await chrome.storage.local.get('session');
        const wallets = store.getState().wallet.wallets;
        const sessionsProcessed = [];
        sessions.session?.forEach((session, index) => {
          const host = session.host;
          const address = session?.account?.accounts[0];
          const wallet = wallets.find((wallet) => wallet.address === address);
          if (wallet) {
            sessionsProcessed.push({
              index,
              address,
              name: wallet.name,
              host,
            });
          }
        });
        setSessions(sessionsProcessed);
      } catch (error) {
        console.log(error);
        showToast('error', 'Error while fetching connected sites');
      }
    };

    if (isOpen) {
      getSessions();
    }
  }, [isOpen]);

  const handleRemoveSession = async (index) => {
    try {
      const sessions = await chrome.storage.local.get('session');
      const sessionsProcessed = sessions.session.filter(
        (_session, i) => i !== index
      );
      await chrome.storage.local.set({ session: sessionsProcessed });
      setSessions(sessionsProcessed);
    } catch (error) {
      showToast('error', 'Error while removing site');
    }
  };

  return (
    <div
      className={`${
        isOpen ? 'fixed' : 'hidden'
      } w-full h-full bg-center absolute top-0 left-0 z-50`}
    >
      <CardScreenWrapper>
        <XMarkIcon
          className="w-6 text-white absolute left-5 top-4 pt-0.5 cursor-pointer"
          onClick={onClose}
        />
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-white text-lg mb-4">Connected Sites</p>
          <div className="flex flex-col w-full items-stretch justify-start my-8 overflow-y-scroll max-h-inscriptions">
            {sessions &&
              sessions.map((session) => (
                <div
                  className="flex flex-col h-16 w-80 shrink-0 bg-lightblue rounded-xl my-2 justify-between items-start py-2 px-4 cursor-pointer relative"
                  key={session.index}
                >
                  <p className="text-white text-lg font-semibold text-left">
                    {truncateName(session.host || 'Undefined Host', 9)}
                  </p>
                  <p className="text-white text-sm font-semibold text-left">
                    {truncateName(session.name)}{' '}
                    <span className="text-gray-400 text-xs">
                      ({truncateAddress(session.address)})
                    </span>
                  </p>
                  <TrashIcon
                    className="absolute right-0 top-3 w-10 h-10 text-white bg-gray-600 p-2 rounded-full mr-4 cursor-pointer hover:bg-white hover:text-blue-500 transition:all duration-200"
                    onClick={() => handleRemoveSession(session.index)}
                  />
                </div>
              ))}
          </div>
        </div>
      </CardScreenWrapper>
    </div>
  );
};

export default ConnectedSites;
