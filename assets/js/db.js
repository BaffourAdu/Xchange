"use strict";

const dbPromise = idb.open('currenci', 1, (upgradeDb) => {
    console.log('creating DB');
    if (!upgradeDb.objectStoreNames.contains('convertion')) {
        upgradeDb.createObjectStore('convertion', {autoIncrement: true});
    }
    if (!upgradeDb.objectStoreNames.contains('currency')) {
        upgradeDb.createObjectStore('currency', {autoIncrement: true});
    }
});

dbPromise.then((db) => {
    const tx = db.transaction('convertion', 'readwrite');
    const store = tx.objectStore('convertion');
    
    const convertion = {
      from: 'USD 700',
      to: 'GHS 550',
      rate: '4.755 / 0.255',
      created: new Date().getTime()
    };

    store.add(convertion);

    return tx.complete;
}).then(function() {
    console.log('added item to the store Convertion!');
});
/*
dbPromise.then((db) => {
    const tx = db.transaction('convertion', 'readonly');
    const store = tx.objectStore('convertion');
    
    return store.get('1');
  }).then(function(val) {
    console.dir(val);
  });
*/

dbPromise.then((db) => {
    const tx = db.transaction('convertion', 'readonly');
    const store = tx.objectStore('convertion');

    return store.getAll();
  }).then((convertions) => {
    console.log(`Items by name: ${convertions}`);
});