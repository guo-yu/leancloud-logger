var path = require('path');
var AV = require('avoscloud-sdk').AV;
var pkg = require('./package.json');
var debug = require('debug')(pkg.name);
var standalone = !module.parent;

debug('standalone mode: %s', standalone);

module.exports = logger;

function logger(configs) {
  var self = this;
  // Load configs from local file
  if (!configs && standalone) {
    try {
      var configs = require('./configs');
    } catch (err) {
      throw err;
    }
  }

  debug(configs);

  this.configs = configs;

  if (!configs)
    throw new Error('LeanCloud configs are required.');

  // Init LeanCloud instance 
  if (configs.appId && configs.appKey)
    AV.initialize(configs.appId, configs.appKey);

  if (!this.configs.logKey)
    this.configs.logKey = 'Log';

  this.Log = AV.Object.extend(this.configs.logKey);

  // Fill default callbacks.
  ['successCallback', 'errorCallback'].forEach(function(type){
    if (!self.configs[type])
      self.configs[type] = function(){};
  });

  if (standalone)
    this.server = startLoggerServer(configs);
}

logger.prototype.log = log;

function log(data, successCallback, errorCallback) {
  debug(data);
  
  var baby = new this.Log();

  baby.save(data, {
    success: successCallback || this.configs.successCallback,
    error: errorCallback || this.configs.errorCallback
  });

  return baby;
}

function startLoggerServer(configs) {
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

    debug(token);

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

if (standalone)
  logger();
