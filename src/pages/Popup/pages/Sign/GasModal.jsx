import { Dialog } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import GenericButton from '../../components/Buttons/GenericButton';
import ActionButtons from '../../components/ActionButtons';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CardScreenWrapper from '../../components/Wrappers/CardScreenWrapper';
import { GasItem } from '../../components/GasItem';
import { GasCustomItem } from '../../components/GasCustomItem';
import { satoshisToBTC } from '../../utils';

const GasModal = ({
  isOpen,
  onClose,
  feeRates,
  feeRate,
  setFeeRateFromModal,
  size,
  cost,
  calculateSize,
}) => {
  const [feeRateState, setFeeRateState] = useState(feeRate);
  const [btcCosts, setBtcCosts] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  useEffect(() => {
    if (btcCosts.low === 0 && feeRates.low && calculateSize) {
      console.log(feeRates);
      const lowSize = calculateSize(feeRates.low);
      const mediumSize = calculateSize(feeRates.medium);
      const highSize = calculateSize(feeRates.high);
      console.log(lowSize, mediumSize, highSize);
      setBtcCosts({
        low: lowSize
          ? satoshisToBTC(calculateSize(feeRates.low) * feeRates.low)
          : 0,
        medium: mediumSize
          ? satoshisToBTC(calculateSize(feeRates.medium) * feeRates.medium)
          : 0,
        high: highSize
          ? satoshisToBTC(calculateSize(feeRates.high) * feeRates.high)
          : 0,
      });
    }
  }, [feeRates]);

  return (
    <div
      className={`${
        isOpen ? 'fixed' : 'hidden'
      } w-full h-full bg-center absolute top-0 left-0 z-50`}
    >
      <CardScreenWrapper>
        <XMarkIcon
          className="w-6 text-white absolute left-5 top-4 pt-0.5 cursor-pointer"
          onClick={() => {
            setFeeRateState(feeRate);
            onClose();
          }}
        />
        <p className="text-white text-lg mb-4">Edit Network Fee</p>
        <GasItem
          label="Slow"
          minute="3"
          rate={feeRateState}
          sat={feeRates.low}
          btc={
            btcCosts.low ? `${btcCosts.low} BTC` : `${feeRates.low} sat/byte`
          }
          set={setFeeRateState}
        />
        <GasItem
          label="Medium"
          minute="3"
          rate={feeRateState}
          sat={feeRates.medium}
          btc={
            btcCosts.medium
              ? `${btcCosts.medium} BTC`
              : `${feeRates.medium} sat/byte`
          }
          set={setFeeRateState}
        />
        <GasItem
          label="Fast"
          minute="3"
          rate={feeRateState}
          sat={feeRates.high}
          btc={
            btcCosts.high ? `${btcCosts.high} BTC` : `${feeRates.high} sat/byte`
          }
          set={setFeeRateState}
        />
        <GasCustomItem
          set={setFeeRateState}
          max={feeRates.high * 5}
          calculateSize={calculateSize}
        />
      </CardScreenWrapper>
      <ActionButtons>
        <GenericButton
          text="Save"
          w={'72'}
          onClick={() => setFeeRateFromModal(feeRateState)}
          disabled={false}
          className={'absolute bottom-10'}
        />
      </ActionButtons>
    </div>
  );
};

export default GasModal;
