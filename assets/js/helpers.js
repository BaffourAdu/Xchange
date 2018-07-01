/**
 * 
 * @param {*} currencyFromSelector 
 * @param {*} currencyToSelector 
 */
const populateCurrencies = (currencyFromSelector, currencyToSelector) => {
            
    currencies().then(function (response) {
        const currencies = response.data.results;
        
        const sortedCurrencies = sortObj( currencies, 'asc');

        for (let currency in sortedCurrencies){
            
            let data = {
                name: currency,
                created: new Date().getTime()
            };

            let currencyData = {data};

            //Store in IndexedDB
            idbDb.set('currency', currencyData);
            idbDb.getAll('currency').then(convertions => console.log(convertions));


            let fromSelectorNewOption = document.createElement('option'),
                toSelectorNewOption = document.createElement('option');

            fromSelectorNewOption.value = currency;
            fromSelectorNewOption.text = currency;

            toSelectorNewOption.value = currency;
            toSelectorNewOption.text = currency;

            currencyFromSelector.add(fromSelectorNewOption);
            currencyToSelector.add(toSelectorNewOption);

       }
    })
    .catch(function (error) {
        console.log(error);
        return false;
    });

return true;
};


/**
 * 
 * @param {*} conversionParams 
 */
const calculateExchangeRate = (conversionParams, conversionParamsInverse) => {

    return getExchangeRate(conversionParams, conversionParamsInverse)
        .then(function (response) {
            console.log(response);

            const responseRate = response.data.results[conversionParams].val;
            const rate = responseRate.toFixed(3);

            const responseRateInverse = response.data.results[conversionParamsInverse].val;
            const rateInverse = responseRateInverse.toFixed(3);

            return [rate, rateInverse];
        })
        .catch(function (error) {
            console.log(error);
        });
}



/**
 * 
 * @param {*} conversionParams 
 */
const getExchangeRate = (conversionParams, conversionParamsInverse) => {

    return axios.get(`${baseUrl}/convert`,
        {params: {q: `${conversionParams},${conversionParamsInverse}`}});
};


/**
 * 
 * @param {*} conversionParams 
 */
const currencies = (conversionParams) =>{

return axios.get(`${baseUrl}/currencies`);

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