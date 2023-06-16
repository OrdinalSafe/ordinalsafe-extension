export const saveValue = async (key: string, value: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        [key]: value,
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        resolve(value);
      }
    );
  });
};

export const getValue = async (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
};

export const removeValue = async (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve(true);
    });
  });
};
