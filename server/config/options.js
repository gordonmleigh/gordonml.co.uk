/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

var fs = require('fs'),
    path = require('path'),
    lodash = require('lodash'),
    commander = require('commander');

module.exports = function (root, args) {

  var pkg = require(path.resolve(root, './package.json')),
      base = {},
      config;

  // set up the commandline options
  commander
    .version(pkg.version)
    .option('--dev', 'Allows some config options to be omitted')
    .option('--config [file]', 'Reads options from a file')
    .option('--listen [value]', 'Listen on port or socket [3000]', '3000')
    .option('--controllers [dir]', 'The directory to look in for controllers [server/controllers]', path.resolve(root, './server/controllers'))
    .option('--views [dir]', 'The directory to look in for views [server/views]', path.resolve(root, './server/views'))
    .option('--posts [dir]', 'The directory to look in for posts [server/posts]', path.resolve(root, './posts'))
    .option('--static [dir]', 'The directory to serve static files from [static]', path.resolve(root, './static'))
    .option('--post-url [url]', 'The root url for posts [/post]', '/post')
    .option('--category-url [url]', 'The root url for categories [/category]', '/category')
    .option('--tag-url [url]', 'The root url for tags [/tag]', '/tag')
    .option('--page-size [n]', 'The number of posts per page [10]', 10)
    .parse(args);

  if (commander.config) {
    base = JSON.parse(fs.readFileSync(commander.config));
  }

  config = lodash.extend(base, { package: pkg }, commander);

  return config;
};