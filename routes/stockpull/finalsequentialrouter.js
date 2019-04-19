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




//dont need to parse with request when modifying response data
function getStocksFromApi(req, res) {
    const options = {
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
    
    request(options)
    .then(function(apiResponse){
        return apiResponse;
    })
    .then(function(data){
        res.status(200).json(data)
    })
    .catch(function(err){
        let errorMessage = 'Internal Server Error'
        res.status(500).send(errorMessage);      
  });
}

function getCompanyFromApi(req, res) {
    const options = {
        method: 'GET',
        url:`https://financialmodelingprep.com/api/company/profile/${req.query.symbol}`,
        json:true,
    }
    request(options)
    .then(function(apiResponse){
        //get rid of pre tag
        let companyData = apiResponse.replace(new RegExp("<pre>", 'g'), "");
        return companyData
    })
    .then(function(data){
        let parsedSymbolResults = JSON.parse(data);
        let companyName = parsedSymbolResults[`${req.query.symbol}`]   
        return companyName;
    })
    .then(function(response){
        res.json(response);
    })
    .catch(function(err) {
        let errorMessage= 'Internal server Error';
        res.status(500).send(errorMessage)
    })
}

router.get('/',(req, res) => {
    getStocksFromApi(req, res);
  });
router.get('/company', (req, res)=> {
    getCompanyFromApi(req,res);
})

  module.exports = {router};