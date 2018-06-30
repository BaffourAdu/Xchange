"use strict";

const dbPromise = idb.open('currenci', 1, upgradeDb => {
    console.log('creating DB');
    switch (upgradeDb.oldVersion) {
        case 0:
            if (!upgradeDb.objectStoreNames.contains('convertion')) {
                const convertionStore = upgradeDb.createObjectStore('convertion', { keyPath: 'id', autoIncrement:true });
                convertionStore.createIndex('id', 'id', { unique: true });
            }
            if (!upgradeDb.objectStoreNames.contains('currency')) {
                const currencyStore = upgradeDb.createObjectStore('currency', { keyPath: 'id', autoIncrement:true });
                currencyStore.createIndex('id', 'id', { unique: true });
            }  
    }
});

export const idb = {
    get(objectStore, key) {
      return dbPromise.then(db => {
        return db.transaction('keyval')
          .objectStore('keyval').get(key);
      });
    },
    set(objectStore, val) {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).put(val);
        return tx.complete;
      });
    },
    delete(key) {
      return dbPromise.then(db => {
        const tx = db.transaction('keyval', 'readwrite');
        tx.objectStore('keyval').delete(key);
        return tx.complete;
      });
    },
    clear() {
      return dbPromise.then(db => {
        const tx = db.transaction('keyval', 'readwrite');
        tx.objectStore('keyval').clear();
        return tx.complete;
      });
    },
    keys() {
      return dbPromise.then(db => {
        const tx = db.transaction('keyval');
        const keys = [];
        const store = tx.objectStore('keyval');
  
        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
        // openKeyCursor isn't supported by Safari, so we fall back
        (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
          if (!cursor) return;
          keys.push(cursor.key);
          cursor.continue();
        });
  
        return tx.complete.then(() => keys);
      });
    }
  };