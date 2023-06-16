import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { ACTIVITY_TYPES } from '../types';
import ActivityItem from '../components/ActivityItem';
import { getMempoolURL, truncateAddress } from '../utils';
import { useSelector } from 'react-redux';

const timeToDate = (time) => {
  if (!time) return 'Unconfirmed';
  const date = new Date(time * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const Activity = () => {
  const network =
    useSelector((state) => state.settings.network).bech32 === 'bc'
      ? 'mainnet'
      : 'testnet';
  const address = useSelector((state) => state.wallet.activeWallet.address);

  const [activity, setActivity] = useState([]);

  const fetchActivity = async () => {
    const mempoolURL = getMempoolURL(network);

    try {
      const response = await fetch(`${mempoolURL}/api/address/${address}/txs`);
      const data = await response.json();
      setActivity(data);
    } catch (error) {
      console.log('Error while fetching activity', error);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [address]);

  /* const activity = [
        {
            id: 0,
            date: '2021-08-01',
            time: '12:00',
            type: ACTIVITY_TYPES.BTC_SEND,
            amount: 0.0001,
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            status: 'confirmed',
            txHash: '0xaaefefageafgeageafaegaegaegfeafggaeh'
        },
        {
            id: 1,
            date: '2021-08-01',
            time: '12:00',
            type: ACTIVITY_TYPES.BTC_RECEIVE,
            amount: 0.0001,
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            status: 'pending',
            txHash: '0xaaefefageafgeageafaegaegaegfeafggaeh'
        },
        {
            id: 2,
            date: '2021-08-01',
            time: '12:00',
            type: ACTIVITY_TYPES.INS_SEND,
            ins_id: 'abcddhdhdhhdhdhdhdhhh',
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            status: 'confirmed',
            txHash: '0xaaefefageafgeageafaegaegaegfeafggaeh'
        },
        {
            id: 3,
            date: '2021-08-01',
            time: '12:00',
            type: ACTIVITY_TYPES.INS_RECEIVE,
            ins_id: 'abcddhdhdhhdhdhdhdhhh',
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            status: 'confirmed',
            txHash: '0xaaefefageafgeageafaegaegaegfeafggaeh'
        },
        {
            id: 4,
            date: '2021-08-01',
            time: '12:00',
            type: ACTIVITY_TYPES.BRC_SEND,
            amount: 0.0001,
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            status: 'confirmed',
            txHash: '0xaaefefageafgeageafaegaegaegfeafggaeh'
        },
        {
            id: 5,
            date: '2021-08-01',
            time: '12:00',
            type: ACTIVITY_TYPES.BRC_RECEIVE,
            amount: 0.0001,
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            status: 'confirmed',
            txHash: '0xaaefefageafgeageafaegaegaegfeafggaeh'
        },
    ]
 */

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-start">
        <h1 className="text-white text-lg font-semibold my-2">Activity</h1>
        <div className="max-h-inscriptions overflow-y-scroll -mr-2 py-2">
          {/* activity.map((item) => (
                        <ActivityItem key={item.id} activity={item} />
                    )) */}
          {/* TODO: fetch activity from API when ready */}
          {activity &&
            activity.map((item) => (
              <div
                className="flex flex-row justify-start items-center bg-lightblue rounded-lg p-2 relative h-16 my-2 cursor-pointer"
                onClick={() =>
                  window.open(
                    `${getMempoolURL(network)}/tx/${item.txid}`,
                    '_blank'
                  )
                }
                key={item.txid}
              >
                <div className="flex flex-col justify-center items-start w-60">
                  <p className="text-gray-400 text-sm">
                    Tx Hash: {truncateAddress(item.txid)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Block Time: {timeToDate(item.status.block_time)}
                  </p>
                </div>
                <div className="flex flex-col justify-center items-end w-8">
                  <p
                    className={`text-xs ${
                      item.status.confirmed
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {item.status.confirmed ? 'Confirmed' : 'Unconfirmed'}
                  </p>
                </div>
              </div>
            ))}
          {activity && activity.length === 0 && (
            <p className="text-gray-600 text-sm text-center font-semibold my-2">
              No activity
            </p>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default Activity;
