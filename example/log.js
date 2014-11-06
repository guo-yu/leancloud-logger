var pkg = require('./package.json');
var debug = require('debug')(pkg.name + ':example');
var Logger = require('../logger');
var log = new Logger(require('../configs.js'));

log({
  ua: 'iOS',
  crashed: true,
  time: new Date().getTime()
}, function(result){
  debug('log success');
  debug(result);
});