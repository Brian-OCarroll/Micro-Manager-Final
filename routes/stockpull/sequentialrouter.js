const express = require('express');
const router = express.Router();
const request=require('request-promise');
const bodyParser=require('body-parser');
// var moment = require('moment');

//STORED IN HEROKU
const { ALPHA_KEY1 } = require('../../config');
const { ALPHA_KEY2 } = require('../../config');
const {NEWS_KEY} = require('../../config');

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

// globals


//dont need to parse with request when modifying response data
function getStocksFromApi(req, res) {
    const options1 = {
        method: 'GET',
        url: 'https://www.alphavantage.co/query',
        qs: {
            function: 'TIME_SERIES_DAILY',
            apikey: ALPHA_KEY1,
            outputsize: 'full',
            symbol: req.query.symbol
        },
        json: true
    }
    const options2 = {
        method: 'GET',
        url:`https://financialmodelingprep.com/api/company/profile/${req.query.symbol}`,
        json:true,
        // contentType: 'html/text'
    }
    let searchResultsData;
    //try to maintain the response data from request1 to use in request2
    request(options2)
    .then(function(apiResponse){
        searchResultsData = apiResponse.replace(new RegExp("<pre>", 'g'), "");
        // console.log(searchResultsData)
        return request(options1)
    })
    .then(function(data) {
        // Do whatever you want to transform the data
        let parsedSymbolResults = JSON.parse(searchResultsData);
        let parentCompany = parsedSymbolResults[`${req.query.symbol}`]["companyName"];
        let companyDescription= parsedSymbolResults[`${req.query.symbol}`]["description"];
        let companyImage= parsedSymbolResults[`${req.query.symbol}`]["image"];
        function fixKeys(obj) {
            Object.keys(obj).forEach(function (key) {
                let newName = key.split('.')[1].trim();
                //dynamic form of obj.newKey
                obj[newName] = obj[key];
                delete obj[key];
            });
             return obj;
        }
        // console.log(apiResponse)
        let metaData = data["Meta Data"]
        let symbol = metaData["2. Symbol"]
        // let symbol = `${req.query.symbol}`;

        //the main object with all dates by day
        // let fullData = data[stockDay.json];
        let fullData = data["Time Series (Daily)"];
        let arrayData = [];
        // adds a key value pair for the date, with the date of the stock quote, 
        //and then deletes the key 'Time Series (Daily)'
        Object.keys(fullData).map(function (key) {
            let obj = {};
            obj = fixKeys(fullData[key]);
            obj['date'] = key;
            arrayData.push(obj);
        });
        //current days data
        let todayData = arrayData[0];
        //get 52 week high/low
        let arrayLow = [];
        let arrayHigh = [];
        let arrayVol = 0;
        for (let i = 0; i < 365 && i < arrayData.length; i++) {
            arrayLow.push(parseInt(arrayData[i].low));
            arrayHigh.push(parseInt(arrayData[i].high));
            arrayVol += parseInt(arrayData[i].volume);
        }
        todayData['symbol'] = symbol;
        todayData['tlow'] = `${Math.min.apply(null, arrayLow)}`;
        todayData['thigh'] = `${Math.max.apply(null, arrayLow)}`;
        let tvol = arrayVol / arrayData.length;
        todayData['tVol'] = `${tvol}`
        todayData['parentCompany'] = parentCompany;
        todayData['companyDescription'] = companyDescription;
        todayData['companyImage'] = companyImage;
        sentDataArray= [todayData,data]
        // console.log(sentDataArray)
        return sentDataArray;
        console.log(todayData)
    })
    .then(function(data){
        // console.log(data)
        res.status(200).json(data)
    })
    .catch(function(err){
        let errorMessage = 'Internal Server Error'
        console.error(err)
        res.status(500).send(errorMessage);      
  });
}



// function getDataFromNewsApi(req, res){
//     const options = {
//         method:"get",
//         url: 'https://newsapi.org/v2/everything',
//         qs:{
//             apiKey: NEWS_KEY,
//             q:req.query.query,
//             pageSize: 5
//         },
//         json:true
//     }
//     request(options)
//     .then(function(response){
//         //might need to change to res.json
//         res.status(200).json(response)
//     })
//     .catch(function(err){
//         let errorHbs={
//           statusCode:500,
//           errorMessage:'Internal Server Error',
//           layout:false
//         };
//         res.status(500).render('error',errorHbs);
//         //res.status(500).json({message:'Internal Server Error'});
//   });
// }

router.get('/',(req, res) => {
    getStocksFromApi(req, res);
});


  module.exports = {router};