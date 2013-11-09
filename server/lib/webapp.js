/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs');


/**
 * Application constructor.
 */
function WebApp(config, logger) {
  var self = this,
      app;
  // show a warning if running in dev mode
  if (config.dev) {
    logger.warn('Starting server in development mode!');
  }
  self.services = {};
  self.config = config;
  self.controllersDir = config.controllers || '../controllers';
  self.controllers = {};
  self.log = logger;
  // create a new express app
  self.app = app = express();
  // set up middleware
  app.set('views', config.views);
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(app.router);
  // static files
  app.use(express.static(config.static));
  // fallback to 404
  app.use(self.make404Handler());
  // error handler
  app.use(self.makeErrorHandler());
}


/**
 * Sets up the Express app.
 */
WebApp.prototype.setup = function (callback) {
  callback(this.app, this.controller.bind(this));
};


/**
 * Loads a controller by name.
 */
WebApp.prototype.controller = function (name) {
  var self = this,
      filename;
  // check cache first
  if (name in self.controllers) {
    return self.controllers[name];
  } else {
    // load controller from default directory
    filename = path.join(self.controllersDir, name + 'Ctrl.js');
    return self.controllers[name] = require(filename)(self);
  }
};


/**
 * Entry point for the web application.
 */
WebApp.prototype.start = function () {
  var self = this,
      socket = false,
      listen;

  if (!isNaN(+self.config.listen)) {
    listen = +self.config.listen;
    self.log.info('Listening on port %s', listen);
  } else {
    listen = self.config.listen;
    socket = true;
    self.log.info('Listening on socket file "%s"', listen);
  }
  // set permissions for socket file if necessary
  self.app.listen(listen, function(err) {
    if (err) {
      self.log.error(err);
    } else if (socket) {
      fs.chmodSync(listen, parseInt('770', 8));
    }
  });
};


/**
 * Middleware for handling errors.
 */
WebApp.prototype.makeErrorHandler = function () {
  var self = this;
  return function (error, request, result, next) {
    /*jshint unused:false*/
    self.log.error(error.toString());
    result.status(500);
    result.render('500', {error: error});
  };
};

/**
 * Middleware for handling errors.
 */
WebApp.prototype.make404Handler = function () {
  var self = this;
  return function (request, result) {
    /*jshint unused:false*/
    self.log.error('Not found: '+request.path);
    result.status(404);
    result.render('404', {path: request.path});
  };
};

module.exports = WebApp;