var pkg = require('../package.json');
var debug = require('debug')(pkg.name + ':example');
var Logger = require('../logger');
var logger = new Logger(require('../configs.js'));

logger.log({
  ua: 'iOS 8.1.0',
  crashed: true,
  time: new Date().getTime()
}, function(result){
  debug('log success');
  debug(result);
});