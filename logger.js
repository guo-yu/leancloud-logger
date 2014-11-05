var path = require('path');
var morgan = require("morgan");
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

module.exports = logger;

function logger() {
  // Init the app instance.
  var app = express();
  var env = process.env.NODE_ENV || 'development';
  var logstyle = (env === 'production') ? 'combined' : 'dev';

  // Environment Vars
  app.set('env', env);
  app.set('port', process.env.PORT || 3000);
  
  // Middlewares
  app.use(morgan(logstyle));
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
  var details = req.body;

  if (!token || !details || token !== configs.token)
    return res.send('fail');

  var baby = new Log();

  baby.save(
    details, 
    configs.successCallback || successCallback, 
    configs.errorCallback || errorCallback
  );

  function successCallback(data) {
    res.send('ok');
  }

  function errorCallback(data, err) {
    debug('error');
    debug(err);
    res.send('fail');
  }
}

if (!module.parent)
  logger();
