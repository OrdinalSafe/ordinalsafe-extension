import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import CardScreenWrapper from '../../components/Wrappers/CardScreenWrapper';
import { GoBackChevron } from '../../components/GoBackChevron';
import ActionButtons from '../../components/ActionButtons';
import { truncateAddress, validateAddress } from '../../utils';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import AddressSelector from '../../components/AddressSelector';
import SendButton from '../../components/Buttons/SendButton';
import InscriptionContent from '../../components/InscriptionContent';
import { useSelector } from 'react-redux';
import ErrorText from '../../components/ErrorText';

const SendInscription = () => {
  const network =
    useSelector((state) => state.settings.network).bech32 === 'tb'
      ? 'testnet'
      : 'mainnet';
  const { state } = useLocation();
  const { inscriptionDetails } = state;

  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (address) {
      setError('');
    }
  }, [address]);

  const handleSend = () => {
    setError('');
    if (!validateAddress(address, network)) {
      setError('Invalid address');
      return;
    }

    navigate('/sign/inscription', { state: { inscriptionDetails, address } });
  };

  return (
    <>
      <Header />
      <CardScreenWrapper>
        <GoBackChevron
          route="/inscription"
          state={{ inscriptionId: inscriptionDetails.id }}
        />
        <p className="text-white my-2">Send Inscription</p>
        <InscriptionContent
          inscription={inscriptionDetails}
          className="w-60 h-32 rounded-lg my-2"
        />
        <p className="text-white my-2">
          ID ({truncateAddress(inscriptionDetails.id)}){' '}
          <ClipboardDocumentIcon className="w-4 inline-block" />
        </p>
        <AddressSelector
          address={address}
          setAddress={setAddress}
          error={error}
        />
      </CardScreenWrapper>
      {error && <ErrorText error={error} className="pt-20" />}
      <ActionButtons>
        <SendButton
          w={'72'}
          onClick={handleSend}
          disabled={false}
          className={'absolute bottom-10'}
        />
      </ActionButtons>
    </>
  );
};

export default SendInscription;
