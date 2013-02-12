var nconf = require('nconf');

//
// 1. any overrides
//
nconf.overrides({
});

//
// 2. `process.env`
// 3. `process.argv`
//
nconf.env().argv();

//
// 4. Any default values
//
nconf.defaults({
  FACEBOOK_APP_ID:        "<replace with your facebook app id>",
  FACEBOOK_APP_SECRET:    "<replace with your facebook secret>",
  FACEBOOK_APP_NAMESPACE: "<replace with your facebook canvas namespace>"
});

//export nconf object
module.exports = nconf;
