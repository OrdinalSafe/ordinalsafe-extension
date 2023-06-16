import React from 'react';
import { address, networks } from 'bitcoinjs-lib';
import copy from 'copy-to-clipboard';
import * as amplitude from '@amplitude/analytics-browser';
import { HEAVY_REQUEST_TYPE } from '~/types';
import { store } from './store';
import { toast } from 'react-hot-toast';

export const showToast = (type, message, href) => {
  switch (type) {
    case 'success':
      return toast.success((t) => (
        <p
          onClick={() => href && window.open(href, '_blank')}
          className="cursor-pointer"
        >
          {message}
        </p>
      ));
    case 'error':
      return toast.error(message);
    default:
      return toast(message);
  }
};

export const truncateAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

export const truncateName = (name, l = 4) => {
  if (name.length <= 2 * l + 3) {
    return name;
  }
  return `${name.slice(0, l)}...${name.slice(-l)}`;
};

export const copyToClipboard = (text, toast = true) => {
  copy(text);

  if (toast) {
    showToast('default', 'Copied to clipboard');
  }
};

export const validateAddress = (addr, network = 'mainnet') => {
  try {
    address.toOutputScript(
      addr,
      network === 'mainnet' ? networks.bitcoin : networks.testnet
    );
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const event = (name, data) => {
  return amplitude.track(name, {
    ...data,
    network:
      store.getState().settings.network.bech32 === 'bc' ? 'mainnet' : 'testnet',
  });
};

export const getMempoolURL = (network = 'mainnet') => {
  return network === 'mainnet'
    ? 'https://mempool.space'
    : 'https://mempool.space/testnet';
};

export const getOrdinalsURL = (network = 'mainnet') => {
  return network === 'mainnet'
    ? 'https://bestinslot.xyz/ordinals/inscription'
    : 'https://testnet.ordinals.com/inscription';
};

export const btcToSatoshis = (amount) => {
  return Math.round(amount * 100000000);
};

export const satoshisToBTC = (amount) => {
  return amount / 100000000;
};

// IFRAME UTILS

export const size = (size) => {
  switch (size) {
    case 'xs':
      return [80, 80, 8];
    case 'sm':
      return [100, 100, 10];
    case 'md':
      return [120, 120, 12];
    case 'lg':
      return [160, 160, 12];
    case 'xl':
      return [200, 200, 14];
    default:
      return [120, 120, 9];
  }
};

export const imageInHtml = (imageSrc, s = '') => {
  const [width, height] = size(s);
  return (
    `<html><head><style>body {margin: 0 0;width: ${width}px; height: ${height}px; display: flex; align-items: center; box-sizing: border-box; padding: 8px 0;} img {user-drag: none; -webkit-user-drag: none; user-select: none; -moz-user-select: none;  -webkit-user-select: none;-ms-user-select: none;height: 100%; margin: 0 auto; image-rendering: pixelated; overflow-clip-margin: unset;} html {margin-left: auto; margin-right: auto; width: ${width}px; height: ${height}px; text-align: center;}</style></head><body ><img src="` +
    imageSrc +
    '" /></body></html>'
  );
};

export const hexToImgSource = (mimeType, input) =>
  `data:${mimeType};base64,${Buffer.from(input, 'hex').toString('base64')}`;

export const svgToHTML = (input, s = '') => {
  const [width, height] = size(s);
  return `<html><head><style>body {margin: 0 0;width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 8px 0;} svg {height: 100%} html {margin-left: auto; margin-right: auto; width: ${width}px; height: ${height}px; text-align: center;}</style></head><body>${input}</body></html>`;
};

export const textToHTML = (input, s = '') => {
  const [width, height, font] = size(s);
  const p = document.createElement('p');
  p.innerText = input;

  let innerHTML = p.innerHTML;
  innerHTML = innerHTML.replaceAll('  ', '&nbsp; ');
  innerHTML = innerHTML.replaceAll('  ', '&nbsp; ');
  return `<html><head><style>body {margin: 0 0;width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center} p {color: white; font-size: ${font}px;  font-family: Arial; margin: 0 0; width: ${width}px; overflow: hidden; word-break: break-all}  html {margin-left: auto; margin-right: auto; width: ${width}px; height: ${height}px; text-align: center;}</style></head><body><p>${innerHTML}</p></body></html>`;
};

export const truncate = (str, n) => {
  return str?.length > n ? str.substr(0, n - 1) + '...' : str;
};

export const hexToTextForNonUnicode = (hex) => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
};

export const hexToText = (hex) => {
  let str;
  try {
    str = decodeURIComponent(hex.replace(/(..)/g, '%$1'));
  } catch (e) {
    str = hexToTextForNonUnicode(hex);
    console.log('invalid hex input: ' + hex);
  }

  return str;
};
