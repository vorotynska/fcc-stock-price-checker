'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./db-connection');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const Stock = require("./models");
const helmet = require("helmet");



const app = express();


app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({
  origin: '*'
})); //For FCC testing purposes only

//--
app.use(
  helmet({
    frameguard: {
      action: "deny"
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "external-website.com"], //You should set the content security policies to only allow loading of scripts and CSS from your server.
        styleSrc: ["'self'", "external-website.com"]
      }
    },
    dnsPrefetchControl: false
  })
);

//--

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
//apiRoutes(app); //расскоментировать
app.use("/api/stock-prices", apiRoutes); // i add

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 5500);
  }
});

module.exports = app; //for testing