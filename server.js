"use strict";
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const morgan = require("morgan");
// const path=require('path');

mongoose.Promise = global.Promise;

const {router: usersRouter} = require('./routes/users');
const {router: authRouter, localStrategy, jwtStrategy} = require('./routes/auth')
const { router: stockPullRouter } = require('./routes/stockpull');
const { router: portfolioRouter} = require('./routes/portfolio')

const { PORT, DATABASE_URL, TEST_DATABASE_URL } = require("./config");

const app = express();

app.use(morgan('common'));
//CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
      return res.send(204);
    }
    next();
  });
  
  //Passport JWT
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/users', usersRouter);
app.use('/auth/', authRouter);
app.use('/stockpull/', stockPullRouter);
app.use('/portfolio/', portfolioRouter);

const jwtAuth = passport.authenticate("jwt", { session: false }
);
// app.use(express.static(path.join(__dirname, '/public')));

//Test Protected endpoint
app.get("/protected", jwtAuth, (req, res) => {
  return res.json({
    data: "Snoopy"
  });
});

app.use(express.json());
app.use(express.static("public"));

let server; 
function runServer(){
  const PORT = process.env.PORT || 8080;
  return new Promise((resolve,reject)=>{
    mongoose.connect(DATABASE_URL,error =>{
      if(error){
        return reject(error);
      }
    server = app.listen(PORT, function(){
      console.log(`Port is listening on ${process.env.PORT || 8080}`)
      resolve(server);
    })
    .on('error',function(error){
      mongoose.disconnect();
      console.log('we got an error on our hands, roger')
      reject(error);
    });
  });
})
}


//Close Server
function closeServer(){
  return mongoose.disconnect().then(()=>{

  return new Promise((resolve,reject)=>{
    console.log('server is closing')
    server.close(err =>{
      if(error => {
        return reject(error);
      })
      resolve();
    })
    });
  });
};




if (require.main === module) {
  runServer(DATABASE_URL)
    .catch(err => {
      console.error('Unable to start the server.')
      console.error(err)
    })
};


module.exports = {runServer,closeServer,app};