import React from 'react';
import * as Sentry from '@sentry/react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-loading-skeleton/dist/skeleton.css';

import './Popup.css';

import { persistor, store } from 'store';

import { CLOSE_WINDOW, FROM_BACK_TO_POPUP } from '~/types';
import Popup from './Popup';
import Loading from './pages/Loading';
import { APP_CONNECT } from '../../types';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <Sentry.ErrorBoundary
      showDialog
      fallback={({ error, componentStack, resetError }) => (
        <div>
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <p>{componentStack}</p>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
    >
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <SkeletonTheme baseColor="#353951" highlightColor="#242638">
            <Popup />
            <div className="Toast">
              <Toaster
                position="bottom-center"
                toastOptions={{
                  style: {
                    width: '100%',
                    height: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '5px',
                  },
                  duration: 3000,
                }}
                containerStyle={{
                  position: 'absolute',
                  left: 30,
                  bottom: 80,
                  right: 30,
                }}
              />
            </div>
          </SkeletonTheme>
        </PersistGate>
      </Provider>
    </Sentry.ErrorBoundary>
  );
};

chrome.runtime.connect({ name: APP_CONNECT });

chrome.runtime.onMessage.addListener(async (message, sender, response) => {
  const { type, action } = message;
  if (!type || type !== FROM_BACK_TO_POPUP) return false;
  if (!action) return false;
  if (action === CLOSE_WINDOW) window.close();
  response();
  return true;
});

export default App;
