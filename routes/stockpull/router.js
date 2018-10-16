const express = require('express');
const router = express.Router();
const request=require('request-promise');
const bodyParser=require('body-parser');
var moment = require('moment');

//STORED IN HEROKU
const { ALPHA_KEY } = require('../../config');
const {NEWS_KEY} = require('../../config');

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

// globals
let searchResultsData;

//dont need to parse with request when modifying response data
function getStocksFromApi(req, res) {
    const options = {
        method: 'GET',
        url: 'https://www.alphavantage.co/query',
        qs: {
            function: 'TIME_SERIES_DAILY',
            apikey: 'LU1ASZD46LS2Y4V8',
            outputsize: 'full',
            symbol: req.query.symbol
        },
        json: true
    }
    
    request(options)
    .then(function(apiResponse){
        return apiResponse
    })
    .then(function(data) {
        // Do whatever you want to transform the data
        function fixKeys(obj) {
            Object.keys(obj).forEach(function (key) {
                let newName = key.split('.')[1].trim();
                //dynamic form of obj.newKey
                obj[newName] = obj[key];
                delete obj[key];
            });
             return obj;
        }

        let metaData = data["Meta Data"]
        let symbol = metaData["2. Symbol"]

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
        return todayData;
    })
    .then(function(data){
        searchResultsData=data;
        let hbsObj = {
            searchDone:true,
            searchResults:data,
            layout:false
        };
        hbsObj.searchSummary = 'Found relevant data'
        // res.status(200).render('index, hbsObj');
        res.status(200).json(data)
    })
    .catch(function(err){
        let errorHbs={
          statusCode:500,
          errorMessage:'Internal Server Error',
          layout:false
        };
        res.status(500).send(errorHbs);      
  });
}

function getGraphFromStocksApi(req, res) {
    let symbol = req.query.symbol
    const options = {
        method: 'GET',
        url: `https://www.alphavantage.co/query`,
        qs: {
            function: 'TIME_SERIES_DAILY',
            apikey: 'LU1ASZD46LS2Y4V8',
            outputsize: 'full',
            symbol: symbol
        },
        json: true
    }
    
    request(options)
    .then(function(apiResponse){
        return apiResponse
    })
    .then(function(data) {
        let graph = [];

        function fixKeys(obj) {
            Object.keys(obj).forEach(function (key) {
                let newName = key.split('.')[1].trim();
                //dynamic form of obj.newKey
                obj[newName] = obj[key];
                delete obj[key];
            });
             return obj;
        }
        
        // let metaData = data["Meta Data"]
        // let symbol = metaData["2. Symbol"]

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
        
        let graphLabels ={'1W': [], '1M': [], '3M': [], '1Y': [], '5Y': []};
        let graphData ={'1W': [], '1M': [], '3M': [], '1Y': [], '5Y': []};
        for(let i=0;i<arrayData.length;i++){
            if(moment(arrayData[i].date).isAfter(moment().subtract(1,'week').format("YYYY-MM-DD"))){
                graphLabels['1W'].unshift(arrayData[i].date);
                graphData['1W'].unshift(arrayData[i].close);
           }
            if(moment(arrayData[i].date).isAfter(moment().subtract(1,'months').format("YYYY-MM-DD"))){
                graphLabels['1M'].unshift(arrayData[i].date);
                graphData['1M'].unshift(arrayData[i].close);
           }
           if(moment(arrayData[i].date).isAfter(moment().subtract(3,'months').format("YYYY-MM-DD"))){
                graphLabels['3M'].unshift(arrayData[i].date);
                graphData['3M'].unshift(arrayData[i].close);
           }
            if(moment(arrayData[i].date).isAfter(moment().subtract(1,'years').format("YYYY-MM-DD"))){
                graphLabels['1Y'].unshift(arrayData[i].date);
                graphData['1Y'].unshift(arrayData[i].close);
           }
            if(moment(arrayData[i].date).isAfter(moment().subtract(5,'years').format("YYYY-MM-DD"))){
                graphLabels['5Y'].unshift(arrayData[i].date);
                graphData['5Y'].unshift(arrayData[i].close);
           }
        }
        graph.push({"date":graphLabels['1W'],"data":graphData['1W']});
        graph.push({"date":graphLabels['1M'],"data":graphData['1M']});
        graph.push({"date":graphLabels['3M'],"data":graphData['3M']});
        graph.push({"date":graphLabels['1Y'],"data":graphData['1Y']});
        graph.push({"date":graphLabels['5Y'],"data":graphData['5Y']});

        return graph;
    })
    .then(function(response){
            res.json(response);
    })
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
router.get('/graph', (req, res)=> {
    getGraphFromStocksApi(req,res);
})

  module.exports = {router};