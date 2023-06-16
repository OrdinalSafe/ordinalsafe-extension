import React from 'react';
import BTCLogo from '../assets/icons/btc.svg';
import INSLogo from '../assets/icons/ins.svg';
import BRCLogo from '../assets/icons/brc.svg';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { copyToClipboard, getMempoolURL, truncateAddress } from '../utils';
import { useSelector } from 'react-redux';

const ActivityItem = ({ activity }) => {
  const network =
    useSelector((state) => state.settings.network) === 'tb'
      ? 'testnet'
      : 'mainnet';

  const logo = activity.type.startsWith('BTC')
    ? BTCLogo
    : activity.type.startsWith('INS')
    ? INSLogo
    : BRCLogo;
  const type = activity.type.endsWith('SEND') ? 'Sent' : 'Received';
  const addressText = activity.type.endsWith('SEND') ? 'To' : 'From';
  const statusColor =
    activity.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400';
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="flex flex-col justify-center items-stretch w-80 h-24 my-2">
      <div className="flex flex-row justify-between items-center w-full h-full mb-2">
        <p className="text-gray-400 text-xs">{activity.date}</p>
        <p className="text-gray-400 text-xs">{activity.time}</p>
      </div>
      <div
        className="flex flex-row justify-start items-center bg-lightblue rounded-lg p-2 relative h-20 cursor-pointer"
        onClick={() =>
          window.open(
            `${getMempoolURL(network)}/tx/${activity.txHash}`,
            '_blank'
          )
        }
      >
        <img src={logo} alt="logo" className="w-12 h-12 mr-6" />
        <div className="absolute bottom-3 left-10 w-6 h-6 p-1 bg-primary rounded-full">
          {type === 'Sent' ? (
            <ArrowUpRightIcon className="text-white" />
          ) : (
            <ArrowDownLeftIcon className="text-white" />
          )}
        </div>
        <div className="flex flex-col justify-center items-start w-60">
          <p className="text-gray-400 text-xs">
            Tx Hash: {truncateAddress(activity.txHash)}
          </p>
          <p className="text-white text-sm font-500">{type}</p>
          <p className="text-gray-400 text-xs">
            {addressText}: {truncateAddress(activity.address)}
          </p>
        </div>
        <div className="flex flex-col justify-center items-end w-8">
          <p className="text-white text-sm font-500">
            {type === 'Sent' ? '-' : '+'}
            {activity.amount || 1}
          </p>
          <p className={`text-xs ${statusColor}`}>
            {capitalize(activity.status)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
