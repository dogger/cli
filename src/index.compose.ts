#!/usr/bin/env node

import 'array-flat-polyfill';

import yargs = require('yargs');
import compose = require('./commands/compose-up');

var command = yargs
  .command(compose)
  .option('token', {
    describe: 'The Dogger access token to use with the request. If not specified, will fetch a new token automatically.'
  })
  .option('verbose', {
    describe: 'If set, the Dogger CLI will output every request and response that is received or sent to/from the server.'
  })
  .version(false);

export = command;