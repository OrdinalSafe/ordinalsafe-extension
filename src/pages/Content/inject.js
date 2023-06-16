import wallet from './Wallet';

Object.defineProperty(window, 'ordinalSafe', {
  enumerable: false,
  writable: false,
  configurable: false,
  value: wallet,
});

if (!window.ordinalSafe) {
  window.ordinalSafe = wallet;
}

window.dispatchEvent(new Event('ordinalSafe#initialized'));
