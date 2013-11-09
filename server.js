#!/usr/bin/env node
/**
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

var config = require('./server/config/options.js')(__dirname, process.argv),
    logger = require('./server/config/logger.js'),
    WebApp = require('./server/lib/webapp.js'),
    BlogEngine = require('./server/lib/blogengine.js'),
    routes = require('./server/config/routes.js');


logger.info('-------- STARTING --------');

var webapp = new WebApp(config, logger),
    blogengine = new BlogEngine(webapp);

routes(webapp);
blogengine.init();
webapp.start();