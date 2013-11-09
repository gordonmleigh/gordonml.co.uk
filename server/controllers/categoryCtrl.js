/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

module.exports = function (app) {
  var blogEngine = app.services.blogEngine;

  return function categoryCtrl(request, response, next) {
    var category = blogEngine.lookupCategory(request.params.url),
        posts;

    if (!category) {
      next();
    } else {
      posts = blogEngine.getPostsForCategory(category, request.query.p);

      response.render('list', {
        page: posts,
        title: category,
        heading: 'All posts in "' + category + '"',
        url: request.path
      });
    }
  };
};