/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

module.exports = function (app) {
  var blogEngine = app.services.blogEngine;

  return function postCtrl(request, response, next) {
    var post = blogEngine.getPost(request.params.url);
    // send 404 if post does not exist.
    if (!post) {
      next();
    } else {
      response.render('post', {
        post: post,
        title: post.attributes.title,
        url: request.path
      });
    }
  };
};