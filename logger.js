var path = require('path');
var logger = require("morgan");
var express = require('express');
var compress = require('compression');
var bodyParser = require('body-parser');
var AV = require('avoscloud-sdk').AV;
var Log = AV.Object.extend("log");

var configs = require('./configs');
var pkg = require('./package.json');
var debug = require('debug')(pkg.name);

// Init LeanCloud instance 
AV.initialize(configs.appId, configs.appKey);

module.exports = logger();

function logger() {
  // Init the app instance.
  var app = express();
  var env = process.env.NODE_ENV || 'development';
  var localogStyle = (env === 'production') ? 'common' : 'dev';

  // Environment Vars
  app.set('env', env);
  app.set('port', process.env.PORT || 3000);
  
  // Middlewares
  app.use(logger(localogStyle));
  app.use(compress());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Logger API
  app.post('/', log);

  // Start
  app.listen(app.get('port'));

  debug('Started, NODE_ENV=%s, PORT=%s', app.get('env'), app.get('port'));
}

function log(req, res, next) {
  var token = req.headers['logger-token'];
  var logDetails = req.body;

  if (!token || !logDetails || token !== )
    return res.send('fail');

  var baby = new Log();

  baby.save(
    logDetails, 
    configs.successCallback || successCallback, 
    configs.errorCallback || errorCallback
  );

  function successCallback(data) {
    
  }

  function errorCallback(data, err) {
    debug('error');
    debug(err);
    debug('error end');
  }
}
