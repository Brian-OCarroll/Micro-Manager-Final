const express = require('express');
const router = express.Router();
const request = require('request-promise');
const bodyParser = require('body-parser');
const fs = require('fs');
const sampleData = require('../../sample.json');
const sampleCompany = require('../../companySample.json')
// var moment = require('moment');

//STORED IN HEROKU
const { ALPHA_KEY1, ALPHA_KEY2, ALPHA_KEY3, NEWS_KEY } = require('../../config');


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());




//dont need to parse with request when modifying response data
function getStocksFromApi(req, res) {
    // const options = {
    //     method: 'GET',
    //     url: 'https://www.alphavantage.co/query',
    //     qs: {
    //         function: 'TIME_SERIES_DAILY',
    //         apikey: ALPHA_KEY1,
    //         outputsize: 'full',
    //         symbol: req.query.symbol
    //     },
    //     json: true
    // }
    const { symbol } = req.query;
    var fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5 );
    const options = {
        method: 'GET',
        url: `https://api.tiingo.com/tiingo/daily/${symbol}/prices`,
        qs: {
            token: ALPHA_KEY3,
            startDate: fiveYearsAgo,
            symbol: req.query.symbol
        },
        json: true
    }
    request(options)
        .then(function (apiResponse) {
            return apiResponse;
        })
        .then(function (data) {
            res.status(200).json(data)
        })
        .catch(function (err) {
            console.log(err)
            let errorMessage = 'Internal Server Error'
            res.status(500).send(errorMessage);
        });
}

function getStocksFromSampleData(req, res) {
    res.status(200).json(sampleData)
        
}
function getCompanyFromSampleData(req, res) {
    res.status(200).json(sampleCompany)
}

function getCompanyFromApi(req, res) {
    const options = {
        method: 'GET',
        url: `https://financialmodelingprep.com/api/v3/company/profile/${req.query.symbol}`,
        json: true,
    }
    request(options)
        .then(function (data) {
            console.log('raw data', data)

            let companyProfile = data.profile;

            return companyProfile;
        })
        .then(function (response) {
            res.json(response);
        })
        .catch(function (err) {
            let errorMessage = 'Internal server Error';
            res.status(500).send(errorMessage)
        })
}

router.get('/', (req, res) => {
    getStocksFromApi(req, res);
    // getStocksFromSampleData(req, res)
});
router.get('/company', (req, res) => {
    getCompanyFromApi(req, res);
    // getCompanyFromSampleData(req, res)
})

module.exports = { router };