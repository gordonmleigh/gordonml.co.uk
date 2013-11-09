/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

module.exports = function (app) {
  var blogEngine = app.services.blogEngine;

  return function tagCtrl(request, response, next) {
    var tag = blogEngine.lookupTag(request.params.url),
        posts;

    if (!tag) {
      next();
    } else {
      posts = blogEngine.getPostsForTag(tag, request.query.p);

      response.render('list', {
        page: posts,
        title: tag,
        heading: 'All posts tagged "' + tag + '"',
        url: request.path
      });
    }
  };
};