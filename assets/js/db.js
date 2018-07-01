"use strict";

const dbPromise = idb.open('currenci', 1, upgradeDb => {
    console.log('creating DB');
    switch (upgradeDb.oldVersion) {
        case 0:
            if (!upgradeDb.objectStoreNames.contains('rates')) {
                const convertionStore = upgradeDb.createObjectStore('rates', { keyPath: 'currencies', autoIncrement:true });
                convertionStore.createIndex('currencies', 'currencies', { unique: true });
            }
            if (!upgradeDb.objectStoreNames.contains('currencies')) {
                const currencyStore = upgradeDb.createObjectStore('currencies', { keyPath: 'name', autoIncrement:true });
                currencyStore.createIndex('name', 'name', { unique: true });
            }  
    }
});

const idbDb = {
    get(objectStore, key) {
      return dbPromise.then(db => {
        return db.transaction(objectStore)
          .objectStore(objectStore).get(key);
      });
    },
    set(objectStore, val) {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).put(val);
        return tx.complete;
      });
    },
    delete(objectStore,key) {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).delete(key);
        return tx.complete;
      });
    },
    clear(objectStore) {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).clear();
        return tx.complete;
      });
    },
    getAll(objectStore) {
        return dbPromise.then(db => {
            return db.transaction(objectStore)
              .objectStore(objectStore).getAll();
        });
    },
    keys(objectStore) {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore);
        const keys = [];
        const store = tx.objectStore(objectStore);
  
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