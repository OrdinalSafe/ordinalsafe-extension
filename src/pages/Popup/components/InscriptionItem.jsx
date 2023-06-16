import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import InscriptionContent from './InscriptionContent';
import { fetchInscriptionContent } from '../../../controllers/AccountController';

const InscriptionItem = ({ inscriptionId }) => {
  const navigate = useNavigate();
  const [inscriptionDetails, setInscriptionDetails] = useState();

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
    <div
      className="flex flex-col justify-center items-center cursor-pointer"
      onClick={() => navigate('/inscription', { state: { inscriptionId } })}
    >
      <InscriptionContent
        inscription={inscriptionDetails}
        className="w-40 h-28 rounded-lg my-2"
        size="md"
      />
    </div>
  );
};

export default InscriptionItem;
