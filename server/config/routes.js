/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

var path = require('path');

module.exports = function (webapp) {
  var postUrl = path.join(webapp.config.postUrl, ':url'),
      categoryUrl = path.join(webapp.config.categoryUrl, ':url'),
      tagUrl = path.join(webapp.config.tagUrl, ':url');

  function send404(request, response) {
    response.send(404);
  }

  webapp.setup(function (app, ctrl) {
    // explicitly send 404 for favicon and robots, so it doesn't get logged
    app.get('/favicon.ico', send404);
    app.get('/robots.txt', send404);

    // application routes
    app.get('/', ctrl('home'));
    app.get(postUrl, ctrl('post'));
    app.get(categoryUrl, ctrl('category'));
    app.get(tagUrl, ctrl('tag'));
  });
};