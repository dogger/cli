#!/usr/bin/env node

import 'array-flat-polyfill';

import yargs = require('yargs');
import compose = require('./commands/compose-up');

var command = yargs
  .command(compose)
  .option('dogger-token', {
    describe: 'The Dogger access token to use with the request. If not specified, will fetch a new token automatically.'
  })
  .version(false);

export = command;