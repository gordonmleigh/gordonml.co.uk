/**
 * stugomgmt - Stugo management system
 *
 * Copyright (C) Gordon Mackenzie-Leigh
 */

'use strict';

var moment = require('moment'),
    winston = require('winston');

// set up winston logger
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  colorize: true,
  timestamp: function () {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  }
});

module.exports = winston;