const path = require('path');

module.exports = function override(config) {
  // Remove ForkTsCheckerWebpackPlugin
  config.plugins = config.plugins.filter(
    plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
  );
  
  return config;
};
