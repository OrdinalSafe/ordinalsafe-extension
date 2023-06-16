import { useEffect } from 'react';
import { RESPONSE_TYPE } from '../../types';

export const useConnect = (successType, rejectType) => {
  const approve = async (payload) => {
    await chrome.runtime.sendMessage({
      messageSource: RESPONSE_TYPE,
      action: successType,
      payload,
    });
  };

  const reject = () => {
    chrome.runtime.sendMessage({
      messageSource: RESPONSE_TYPE,
      action: rejectType,
      payload: {},
    });
  };

  useEffect(() => {
    window.addEventListener('beforeunload', reject);

    return () => window.removeEventListener('beforeunload', reject);
  }, []);

  return [approve, reject];
};
