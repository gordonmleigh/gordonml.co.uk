/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

module.exports = function (app) {
  var blogEngine = app.services.blogEngine;

  return function homeCtrl(request, response) {
    response.render('list', {
      page: blogEngine.getPosts(request.query.p),
      title: 'Home',
      url: request.path
    });
  };
};