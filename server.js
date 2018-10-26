"use strict";
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const bodyParser = require("body-parser");
const passport = require("passport");
const morgan = require("morgan");
const cors = require('cors');
// const path=require('path');

const {router: authRouter, localStrategy, jwtStrategy} = require('./routes/auth')
const {router: usersRouter} = require('./routes/users');
const { router: stockPullRouter } = require('./routes/stockpull');
const { router: portfolioRouter} = require('./routes/portfolio');
const { PORT, DATABASE_URL, TEST_DATABASE_URL } = require("./config");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.resolve(__dirname, 'public')))
mongoose.Promise = global.Promise;
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(morgan('dev'));
//CORS

  
  //Passport JWT
app.use('/stockpull/', stockPullRouter);
app.use('/users', usersRouter);
app.use('/auth/', authRouter);
app.use('/portfolio/', portfolioRouter);

// app.use(express.static(path.join(__dirname, '/public')));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});
const jwtAuth = passport.authenticate("jwt", { session: false });

//Test Protected endpoint
app.get("/protected", jwtAuth, (req, res) => {
  return res.json({
    data: "Hello"
  });
});


let server; 
function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      require.main === module ? DATABASE_URL : TEST_DATABASE_URL,
      { useNewUrlParser: true },
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(PORT, () => {
            console.log(`Your app is listening on port ${PORT}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
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