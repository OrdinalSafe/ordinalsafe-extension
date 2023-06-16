export class ChromeStorage {
  runtime;
  storage;

  constructor(runtime, storage) {
    this.runtime = runtime;
    this.storage = storage;
  }

  getDriver() {
    return this.storage;
  }

  hasError() {
    return !!this.getError();
  }

  getError() {
    return this.runtime.lastError;
  }

  setItem(key, value) {
    return new Promise((resolve, reject) => {
      this.storage.set({ [key]: value }, () => {
        if (this.hasError()) {
          return reject(this.getError());
        }

        resolve();
      });
    });
  }

  getItem(key) {
    return new Promise((resolve, reject) => {
      this.storage.get(key, (result) => {
        if (this.hasError()) {
          return reject(this.getError());
        }

        resolve(result[key]);
      });
    });
  }

  removeItem(key) {
    return new Promise((resolve, reject) => {
      this.storage.remove(key, () => {
        if (this.hasError()) {
          return reject(this.getError());
        }

        resolve();
      });
    });
  }
}
