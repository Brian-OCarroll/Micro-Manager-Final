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
    
    console.log(options)
    //try to maintain the response data from request1 to use in request2
    request(options)
    .then(function(apiResponse){
        return apiResponse;
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

function getCompanyFromApi(req, res) {
    const options = {
        method: 'GET',
        url:`https://financialmodelingprep.com/api/company/profile/${req.query.symbol}`,
        json:true,
        // contentType: 'html/text'
    }
    request(options)
    .then(function(apiResponse){
        let companyData = apiResponse.replace(new RegExp("<pre>", 'g'), "");
        return companyData
    })
    .then(function(data){
        // console.log(data)
        let parsedSymbolResults = JSON.parse(data);
        let companyName = parsedSymbolResults[`${req.query.symbol}`]   
        return companyName;
    })
    .then(function(response){
        // console.log(response)
        res.json(response);
    })
    .catch(function(err) {
        let errorMessage= 'Internal server Error';
        console.error(err)
        res.status(500).send(errorMessage)
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
router.get('/company', (req, res)=> {
    getCompanyFromApi(req,res);
})

  module.exports = {router};