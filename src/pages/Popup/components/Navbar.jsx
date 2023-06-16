import React, { useEffect, useState } from 'react';
import { WalletIcon } from '@heroicons/react/24/outline';
import NavbarItem from './NavbarItem';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '../assets/icons/home.svg';
import InscriptionsIcon from '../assets/icons/inscriptions.svg';
import ActivityIcon from '../assets/icons/activity.svg';

const Navbar = () => {
  const [active, setActive] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split('/')[1];

  useEffect(() => {
    if (currentPath === undefined) {
      setActive('home');
    } else if (currentPath === 'inscriptions') {
      setActive('inscriptions');
    } else if (currentPath === 'activity') {
      setActive('activity');
    }
  }, [currentPath]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 w-full bg-customDark border-t border-borderColor">
      <div className="grid grid-cols-3 h-full w-full">
        <NavbarItem
          icon={
            <img
              src={HomeIcon}
              alt="home"
              className={`h-6 mx-auto cursor-pointer hover:${
                active === 'home' ? '' : 'brightness-150'
              } ${active === 'home' ? 'brightness-200' : ''}`}
              onClick={() => navigate('/')}
            />
          }
        />
        <NavbarItem
          icon={
            <img
              src={InscriptionsIcon}
              alt="inscriptions"
              className={`h-6 mx-auto cursor-pointer hover:${
                active === 'inscriptions' ? '' : 'brightness-150'
              } ${active === 'inscriptions' ? 'brightness-200' : ''}`}
              onClick={() => navigate('/inscriptions')}
            />
          }
        />
        <NavbarItem
          icon={
            <img
              src={ActivityIcon}
              alt="activity"
              className={`h-6 mx-auto cursor-pointer hover:${
                active === 'activity' ? '' : 'brightness-150'
              } ${active === 'activity' ? 'brightness-200' : ''}`}
              onClick={() => navigate('/activity')}
            />
          }
        />
      </div>
    </div>
  );
};

export default Navbar;
