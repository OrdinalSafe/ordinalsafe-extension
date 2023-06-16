import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLock } from '../store/features/auth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { PlusIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import InscriptionList from '../components/InscriptionList';
import GenericButton from '../components/Buttons/GenericButton';

const Inscriptions = () => {
  return (
    <>
      <Header />
      <h1 className="text-white text-lg font-semibold my-2">Inscriptions</h1>
      <InscriptionList />
      <GenericButton
        className="w-72 absolute bottom-16 mb-2 left-0 right-0 mx-auto text-xl font-500"
        icon={<PlusIcon className="w-6 h-6 mr-2 font-semibold" />}
        text="Inscribe"
        onClick={() =>
          chrome.tabs.create({ url: `https://ordinalsafe.xyz/inscribe` })
        }
      />
      <Navbar />
    </>
  );
};

export default Inscriptions;
