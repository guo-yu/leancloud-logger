var path = require('path');
var AV = require('avoscloud-sdk').AV;
var pkg = require('./package.json');
var debug = require('debug')(pkg.name);
var Log = AV.Object.extend("log");

module.exports = logger;

function logger(configs) {
  var self = this;
  // Load configs from local file
  if (!configs && !module.parent) {
    try {
      var configs = require('./configs');
    } catch (err) {
      throw err;
    }
  }

  this.configs = configs;

  if (!configs)
    throw new Error('LeanCloud configs are required.');

  // Init LeanCloud instance 
  if (configs.appId && configs.appKey)
    AV.initialize(configs.appId, configs.appKey);

  // Fill default callbacks.
  ['successCallback', 'errorCallback'].forEach(function(type){
    if (!self.configs[type])
      self.configs[type] = function(){};
  });

  // Start a logger server instance if you need.
  if (!module.parent)
    this.server = startLoggerServer();
}

logger.prototype.log = log;

function log(data, successCallback, errorCallback) {
  var baby = new Log();

  baby.save(data, {
    success: successCallback || this.configs.successCallback,
    error: errorCallback || this.configs.errorCallback
  });

  return baby;
}

function startLoggerServer() {
  var morgan = require("morgan");
  var express = require('express');
  var compress = require('compression');
  var bodyParser = require('body-parser');
  
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
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  // Logger API
  app.post('/', logRoute);

  function logRoute(req, res, next) {
    var token = req.headers['logger-token'];
    var details = req.body;

    if (!token || !details || token !== configs.token)
      return res.json(responseWith('fail'));

    log(details, successCallback, errorCallback);

    function responseWith(status) {
      return {
        status: status
      };
    }

    function successCallback(data) {
      res.json(responseWith('ok'));
    }

    function errorCallback(data, err) {
      debug('error:');
      debug(err);
      debug(req.body);

      res.json(responseWith('error'));
    }
  }

  // Start
  app.listen(app.get('port'));

  debug('Started, NODE_ENV=%s, PORT=%s', app.get('env'), app.get('port'));

  return app;
}
