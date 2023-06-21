import React, { useEffect, useState } from 'react';
import { SwiperSlide } from 'swiper/react';
import BTCIcon from '../../assets/icons/btc.svg';
import { satoshisToBTC, truncateAddress } from '../../utils';
import { fetchInscriptionContent } from '../../../../controllers/AccountController';
import Spinner from '../Spinner';
import InscriptionContent from '../InscriptionContent';

const PreviewItem = ({ item, type }) => {
  const [content, setContent] = useState();

  useEffect(() => {
    const fetchContent = async () => {
      if (type === 'inscription') {
        const content = await fetchInscriptionContent(item);
        setContent(content);
      }
    };

    fetchContent();
  }, []);

  return (
    <>
      {type === 'bitcoin' && (
        <div className="h-16 flex flex-row justify-start items-center px-12">
          <img className="w-12 text-white" src={BTCIcon} alt="Bitcoin Icon" />
          <div className="flex flex-col justify-center items-start ml-2">
            <p className="text-white text-sm font-semibold">
              {satoshisToBTC(item)} BTC
            </p>
          </div>
        </div>
      )}
      {type === 'inscription' && (
        <div className="h-full w-full flex flex-row justify-start items-center px-16">
          {!content ? (
            <Spinner />
          ) : (
            <>
              <InscriptionContent
                inscription={content}
                size="xs"
                className="-ml-8"
              />
              <div className="flex flex-col justify-center items-start">
                <p className="text-white text-sm font-semibold">
                  {truncateAddress(content.id)}
                </p>
              </div>
            </>
          )}
        </div>
      )}
      {type === 'null' && (
        <div className="h-full w-full flex flex-col justify-center items-center">
          <p className="text-white text-sm font-semibold">Nothing</p>
        </div>
      )}
    </>
  );
};

export default PreviewItem;
