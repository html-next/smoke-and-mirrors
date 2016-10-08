/* jshint node:true */
// jscs:disable
/* global module */
let pkg = require('../../../package.json');

module.exports = function(environment) {
  let DEBUG = false;

  let ENV = {
    modulePrefix: 'dummy',
    podModulePrefix: 'dummy/screens',
    environment,
    rootURL: '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {},
      EXTEND_PROTOTYPES: false
    },

    VERSION: pkg.version,

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  ENV.contentSecurityPolicy = {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
    'font-src': "'self'",
    'connect-src': "'self'",
    'img-src': "'self' data: http://lorempixel.com",
    'style-src': "'self' 'unsafe-inline'",
    'media-src': "'self' data: http://lorempixel.com"
  };

  // debugging
  if (DEBUG) {
    ENV.APP.LOG_LFANIMATION_RESOLUTION = true;
    ENV.APP.debugMode = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_BINDINGS = true;
    ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_STACKTRACE_ON_DEPRECATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VERSION = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
  } else {
    ENV.APP.LOG_LFANIMATION_RESOLUTION = false;
    ENV.APP.debugMode = false;
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_BINDINGS = false;
    ENV.APP.LOG_RESOLVER = false;
    ENV.APP.LOG_STACKTRACE_ON_DEPRECATION = false;
    ENV.APP.LOG_TRANSITIONS = false;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
    ENV.APP.LOG_VERSION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
  }

  if (environment === 'production') {
    ENV.rootURL = 'smoke-and-mirrors';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';
    ENV.APP.rootElement = '#ember-testing';
  }

  return ENV;
};
