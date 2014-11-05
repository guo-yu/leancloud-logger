var path = require('path');
var logger = require("morgan");
var express = require('express');
var compress = require('compression');
var bodyParser = require('body-parser');

var pkg = require('./package.json');
var debug = require('debug')(pkg.name + ':v' + pkg.version);

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

  // Start
  app.listen(app.get('port'));

  debug('Started, NODE_ENV=%s, PORT=%s', app.get('env'), app.get('port'));
}
