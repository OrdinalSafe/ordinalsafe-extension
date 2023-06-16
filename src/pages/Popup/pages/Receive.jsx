import React from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';
import QRCode from 'react-qr-code';
import AddressBox from '../components/AddressBox';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { GoBackChevron } from '../components/GoBackChevron';

const Receive = () => {
  const address = useSelector((state) => state.wallet.activeWallet.address);
  const name = useSelector((state) => state.wallet.activeWallet.name);

  // Add QR
  // Add copy to clipboard
  return (
    <>
      <Header />
      <CardScreenWrapper>
        <GoBackChevron route="/" />
        <p className="text-white text-lg"> Receive </p>
        <div className="bg-white rounded-lg w-36 h-36 my-8 flex flex-col justify-center items-center">
          <QRCode
            value={address}
            size={128}
            bgColor={'#FFFFFF'}
            fgColor={'#000000'}
          />
        </div>
        <AddressBox name={name} address={address} />
      </CardScreenWrapper>
    </>
  );
};

export default Receive;
