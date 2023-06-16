import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';
import { GoBackChevron } from '../components/GoBackChevron';
import Header from '../components/Header';
import ActionButtons from '../components/ActionButtons';
import SendButton from '../components/Buttons/SendButton';
import {
  ArrowTopRightOnSquareIcon,
  ClipboardIcon,
  LinkIcon,
} from '@heroicons/react/20/solid';
import InscriptionDetail from '../components/InscriptionDetail';
import { fetchInscriptionContent } from '../../../controllers/AccountController';
import { ALLOWED_MIME_TYPES_TO_SIMPLE_TYPES } from '../../../config';
import InscriptionContent from '../components/InscriptionContent';
import { getOrdinalsURL, truncateAddress } from '../utils';
import { useSelector } from 'react-redux';

const Inscription = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [inscriptionDetails, setInscriptionDetails] = useState();
  const network =
    useSelector((state) => state.settings.network).bech32 === 'bc'
      ? 'mainnet'
      : 'testnet';
  const inscriptionId = state.inscriptionId;

  const explorer = () => {
    const url = getOrdinalsURL(network);

    chrome.tabs.create({ url: `${url}/${inscriptionId}` });
  };

  useEffect(() => {
    const getInscriptionDetails = async () => {
      try {
        const inscriptionDetails = await fetchInscriptionContent(inscriptionId);
        setInscriptionDetails(inscriptionDetails);
      } catch (error) {
        console.log('Error while fetching inscription details', error);
        // TODO: handle error
      }
    };

    if (inscriptionId) {
      getInscriptionDetails();
    }
  }, [inscriptionId]);

  return (
    <>
      <Header />
      <CardScreenWrapper>
        <GoBackChevron route="/inscriptions" />
        <ArrowTopRightOnSquareIcon
          className="w-6 text-white absolute right-5 top-4 pt-0.5 cursor-pointer"
          onClick={explorer}
        />
        <p className="text-white my-2">
          {!inscriptionDetails ? (
            <Skeleton />
          ) : (
            <>ID ({truncateAddress(inscriptionDetails.id)})</>
          )}
        </p>
        <InscriptionContent
          inscription={inscriptionDetails}
          className="w-60 h-48 rounded-lg my-2"
          size="xl"
        />
        <ActionButtons>
          <SendButton
            w={'72'}
            onClick={() =>
              navigate('/send/inscription', { state: { inscriptionDetails } })
            }
            disabled={!inscriptionDetails}
          />
        </ActionButtons>
        <div className="flex flex-col w-full items-stretch justify-start my-8">
          {inscriptionDetails ? (
            <>
              <InscriptionDetail
                label={'ID'}
                value={truncateAddress(inscriptionDetails.id)}
                copyable={inscriptionDetails.id}
              />
              <InscriptionDetail
                label={'Type'}
                value={inscriptionDetails.type}
              />
            </>
          ) : (
            <Skeleton count={2} />
          )}
        </div>
      </CardScreenWrapper>
    </>
  );
};

export default Inscription;
