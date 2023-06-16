import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { store } from 'store';

const ProtectedRoute = ({
  children,
  shouldAuth = false,
  shouldExists = false,
}) => {
  const location = useLocation();
  const isLocked = store.getState().auth?.lock === true;
  const isInitialized =
    (store.getState().wallet?.encryptedMasterNode !== undefined &&
      store.getState().wallet?.encryptedMasterNode !== '') ||
    (store.getState().wallet.legacyEncryptedMasterNode !== '' &&
      store.getState().wallet.encryptedMasterNode === '');

  if (shouldExists && !isInitialized)
    return (
      <Navigate
        to="/init/new-wallet-popup"
        state={{ from: location.pathname }}
      />
    );
  if (shouldAuth && isLocked && !isInitialized)
    return (
      <Navigate
        to="/init/new-wallet-popup"
        state={{ from: location.pathname }}
      />
    );
  if (shouldAuth && isLocked && isInitialized)
    return <Navigate to="/init/login" state={{ from: location.pathname }} />;

  /* if (!isLocked && !shouldAuth) return <Navigate to="/" />

  if (isInitialized && !shouldExists) return <Navigate to="/login" />; */

  return children;
};
export default ProtectedRoute;
