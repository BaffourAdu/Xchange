"use strict";
        
//Currency Convertor API BASEURL
const baseUrl = 'https://free.currencyconverterapi.com/api/v5';

window.addEventListener('load', () => {
    
    /*
    * Check User Connectivity and Display Conectivity Status
    */
    window.addEventListener('online', () => {
        document.querySelector('.connectivity-status').innerText = 'You are online';
    });
    
    window.addEventListener('offline', () => {
        document.querySelector('.connectivity-status').innerText = 'You are offline';
    });

    //Load Previous Calculated Rates/Convertions
    loadOldRates();
    
    /*
    * Set initial Varibales , get all Inputs and assign them variables
    */
    const currencyFromSelector = document.querySelector('.custom-select.currency-from'),
        currencyToSelector = document.querySelector('.custom-select.currency-to'),
        currencyFromInput = document.querySelector('.form-control.currency-from'),
        currencyToInput = document.querySelector('.form-control.currency-to'),
        exchangeRateOutput = document.querySelector('.exchange-rate'),
        exchangeRateInverseOutput = document.querySelector('.exchange-rate-inverse');
    
    let currencyTo = currencyToSelector.value,
        currencyFrom = currencyFromSelector.value, 
        exchangeRate = null,
        exchangeRateInverse = null,
        conversionParams = null,
        conversionParamsInverse = null;
    
    //Let User know Currencies are being populated
    document.querySelector('.status').innerText = 'Please wait as currencies load ...';
    
    /*
    * Disable all Inputs and enable them where necessary
    */
    currencyFromSelector.disabled = true;
    currencyToSelector.disabled = true;
    currencyFromInput.disabled = true;
    currencyToInput.disabled = true;
    
    /*
    * Set Exhanges Rate to 0.00
    */
    exchangeRateOutput.innerText = '00.00';
    exchangeRateInverseOutput.innerText = '00.00';

    //Populate Currencies From the DB
    const currencyPopulated = populateCurrencies(currencyFromSelector, currencyToSelector);

    /*
    * If Currencies Populated,
    * Then allow user to perform Currency COnversion
    */
    if (currencyPopulated) {
        //Enable Currency From Select Input
        currencyFromSelector.disabled = false;

        //Update User to set select Currency to be Converted from
        document.querySelector('.status').innerText = 'Please select Currency from';
        
        /*
        * Listen For Changes in Currency From Select Input
        */
        currencyFromSelector.addEventListener('change', () => {
            //Get Currency From Input Value
            currencyFrom = currencyFromSelector.value; 
            
            //Enable Currency To be converted into Select Input 
            currencyToSelector.disabled = false;
            
            //Update User to select Currency to be converted to
            document.querySelector('.status').innerText = 'Please select Currency To';
            
            /*
            * Perform Calculations only when Currency 
            * to be converted to default value Changes
            */
            if (currencyTo != 'To') {

                //Set Currency Conversion Parameter to be sent to the API
                conversionParams = `${currencyFrom}_${currencyTo}`;
                //Set Currency Conversion Parameter to get the Inverse Rate of the Currency
                conversionParamsInverse = `${currencyTo}_${currencyFrom}`;
                
                /*`
                * Only Perform Calclations if Currency to be converted to
                * and currency to be converted from are not equal
                */
                if (currencyTo != currencyFrom ) {

                   exchangeRateOutput.innerText = '';
                   exchangeRateInverseOutput.innerText = '';

                   if(navigator.onLine) { 
                        /*
                        *  If User is Online, 
                        * then Get the Exchange Rate from API
                        */
                        calculateExchangeRate(conversionParams, conversionParamsInverse)                                
                            .then((rates) => {       
                                exchangeRate = rates[0];
                                exchangeRateInverse = rates[1];

                                exchangeRateOutput.innerText = `1 ${currencyFrom} -> ${rates[0].toString()} ${currencyTo}`;
                                exchangeRateInverseOutput.innerText = `1 ${currencyTo} -> ${rates[1].toString()} ${currencyFrom}`;

                                //Load Previous Rates
                                loadOldRates();

                            });
                    } else {
                        /**
                         * Check If Rate has been converted before else
                         */
                        idbDb.get('rates', conversionParams)
                            .then((oldRates) => {

                                exchangeRate = oldRates.rates.rate;
                                exchangeRateInverse = oldRates.rates.inverse;

                                exchangeRateOutput.innerText = `1 ${currencyFrom} -> ${exchangeRate.toString()} ${currencyTo}`;
                                exchangeRateInverseOutput.innerText = `1 ${currencyTo} -> ${exchangeRateInverse.toString()} ${currencyFrom}`;

                                //Load Previous Rates
                                loadOldRates();
                            })
                            .catch((error) =>{
                                console.log(error);
                            });
                    }
                    


                } else {
                    exchangeRate = null;
                    exchangeRateInverse =  null;

                    exchangeRateOutput.innerText = ' ';
                    exchangeRateInverseOutput.innerText = ' ';
                }

            }
        });
        

        /*
        * Listen For Changes in Currency To Select Input
        */
        currencyToSelector.addEventListener('change', () => {
            //Get Currency To Input Value
            currencyTo = currencyToSelector.value; 

                if (currencyFrom != 'From') {
                    //Set Currency Conversion Parameter to be sent to the API
                    conversionParams = `${currencyFrom}_${currencyTo}`;
                    //Set Currency Conversion Parameter to get the Inverse Rate of the Currency
                    conversionParamsInverse = `${currencyTo}_${currencyFrom}`;


                    if (currencyTo != currencyFrom ) {

                        exchangeRateOutput.innerText = '';
                        exchangeRateInverseOutput.innerText = '';

                            if (navigator.onLine) { 
                                /*
                                *  Get the Exchange Rate from API
                                */
                                calculateExchangeRate(conversionParams, conversionParamsInverse)                                
                                    .then((rates) => {       
                                        exchangeRate = rates[0];
                                        exchangeRateInverse = rates[1];
        
                                        exchangeRateOutput.innerText = `1 ${currencyFrom} -> ${rates[0].toString()} ${currencyTo}`;
                                        exchangeRateInverseOutput.innerText = `1 ${currencyTo} -> ${rates[1].toString()} ${currencyFrom}`;
        
                                        //Load Previous Rates
                                        loadOldRates();
                                    });

                            } else {
                                /*
                                *  Get the Exchange Rate from IndexedDB
                                */
                                idbDb.get('rates', conversionParams)
                                    .then((oldRates) => {
                                        exchangeRate = oldRates.rates.rate;
                                        exchangeRateInverse = oldRates.rates.inverse;
            
                                        exchangeRateOutput.innerText = `1 ${currencyFrom} -> ${exchangeRate.toString()} ${currencyTo}`;
                                        exchangeRateInverseOutput.innerText = `1 ${currencyTo} -> ${exchangeRateInverse.toString()} ${currencyFrom}`;
            
                                        //Load Previous Rates
                                        loadOldRates();
                                    });
                            }
                    
                        } else {
                            exchangeRate = null;
                            exchangeRateInverse =  null;
        
                            exchangeRateOutput.innerText = ' ';
                            exchangeRateInverseOutput.innerText = ' ';
                        }
                        
                    document.querySelector('.status').innerText = 'Please type amount you wish to exchange';
                    currencyFromInput.disabled = false;
                }
            

        });


        /**
         * 
         */
        currencyFromInput.addEventListener('input', () => {
            const amountFrom = currencyFromInput.value;
            const amountTo = amountFrom * exchangeRate;

            currencyToInput.value = amountTo;

            document.querySelector('.status').innerText = ' ';
            currencyToInput.disabled = false;

        });

        /**
         * 
         */
        currencyToInput.addEventListener('input', () => {
                const amountTo = currencyToInput.value;
                const amountFrom = amountTo * exchangeRateInverse;

                currencyFromInput.value = amountFrom;

                document.querySelector('.status').innerText = ' ';
        });
        
    }

});



