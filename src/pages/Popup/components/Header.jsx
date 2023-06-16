import React, { useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import Dropdown from './Generics/Dropdown';
import Logo from '../assets/icon.png';
import SettingsDropdown from './SettingsDropdown';
import { useSelector } from 'react-redux';
import { copyToClipboard, truncateAddress, truncateName } from '../utils';
import { ChevronDownIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import ConnectedSites from '../pages/ConnectedSites';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const address = useSelector((state) => state.wallet.activeWallet.address);
  const accountName = useSelector((state) => state.wallet.activeWallet.name);

  const handleLogoClick = () => {
    // go to home if not already there
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      // show connected sites modal
      setIsOpen(true);
    }
  };
  return (
    <div className="flex justify-around items-center">
      <ConnectedSites isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <img
        src={Logo}
        alt="OrdinalSafe"
        width="40px"
        className="cursor-pointer"
        onClick={handleLogoClick}
      />{' '}
      <div className="w-60 h-8 flex justify-between rounded-xl bg-dropdown font-semibold text-white text-xs border-borderColor border px-2 py-2 text-sm hover:bg-dropdown focus:bg-dropdown focus:outline-0">
        <div className="flex flex-row justify-start items-center">
          <ClipboardIcon
            className="w-4 h-4 text-white font-bold inline-block mr-1 cursor-pointer"
            onClick={() => copyToClipboard(address)}
          />
          {truncateName(accountName)}
          <span className="text-gray-400 pl-1">
            ({truncateAddress(address)})
          </span>
        </div>
        <ChevronDownIcon
          className="w-4 h-4 text-white font-bold inline-block ml-1 cursor-pointer"
          onClick={() => navigate('/accounts')}
        />
      </div>
      <SettingsDropdown />
    </div>
  );
};

export default Header;
