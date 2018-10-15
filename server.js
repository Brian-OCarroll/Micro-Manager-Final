var express = require('express');

var app = express();



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
  
app.use(express.static("public"));
 
  if (require.main === module) {
    app.listen(process.env.PORT || 8080, function() {
      console.info(`App listening on ${this.address().port}`);
    });
  }
  
  
  module.exports = app;