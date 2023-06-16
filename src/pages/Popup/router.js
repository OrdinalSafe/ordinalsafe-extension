import React from 'react';
import { createHashRouter } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import NewWallet from './pages/NewWallet';
import NewWalletPopup from './pages/NewWalletPopup';
import CreateWallet from './pages/NewWallet/CreateWallet';
import ImportWallet from './pages/NewWallet/ImportWallet';
import Auth from './pages/Auth';
import SignPSBT from './pages/Sign/SignPSBT';
import SignMessage from './pages/Sign/SignMessage';
import Receive from './pages/Receive';
import Inscriptions from './pages/Inscriptions';
import SendBitcoin from './pages/Send/SendBitcoin';
import SignBitcoin from './pages/Sign/SignBitcoin';
import SendInscription from './pages/Send/SendInscription';
import SignInscription from './pages/Sign/SignInscription';
import Mnemonic from './pages/Settings/Mnemonic';
import PrivateKey from './pages/Settings/PrivateKey';
import RemoveWallet from './pages/Settings/RemoveWallet';
import Settings from './pages/Settings';
import Contacts from './pages/Settings/Contacts';
import Broadcast from './pages/Broadcast';
import Get from './pages/Get';
import InitWrapper from './components/Wrappers/InitWrapper';
import AppWrapper from './components/Wrappers/AppWrapper';
import Inscription from './pages/Inscription';
import Accounts from './pages/Accounts';
import NewAccount from './pages/Accounts/NewAccount';
import EditAccount from './pages/Accounts/EditAccount';
import EditContact from './pages/Settings/Contacts/EditContact';
import NewContact from './pages/Settings/Contacts/NewContact';
import { DeveloperSettings } from './pages/Settings/Developer';
import BRC20 from './pages/BRC20';
import SendBRC from './pages/Send/SendBRC';
import SignBRC from './pages/Sign/SignBRC';
import Wallet from './pages/Settings/Wallet';
import Inscribe from './pages/Inscribe';
import Activity from './pages/Activity';
import Switch from './pages/Switch';
import { event } from './utils';
import ExternalSignBitcoin from './pages/Sign/ExternalSignBitcoin';
import ExternalSignInscription from './pages/Sign/ExternalSignInscription';

const router = createHashRouter([
  // 3rd party start
  {
    path: '/auth',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Auth />
      </ProtectedRoute>
    ),
  },
  {
    path: '/switch',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Switch />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sign/psbt',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <SignPSBT />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sign/externalBitcoin',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <ExternalSignBitcoin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sign/externalInscription',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <ExternalSignInscription />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sign/message',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <SignMessage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/broadcast',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Broadcast />
      </ProtectedRoute>
    ),
  },
  {
    path: '/get',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Get />
      </ProtectedRoute>
    ),
  },
  {
    path: '/inscribe',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Inscribe />
      </ProtectedRoute>
    ),
  },
  // 3rd party end
  {
    path: '/',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/init/login',
    element: (
      <ProtectedRoute shouldExists={true}>
        <Login />
      </ProtectedRoute>
    ),
  },
  {
    path: '/init/new-wallet-popup',
    element: (
      <ProtectedRoute>
        <NewWalletPopup />
      </ProtectedRoute>
    ),
  },
  {
    path: '/init/new-wallet',
    element: (
      <ProtectedRoute>
        <NewWallet />
      </ProtectedRoute>
    ),
  },
  {
    path: '/init/import-wallet',
    element: (
      <ProtectedRoute>
        <ImportWallet />
      </ProtectedRoute>
    ),
  },
  {
    path: '/init/create-wallet',
    element: (
      <ProtectedRoute>
        <CreateWallet />
      </ProtectedRoute>
    ),
  },
  {
    path: '/receive',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Receive />
      </ProtectedRoute>
    ),
  },
  {
    path: '/accounts',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Accounts />
      </ProtectedRoute>
    ),
  },
  {
    path: '/accounts/new',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <NewAccount />
      </ProtectedRoute>
    ),
  },
  {
    path: '/accounts/edit',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <EditAccount />
      </ProtectedRoute>
    ),
  },
  {
    path: '/inscriptions',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Inscriptions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/inscription',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Inscription />
      </ProtectedRoute>
    ),
  },
  {
    path: '/activity',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Activity />
      </ProtectedRoute>
    ),
  },
  {
    path: '/brc20',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <BRC20 />
      </ProtectedRoute>
    ),
  },
  {
    path: '/send/brc',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <SendBRC />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sign/brc',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <SignBRC />
      </ProtectedRoute>
    ),
  },
  {
    path: '/send/bitcoin',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <SendBitcoin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sign/bitcoin',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <SignBitcoin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/send/inscription',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <SendInscription />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sign/inscription',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <SignInscription />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/accounts',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Accounts />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/wallet',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Wallet />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/mnemonic',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Mnemonic />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/private-key',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <PrivateKey />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/remove-wallet',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <RemoveWallet />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/contacts',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <Contacts />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/contacts/edit',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <EditContact />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/contacts/new',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <NewContact />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/developer',
    element: (
      <ProtectedRoute shouldAuth={true} shouldExists={true}>
        <DeveloperSettings />
      </ProtectedRoute>
    ),
  },
]);

router.routes.forEach((route) => {
  if (route.path.startsWith('/init/')) {
    route.element = <InitWrapper>{route.element}</InitWrapper>;
  } else {
    route.element = <AppWrapper>{route.element}</AppWrapper>;
  }
});

router.subscribe((location) => {
  if (!location.errors) {
    event('page_view', {
      path: location.location.pathname,
    });
  } else {
    event('invalid_page_view', {
      path: location.location.pathname,
    });
  }
});

export default router;
