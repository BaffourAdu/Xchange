/**
 * Populates Currency Selects Inputs with 
 * Currencies from the DB
 * 
 * @param {*} currencyFromSelector 
 * @param {*} currencyToSelector 
 */
const populateCurrencies = (currencyFromSelector, currencyToSelector) => {
    /**
     * Get ALl Currencies from IndexedDB,
     * If internet is available, Update Currency List
     */
    idbDb.getAll('currencies')
        .then((currencies) => {

            for (let currency in currencies) {
           
                let currencyName = currencies[currency].data.name;
                let currencyValue = currencies[currency].name;

                let fromSelectorNewOption = document.createElement('option'),
                toSelectorNewOption = document.createElement('option');

                fromSelectorNewOption.value =  currencyValue;
                fromSelectorNewOption.text = currencyName;

                toSelectorNewOption.value = currencyValue;
                toSelectorNewOption.text = currencyName;

                currencyFromSelector.add(fromSelectorNewOption);
                currencyToSelector.add(toSelectorNewOption);
                
            }

        });

    if(navigator.onLine) { 
        //If Internet Is avaliable Update Currency List
        storeCurrencies();
    }

    return true;
};


/**
 * Gets Currecy rates and Performs Convertion
 * and save its for offline Use
 * 
 * @param {*} conversionParams 
 */
const calculateExchangeRate = (conversionParams, conversionParamsInverse) => {

    return getExchangeRate(conversionParams, conversionParamsInverse)
        .then((response) => {
            const responseRate = response.data.results[conversionParams].val;
            const apiRate = responseRate.toFixed(3);

            const responseRateInverse = response.data.results[conversionParamsInverse].val;
            const apiRateInverse = responseRateInverse.toFixed(3);

            const rates = {
                currencies: conversionParams,
                rate: apiRate,
                inverse: apiRateInverse,
                created: new Date().getTime()
            };

            const rateData = {
                    currencies: conversionParams,
                    rates
            };
            
            // Make a request to delete the specified record out of the object store
            idbDb.delete('rates', conversionParams);

            //Store in IndexedDB
            idbDb.set('rates', rateData);

            return [apiRate, apiRateInverse];
        })
        .catch((error) => {
            console.log(error);
        });
};


/**
 * Gets all Rates or Convertions from the Database
 * for offline Use
 */
const loadOldRates = () => {
    // get the reference for the body
    const tableBody = document.querySelector('.old-rates');
    
    while (tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    idbDb.getAll('rates')
        .then((oldRates) => {
            
            for (let rate in oldRates){

                const dataRow = document.createElement('tr');

                const cell1 = document.createElement("td");
                const cellText1 = document.createTextNode(oldRates[rate].rates.currencies);
                cell1.appendChild(cellText1);
                dataRow.appendChild(cell1);

                const cell2 = document.createElement("td");
                const cellText2 = document.createTextNode(oldRates[rate].rates.rate);
                cell2.appendChild(cellText2);
                dataRow.appendChild(cell2);


                const cell3 = document.createElement("td");
                const cellText3 = document.createTextNode(oldRates[rate].rates.inverse);
                cell3.appendChild(cellText3);
                dataRow.appendChild(cell3);
                

                tableBody.appendChild(dataRow);                   
            }

        });
};


/**
 * Make API Call and return a promise with results 
 * 
 * @param {*} conversionParams 
 */
const getExchangeRate = (conversionParams, conversionParamsInverse) => {

    return axios.get(`${baseUrl}/convert`,
        {params: {q: `${conversionParams},${conversionParamsInverse}`}});
};


/**
 * Clears all old currencies in the DB, 
 * then makes an API call and updates all 
 * Currencies in the DB
 * 
 * @param {*} conversionParams 
 */
const storeCurrencies = (conversionParams) => {

    //Deete All Stored Currencies for new record to be saved
    idbDb.clear('currencies');

    return axios.get(`${baseUrl}/currencies`)
                .then((response) => {
                    const currencies = response.data.results;
                    
                    const sortedCurrencies = sortObj(currencies, 'asc');

                    for (let currency in sortedCurrencies) {
                        
                        let currencyName = currencies[currency].currencyName;

                        let data = {
                            name: `${currency}- ${currencyName}`,
                            value: currency,
                            created: new Date().getTime()
                        };

                        let currencyData = {
                                name: currency,
                                data
                        };

                        //Store in IndexedDB
                        idbDb.set('currencies', currencyData);
                    }

                })
                .catch((error) => {
                    console.log(error);
                    return false;
                });
};


/**
* Sort JavaScript Object
* CF Webtools : Chris Tierney
* obj = object to sort
* order = 'asc' or 'desc'
*/
const sortObj = ( obj, order ) => {
    let key,
        tempArry = [],
        i,
        tempObj = {};

    for ( key in obj ) {
        tempArry.push(key);
    }

    tempArry.sort(
        (a, b) => {
            return a.toLowerCase().localeCompare( b.toLowerCase() );
        }
    );

    if( order === 'desc' ) {
        for ( i = tempArry.length - 1; i >= 0; i-- ) {
            tempObj[ tempArry[i] ] = obj[ tempArry[i] ];
        }
    } else {
        for ( i = 0; i < tempArry.length; i++ ) {
            tempObj[ tempArry[i] ] = obj[ tempArry[i] ];
        }
    }

    return tempObj;
};