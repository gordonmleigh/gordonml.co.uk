/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';


var path = require('path'),
    fs = require('fs'),
    q = require('q'),
    readFile = q.denodeify(fs.readFile),
    glob = q.denodeify(require('glob')),
    lodash = require('lodash'),
    moment = require('moment'),
    hljs = require('highlight.js'),
    jsonFrontMatter = require('json-front-matter'),
    marked = require('marked'),
    moreMark = '<!-- more -->';

// set up markdown parser
marked.setOptions({
  gfm: true,
  highlight: function (code, lang) {
    return hljs.highlight(lang, code).value;
  },
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-'
});

/**
 * A class for performing blog functions.
 */
function BlogEngine(app) {
  var self = this;
  app.services.blogEngine = self;
  self.postUrl = app.config.postUrl.replace(/\/?$/, '/');
  self.categoryUrl = app.config.categoryUrl.replace(/\/?$/, '/');
  self.tagUrl = app.config.tagUrl.replace(/\/?$/, '/');
  self.app = app;
  self.posts = [];
  self.urls = {};
  self.tags = {};
  self.categories = {};
  self.tagIndex = {};
  self.categoryIndex = {};
  self.pages = [];
  // register helpers
  app.setup(function (expressApp) {
    lodash.merge(expressApp.locals, self.makeHelpers(), {moment: moment});
  });
}


/**
 * Loads post files from the disk.
 */
BlogEngine.prototype.init = function () {
  var self = this;
  // make sure posts directory has been specified.
  if (!self.app.config.posts) {
    self.app.log.error('Posts directory not specified!');
    process.exit();
  }
  // get a list of all post files
  glob(path.join(self.app.config.posts, '**/*.md'))
    .then(function (files) {
      return q.all(lodash.map(files, self.loadPost, self));
    })
    .then(function (posts) {
      self.index(posts);
    })
    .done();
};


/**
 * Loads a single post from the disk.
 */
BlogEngine.prototype.loadPost = function (postFile) {
  var self = this,
      post, i, rel;

  return readFile(postFile, 'utf8')
    .then(function (text) {
      rel = path.relative(self.app.config.posts, postFile);
      self.app.log.info('Found post "%s"', rel);
      post = jsonFrontMatter.parse(text);
      // check post has a url
      if (!post.attributes.url) {
        self.app.log.error('Post "%s" has no URL, skipping', rel);
        return;
      }
      // render markdown
      post.body = marked(post.body);
      // get summary
      i = post.body.indexOf(moreMark);
      if (i >= 0) {
        post.summary = post.body.substr(0, i);
        post.body = post.summary + post.body.substr(i);
        post.attributes.more = true;
      } else {
        post.summary = post.body;
      }
      // return the post
      return post;
    });
};


/**
 * Sorts and indexes the posts.
 */
BlogEngine.prototype.index = function (posts) {
  var self = this,
      list, tags, i, url, category;
  // sort posts descending by date
  self.posts = lodash.sortBy(posts, function (p) {
    if (!p.attributes.date) {
      return 0;
    } else {
      return -(new Date(p.attributes.date).getTime());
    }
  });
  // index the posts
  lodash.each(self.posts, function (post) {
    // index url
    self.urls[post.attributes.url] = post;
    // index category
    if (category = post.attributes.category) {
      list = self.categoryIndex[category];
      if (!list) {
        self.categoryIndex[category] = [post];
      } else {
        list.push(post);
      }
      // ensure category is in list
      if (!(category in self.categories)) {
        url = self.makeUrl(category);
        self.categories[url] = category;
      }
    }
    // index tags
    tags = post.attributes.tags;
    if (tags && Array.isArray(tags)) {
      for (i = 0; i < tags.length; ++i) {
        list = self.tagIndex[tags[i]];
        if (!list) {
          self.tagIndex[tags[i]] = [post];
        } else {
          list.push(post);
        }
        // ensure tag is in list
        if (!(tags[i] in self.tags)) {
          url = self.makeUrl(tags[i]);
          self.tags[url] = tags[i];
        }
      }
    }
    // index pages
    if (post.attributes.page) {
      self.pages.push(post);
    }
  });
};


/**
 * Returns a set of functions to be used as helpers in views.
 */
BlogEngine.prototype.makeHelpers = function () {
  var self = this;

  return {
    postUrl: function (post) {
      return self.postUrl + post.attributes.url;
    },

    categoryUrl: function (category) {
      return self.categoryUrl + self.makeUrl(category);
    },

    tagUrl: function (tag) {
      return self.tagUrl + self.makeUrl(tag);
    },

    active: function (url, compare, active, none) {
      return (url === compare ? active || 'active' : none || '');
    }
  };
};


/**
 * Turns text into a url.
 */
BlogEngine.prototype.makeUrl = function (text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};


/**
 * Gets a list of posts.
 */
BlogEngine.prototype.getPosts = function (page) {
  return this.getPage(this.posts, page);
};


/**
 * Gets a list of posts for the category.
 */
BlogEngine.prototype.getPostsForCategory = function (category, page) {
  return this.getPage(this.categoryIndex[category], page);
};


/**
 * Gets a list of posts for the tag.
 */
BlogEngine.prototype.getPostsForTag = function (tag, page) {
  return this.getPage(this.tagIndex[tag], page);
};


BlogEngine.prototype.getPage = function (posts, page) {
  var self = this,
      n = self.app.config.pageSize,
      i;
  // check that posts has been supplied
  if (!posts) {
    return false;
  }
  // cast page to number
  page = +page;
  // default to first page
  if (isNaN(page)) {
    page = 1;
  }
  // first page
  i = (page - 1) * n;

  return {
    posts: posts.slice(i, i+n),
    pages: Math.ceil(posts.length / n),
    current: page,
    count: posts.length
  };
};


/**
 * Returns the name of a category from the url.
 */
BlogEngine.prototype.lookupCategory = function (url) {
  return this.categories[url];
};


/**
 * Returns the name of a tag from the url.
 */
BlogEngine.prototype.lookupTag = function (url) {
  return this.tags[url];
};


/**
 * Gets a single post by url.
 */
BlogEngine.prototype.getPost = function (url) {
  var post = this.urls[url];
  return post ? post : false;
};


module.exports = BlogEngine;